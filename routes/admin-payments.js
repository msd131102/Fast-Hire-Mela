import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllPayments,
  getPaymentStats,
  exportPayments,
  getAllSubscriptions,
  getSubscriptionStats,
  exportSubscriptions
} from '../controllers/payments.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Payment Management Routes
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/export', exportPayments);

// Subscription Management Routes
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/stats', getSubscriptionStats);
router.get('/subscriptions/export', exportSubscriptions);

export default router;
