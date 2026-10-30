import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get premium plans
router.get('/plans', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM premium_plans WHERE is_active = true ORDER BY price ASC'
    );

    res.json({
      success: true,
      data: result.rows
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
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Get plan details
    const planResult = await query(
      'SELECT * FROM premium_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const plan = planResult.rows[0];
    const amount = Math.round(plan.price * 100); // Convert to paise

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `premium_plan_${plan_id}_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
        plan_id: plan_id,
        plan_name: plan.name
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const paymentResult = await query(
      `INSERT INTO payments (user_id, plan_id, razorpay_order_id, amount, currency, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, 'created', CURRENT_TIMESTAMP) RETURNING *`,
      [userId, plan_id, order.id, plan.price, 'INR']
    );

    res.json({
      success: true,
      data: {
        order: order,
        payment: paymentResult.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// Verify payment and activate premium
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan_id
    } = req.body;

    const userId = req.user.userId;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are required'
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE razorpay_order_id = $1 AND user_id = $2',
      [razorpay_order_id, userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    const payment = paymentResult.rows[0];

    // Update payment record
    await query(
      `UPDATE payments SET 
       razorpay_payment_id = $1, 
       razorpay_signature = $2, 
       status = 'completed', 
       paid_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [razorpay_payment_id, razorpay_signature, payment.id]
    );

    // Get plan details
    const planResult = await query(
      'SELECT * FROM premium_plans WHERE id = $1',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const plan = planResult.rows[0];

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

    // Update user premium status
    await query(
      `UPDATE app_users SET 
       is_premium = true, 
       premium_plan_id = $1, 
       premium_expiry = $2, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [plan_id, expiryDate, userId]
    );

    // Get updated user details
    const userResult = await query(
      `SELECT u.*, p.name as plan_name, p.features as plan_features 
       FROM app_users u 
       LEFT JOIN premium_plans p ON u.premium_plan_id = p.id 
       WHERE u.id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Payment verified and premium activated successfully',
      data: {
        payment: {
          ...payment,
          status: 'completed',
          razorpay_payment_id,
          razorpay_signature
        },
        user: userResult.rows[0],
        plan: plan
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, pl.name as plan_name, pl.duration_days
       FROM payments p
       LEFT JOIN premium_plans pl ON p.plan_id = pl.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM payments WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        payments: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].total / limit),
          total_records: parseInt(countResult.rows[0].total)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all payments (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (using role from JWT token)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      whereClause = 'WHERE p.status = $1';
      queryParams.push(status);
      paramIndex++;
    }

    const result = await query(
      `SELECT p.*, u.name as user_name, u.email as user_email, pl.name as plan_name
       FROM payments p
       LEFT JOIN app_users u ON p.user_id = u.id
       LEFT JOIN premium_plans pl ON p.plan_id = pl.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countQuery = whereClause 
      ? `SELECT COUNT(*) as total FROM payments p ${whereClause}`
      : 'SELECT COUNT(*) as total FROM payments p';
    
    const countResult = await query(countQuery, queryParams);

    res.json({
      success: true,
      data: {
        payments: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].total / limit),
          total_records: parseInt(countResult.rows[0].total)
        }
      }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel premium subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current user premium status
    const userResult = await query(
      'SELECT * FROM app_users WHERE id = $1 AND is_premium = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active premium subscription found'
      });
    }

    // Update user to cancel premium (will expire naturally)
    await query(
      `UPDATE app_users SET 
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Premium subscription cancelled. You will continue to have premium benefits until the current subscription expires.',
      data: {
        premium_expiry: userResult.rows[0].premium_expiry
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Check premium status
router.get('/premium-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT u.*, p.name as plan_name, p.features as plan_features
       FROM app_users u
       LEFT JOIN premium_plans p ON u.premium_plan_id = p.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Check if premium is still valid
    const isPremiumValid = user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();

    res.json({
      success: true,
      data: {
        is_premium: isPremiumValid,
        premium_expiry: user.premium_expiry,
        plan_name: user.plan_name,
        plan_features: user.plan_features,
        days_remaining: user.premium_expiry ? Math.ceil((new Date(user.premium_expiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    console.error('Check premium status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all subscriptions (admin only)
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (using role from JWT token)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, status, plan, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.is_premium = true';
    let queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause += ` AND (CASE WHEN u.premium_expiry > CURRENT_TIMESTAMP THEN 'active' ELSE 'expired' END) = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (plan && plan !== 'all') {
      whereClause += ` AND LOWER(p.name) = LOWER($${paramIndex})`;
      queryParams.push(plan);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (LOWER(u.name) LIKE LOWER($${paramIndex}) OR LOWER(u.email) LIKE LOWER($${paramIndex}))`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const result = await query(
      `SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.premium_expiry as next_billing_date,
        p.name as plan,
        p.price as amount,
        CASE 
          WHEN p.duration_days = 30 THEN 'monthly'
          WHEN p.duration_days = 90 THEN 'quarterly'
          WHEN p.duration_days = 365 THEN 'yearly'
          ELSE 'one-time'
        END as billing_cycle,
        CASE 
          WHEN u.premium_expiry > CURRENT_TIMESTAMP THEN 'active'
          WHEN u.premium_expiry <= CURRENT_TIMESTAMP THEN 'expired'
          ELSE 'cancelled'
        END as status,
        (SELECT id FROM payments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_payment_id
       FROM app_users u
       LEFT JOIN premium_plans p ON u.premium_plan_id = p.id
       ${whereClause}
       ORDER BY u.premium_expiry DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM app_users u LEFT JOIN premium_plans p ON u.premium_plan_id = p.id ${whereClause}`;
    const countResult = await query(countQuery, queryParams);

    // Format the response to match what the frontend expects
    const subscriptions = result.rows.map(row => ({
      _id: row.user_id,
      user: {
        name: row.user_name,
        email: row.user_email
      },
      plan: row.plan?.toLowerCase() || 'basic',
      amount: row.amount || 0,
      billingCycle: row.billing_cycle || 'monthly',
      status: row.status,
      nextBillingDate: row.next_billing_date,
      lastPaymentId: row.last_payment_id
    }));

    res.json({
      success: true,
      subscriptions: subscriptions,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get subscription statistics (admin only)
router.get('/subscription-stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (using role from JWT token)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get total revenue from completed payments
    const revenueResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE status = \'completed\''
    );

    // Get active subscriptions count
    const activeSubscriptionsResult = await query(
      'SELECT COUNT(*) as active_count FROM app_users WHERE is_premium = true AND premium_expiry > CURRENT_TIMESTAMP'
    );

    // Get monthly revenue (last 30 days)
    const monthlyRevenueResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as monthly_revenue FROM payments WHERE status = \'completed\' AND created_at >= CURRENT_DATE - INTERVAL \'30 days\''
    );

    // Calculate churn rate (cancelled subscriptions in last 30 days / total subscriptions)
    const churnResult = await query(
      `SELECT 
        COUNT(*) as cancelled_count,
        (SELECT COUNT(*) FROM app_users WHERE is_premium = true) as total_count
       FROM app_users 
       WHERE is_premium = true 
       AND premium_expiry <= CURRENT_TIMESTAMP 
       AND premium_expiry >= CURRENT_DATE - INTERVAL '30 days'`
    );

    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue) || 0;
    const activeSubscriptions = parseInt(activeSubscriptionsResult.rows[0].active_count) || 0;
    const monthlyRevenue = parseFloat(monthlyRevenueResult.rows[0].monthly_revenue) || 0;
    
    const cancelledCount = parseInt(churnResult.rows[0].cancelled_count) || 0;
    const totalCount = parseInt(churnResult.rows[0].total_count) || 1;
    const churnRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      totalRevenue,
      activeSubscriptions,
      monthlyRevenue,
      churnRate: parseFloat(churnRate)
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel subscription (admin only)
router.put('/subscriptions/:id/cancel', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (using role from JWT token)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const subscriptionId = req.params.id;

    // Update user to cancel premium immediately
    await query(
      `UPDATE app_users SET 
       is_premium = false, 
       premium_plan_id = NULL, 
       premium_expiry = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [subscriptionId]
    );

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Process refund (admin only)
router.post('/refund/:paymentId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (using role from JWT token)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const paymentId = req.params.paymentId;

    // Update payment status to refunded
    await query(
      `UPDATE payments SET 
       status = 'refunded', 
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [paymentId]
    );

    res.json({
      success: true,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

export default router;
