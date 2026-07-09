import express from 'express';
import pool, { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Get premium plans
router.get('/plans', async (req, res) => {
  try {
    const plansRes = await query(
      `SELECT * FROM premium_plans WHERE is_active = true ORDER BY price ASC`
    );

    res.json({
      success: true,
      data: plansRes.rows
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create Razorpay order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { plan_id } = req.body;
    const userId = req.user.userId;

    if (!plan_id) {
      return res.status(400).json({ success: false, message: 'Plan ID is required' });
    }

    const planRes = await query(
      `SELECT * FROM premium_plans WHERE id = $1`,
      [parseInt(plan_id)]
    );

    if (planRes.rows.length === 0 || !planRes.rows[0].is_active) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const plan = planRes.rows[0];
    const amount = Math.round(Number(plan.price) * 100);

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `premium_plan_${plan_id}_${userId}_${Date.now()}`,
      notes: { user_id: userId, plan_id: plan_id, plan_name: plan.name }
    };

    const order = await razorpay.orders.create(options);

    // Insert pending subscription
    const pendingSubRes = await query(
      `INSERT INTO premium_subscriptions 
       (user_id, plan_id, plan_name, amount, currency, is_active, expires_at) 
       VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [userId, plan.id, plan.name, plan.price, 'INR']
    );
    const pendingSubId = pendingSubRes.rows[0].id;

    // Insert pending transaction
    const transactionRes = await query(
      `INSERT INTO payment_transactions 
       (user_id, subscription_id, razorpay_order_id, amount, currency, status) 
       VALUES ($1, $2, $3, $4, $5, 'created') 
       RETURNING *`,
      [userId, pendingSubId, order.id, plan.price, 'INR']
    );

    res.json({
      success: true,
      data: {
        order: order,
        payment: transactionRes.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// Verify payment and activate premium
router.post('/verify', authenticateToken, async (req, res) => {
  let client;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan_id
    } = req.body;
    const userId = req.user.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification details are required' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const transactionRes = await query(
      `SELECT * FROM payment_transactions WHERE razorpay_order_id = $1 AND user_id = $2 LIMIT 1`,
      [razorpay_order_id, userId]
    );

    if (transactionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const transaction = transactionRes.rows[0];

    const planRes = await query(
      `SELECT * FROM premium_plans WHERE id = $1`,
      [parseInt(plan_id)]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const plan = planRes.rows[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

    // Execute transaction to update both
    client = await pool.connect();
    await client.query('BEGIN');

    await client.query(
      `UPDATE payment_transactions 
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'completed', payment_date = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [razorpay_payment_id, razorpay_signature, transaction.id]
    );

    await client.query(
      `UPDATE premium_subscriptions 
       SET is_active = true, started_at = CURRENT_TIMESTAMP, expires_at = $1 
       WHERE id = $2`,
      [expiryDate, transaction.subscription_id]
    );

    await client.query('COMMIT');

    const updatedSubRes = await query(
      `SELECT * FROM premium_subscriptions WHERE id = $1`,
      [transaction.subscription_id]
    );

    res.json({
      success: true,
      message: 'Payment verified and premium activated successfully',
      data: {
        payment: { ...transaction, status: 'completed' },
        subscription: updatedSubRes.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  } finally {
    if (client) client.release();
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [transactionsRes, totalRes] = await Promise.all([
      query(
        `SELECT pt.*, ps.plan_name, pp.name as premium_plan_name
         FROM payment_transactions pt
         LEFT JOIN premium_subscriptions ps ON pt.subscription_id = ps.id
         LEFT JOIN premium_plans pp ON ps.plan_id = pp.id
         WHERE pt.user_id = $1
         ORDER BY pt.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, parseInt(limit), parseInt(offset)]
      ),
      query(`SELECT COUNT(*) as total FROM payment_transactions WHERE user_id = $1`, [userId])
    ]);

    const total = parseInt(totalRes.rows[0].total);

    res.json({
      success: true,
      data: {
        payments: transactionsRes.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total
        }
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// Get premium status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const activeSubRes = await query(
      `SELECT ps.*, pp.name as premium_plan_name, pp.price as premium_plan_price
       FROM premium_subscriptions ps
       LEFT JOIN premium_plans pp ON ps.plan_id = pp.id
       WHERE ps.user_id = $1 AND ps.is_active = true AND ps.expires_at > CURRENT_TIMESTAMP
       ORDER BY ps.created_at DESC LIMIT 1`,
      [userId]
    );

    if (activeSubRes.rows.length > 0) {
      res.json({
        success: true,
        data: {
          is_premium: true,
          plan: { name: activeSubRes.rows[0].premium_plan_name, price: activeSubRes.rows[0].premium_plan_price },
          subscription: activeSubRes.rows[0]
        }
      });
    } else {
      res.json({
        success: true,
        data: { is_premium: false }
      });
    }
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch status' });
  }
});

export default router;
