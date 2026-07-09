import express from 'express';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Get premium plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.premium_plans.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });

    res.json({
      success: true,
      data: plans
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

    const plan = await prisma.premium_plans.findUnique({
      where: { id: parseInt(plan_id) }
    });

    if (!plan || !plan.is_active) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const amount = Math.round(Number(plan.price) * 100);

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `premium_plan_${plan_id}_${userId}_${Date.now()}`,
      notes: { user_id: userId, plan_id: plan_id, plan_name: plan.name }
    };

    const order = await razorpay.orders.create(options);

    // Create a pending subscription
    const pendingSub = await prisma.premium_subscriptions.create({
      data: {
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        currency: 'INR',
        is_active: false,
        expires_at: new Date(), // temporary
      }
    });

    // Create a pending transaction
    const transaction = await prisma.payment_transactions.create({
      data: {
        user_id: userId,
        subscription_id: pendingSub.id,
        razorpay_order_id: order.id,
        amount: plan.price,
        currency: 'INR',
        status: 'created'
      }
    });

    res.json({
      success: true,
      data: {
        order: order,
        payment: transaction,
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

    const transaction = await prisma.payment_transactions.findFirst({
      where: { razorpay_order_id, user_id: userId },
      include: { premium_subscriptions: true }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const plan = await prisma.premium_plans.findUnique({
      where: { id: parseInt(plan_id) }
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

    // Transaction to update both
    await prisma.$transaction([
      prisma.payment_transactions.update({
        where: { id: transaction.id },
        data: {
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          payment_date: new Date()
        }
      }),
      prisma.premium_subscriptions.update({
        where: { id: transaction.subscription_id },
        data: {
          is_active: true,
          started_at: new Date(),
          expires_at: expiryDate
        }
      })
    ]);

    const updatedSub = await prisma.premium_subscriptions.findUnique({
      where: { id: transaction.subscription_id },
      include: { premium_plans: true }
    });

    res.json({
      success: true,
      message: 'Payment verified and premium activated successfully',
      data: {
        payment: { ...transaction, status: 'completed' },
        subscription: updatedSub,
        plan: plan
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.payment_transactions.findMany({
        where: { user_id: userId },
        take: parseInt(limit),
        skip: offset,
        include: {
          premium_subscriptions: {
            include: { premium_plans: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.payment_transactions.count({ where: { user_id: userId } })
    ]);

    res.json({
      success: true,
      data: {
        payments: transactions,
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
    const activeSub = await prisma.premium_subscriptions.findFirst({
      where: { 
        user_id: userId, 
        is_active: true,
        expires_at: { gt: new Date() }
      },
      include: { premium_plans: true }
    });

    if (activeSub) {
      res.json({
        success: true,
        data: {
          is_premium: true,
          plan: activeSub.premium_plans,
          subscription: activeSub
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
