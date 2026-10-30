import { Payment } from '../models/Payment.js';
import { UserPlan } from '../models/UserPlan.js';
import { User } from '../models/User.js';

// Get all payments with filtering and pagination
export const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filters
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (paymentMethod) {
      filters.payment_gateway = paymentMethod;
    }
    
    if (startDate) {
      filters.date_from = startDate;
    }
    
    if (endDate) {
      filters.date_to = endDate;
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Get payments and total count
    const [payments, totalCount] = await Promise.all([
      Payment.getAll(filters, limitNum, offset),
      Payment.getCount(filters)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        payments: payments,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = {};
    if (startDate) filters.date_from = startDate;
    if (endDate) filters.date_to = endDate;

    // Get overview stats
    const overview = await Payment.getStats(filters);

    // Get monthly stats for the last 12 months
    const monthlyStats = await Payment.getMonthlyRevenue();

    // Get revenue by payment type
    const paymentMethods = await Payment.getRevenueByType(filters);

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: overview.total_revenue || 0,
          totalPayments: overview.total_payments || 0,
          successfulPayments: overview.completed_payments || 0,
          failedPayments: overview.failed_payments || 0,
          pendingPayments: overview.pending_payments || 0
        },
        monthlyStats: monthlyStats.map(stat => ({
          _id: {
            year: new Date().getFullYear(),
            month: stat.month
          },
          revenue: stat.revenue,
          payments: stat.payment_count
        })),
        paymentMethods: paymentMethods.map(method => ({
          _id: method.payment_type,
          count: method.payment_count,
          revenue: method.total_revenue
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

// Export payments data
export const exportPayments = async (req, res) => {
  try {
    const { format = 'csv', status, paymentMethod, startDate, endDate } = req.query;

    // Build filters
    const filters = {};
    
    if (status) filters.status = status;
    if (paymentMethod) filters.payment_gateway = paymentMethod;
    if (startDate) filters.date_from = startDate;
    if (endDate) filters.date_to = endDate;

    // Get all payments (no pagination for export)
    const payments = await Payment.getAll(filters);

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'Transaction ID',
        'User Name',
        'User Email',
        'Plan Name',
        'Amount',
        'Payment Method',
        'Status',
        'Created Date'
      ];

      const csvData = payments.map(payment => [
        payment.transaction_id || 'N/A',
        payment.user_name || 'N/A',
        payment.user_email || 'N/A',
        payment.plan_name || 'N/A',
        payment.amount || 0,
        payment.payment_gateway || 'N/A',
        payment.status || 'N/A',
        payment.created_at || 'N/A'
      ]);

      const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payments_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      // JSON format
      res.json({
        success: true,
        data: payments,
        exportedAt: new Date(),
        totalRecords: payments.length
      });
    }
  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export payments',
      error: error.message
    });
  }
};

// Get all subscriptions with filtering and pagination
export const getAllSubscriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      planType,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filters
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (planType) {
      filters.plan_type = planType;
    }
    
    if (startDate) {
      filters.date_from = startDate;
    }
    
    if (endDate) {
      filters.date_to = endDate;
    }

    if (search) {
      filters.search = search;
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Get subscriptions and total count
    const [subscriptions, totalCount] = await Promise.all([
      UserPlan.getAll(filters, limitNum, offset),
      UserPlan.getCount(filters)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        subscriptions: subscriptions,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

// Get subscription statistics
export const getSubscriptionStats = async (req, res) => {
  try {
    // Get overview stats
    const overview = await UserPlan.getStats();

    // Get monthly stats for the last 12 months
    const monthlyStats = await UserPlan.getMonthlyStats();

    // Get plan distribution stats
    const planStats = await UserPlan.getPlanDistribution();

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions: overview.total_subscriptions || 0,
          activeSubscriptions: overview.active_subscriptions || 0,
          expiredSubscriptions: overview.expired_subscriptions || 0,
          cancelledSubscriptions: overview.cancelled_subscriptions || 0
        },
        planStats: planStats.map(plan => ({
          _id: plan.plan_type,
          count: plan.subscription_count,
          activeCount: plan.active_count
        })),
        monthlyStats: monthlyStats.map(stat => ({
          _id: {
            year: new Date().getFullYear(),
            month: stat.month
          },
          subscriptions: stat.subscription_count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription statistics',
      error: error.message
    });
  }
};

// Export subscriptions data
export const exportSubscriptions = async (req, res) => {
  try {
    const { format = 'csv', status, planType, startDate, endDate } = req.query;

    // Build filters
    const filters = {};
    
    if (status) filters.status = status;
    if (planType) filters.plan_type = planType;
    if (startDate) filters.date_from = startDate;
    if (endDate) filters.date_to = endDate;

    // Get all subscriptions (no pagination for export)
    const subscriptions = await UserPlan.getAll(filters);

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'User Name',
        'User Email',
        'Plan Name',
        'Plan Duration',
        'Plan Price',
        'Status',
        'Start Date',
        'End Date',
        'Created Date'
      ];

      const csvData = subscriptions.map(subscription => [
        subscription.user_name || 'N/A',
        subscription.user_email || 'N/A',
        subscription.plan_name || 'N/A',
        subscription.plan_duration || 'N/A',
        subscription.plan_price || 'N/A',
        subscription.status || 'N/A',
        subscription.start_date || 'N/A',
        subscription.end_date || 'N/A',
        subscription.created_at || 'N/A'
      ]);

      const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      // JSON format
      res.json({
        success: true,
        data: subscriptions,
        exportedAt: new Date(),
        totalRecords: subscriptions.length
      });
    }
  } catch (error) {
    console.error('Error exporting subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscriptions',
      error: error.message
    });
  }
};
