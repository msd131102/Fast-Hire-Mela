import { query } from '../config/database.js';

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
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      whereClause += ` AND pt.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (paymentMethod) {
      whereClause += ` AND pt.payment_method = $${paramIndex++}`;
      params.push(paymentMethod);
    }
    
    if (startDate) {
      whereClause += ` AND pt.payment_date >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClause += ` AND pt.payment_date <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM payment_transactions pt
      LEFT JOIN app_users u ON pt.user_id = u.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT pt.*, u.name as user_name, u.email as user_email, ps.plan_name
      FROM payment_transactions pt
      LEFT JOIN app_users u ON pt.user_id = u.id
      LEFT JOIN premium_subscriptions ps ON pt.subscription_id = ps.id
      ${whereClause}
      ORDER BY pt.payment_date DESC NULLS LAST, pt.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const [paymentsRes, totalCountRes] = await Promise.all([
      query(dataQuery, [...params, limitNum, offset]),
      query(countQuery, params)
    ]);

    const totalCount = parseInt(totalCountRes.rows[0].total);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        payments: paymentsRes.rows,
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
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      whereClause += ` AND payment_date >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClause += ` AND payment_date <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    const statsRes = await query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_payments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
      FROM payment_transactions
      ${whereClause}
    `, params);

    const row = statsRes.rows[0] || {};
    
    const overview = {
      totalRevenue: Number(row.total_revenue || 0),
      totalPayments: Number(row.total_payments || 0),
      successfulPayments: Number(row.successful_payments || 0),
      failedPayments: Number(row.failed_payments || 0),
      pendingPayments: Number(row.pending_payments || 0)
    };

    res.json({
      success: true,
      data: {
        overview,
        monthlyStats: [], // Simplified for now
        paymentMethods: [] // Simplified for now
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

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      whereClause += ` AND pt.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (paymentMethod) {
      whereClause += ` AND pt.payment_method = $${paramIndex++}`;
      params.push(paymentMethod);
    }
    
    if (startDate) {
      whereClause += ` AND pt.payment_date >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClause += ` AND pt.payment_date <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    const paymentsRes = await query(`
      SELECT pt.*, u.name as user_name, u.email as user_email, ps.plan_name
      FROM payment_transactions pt
      LEFT JOIN app_users u ON pt.user_id = u.id
      LEFT JOIN premium_subscriptions ps ON pt.subscription_id = ps.id
      ${whereClause}
      ORDER BY pt.payment_date DESC NULLS LAST, pt.created_at DESC
    `, params);

    const payments = paymentsRes.rows;

    if (format === 'csv') {
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

      const csvData = payments.map(p => [
        p.transaction_id || 'N/A',
        p.user_name || 'N/A',
        p.user_email || 'N/A',
        p.plan_name || 'N/A',
        p.amount || 0,
        p.payment_method || 'N/A',
        p.status || 'N/A',
        p.payment_date || 'N/A'
      ]);

      const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payments_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
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

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status === 'active') {
      whereClause += ` AND ps.is_active = true`;
    } else if (status === 'inactive' || status === 'expired') {
      whereClause += ` AND ps.is_active = false`;
    }
    
    if (planType) {
      whereClause += ` AND ps.plan_name = $${paramIndex++}`;
      params.push(planType);
    }
    
    if (startDate) {
      whereClause += ` AND ps.started_at >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClause += ` AND ps.started_at <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM premium_subscriptions ps
      LEFT JOIN app_users u ON ps.user_id = u.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT ps.*, u.name as user_name, u.email as user_email, pp.duration_days as plan_duration, pp.price as plan_price
      FROM premium_subscriptions ps
      LEFT JOIN app_users u ON ps.user_id = u.id
      LEFT JOIN premium_plans pp ON ps.plan_id = pp.id
      ${whereClause}
      ORDER BY ps.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const [subscriptionsRes, totalCountRes] = await Promise.all([
      query(dataQuery, [...params, limitNum, offset]),
      query(countQuery, params)
    ]);

    const subscriptions = subscriptionsRes.rows.map(s => ({
      ...s,
      status: s.is_active ? 'active' : 'expired'
    }));

    const totalCount = parseInt(totalCountRes.rows[0].total);
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
    const statsRes = await query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_subscriptions,
        SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as expired_subscriptions
      FROM premium_subscriptions
    `);

    const row = statsRes.rows[0] || {};

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions: Number(row.total_subscriptions || 0),
          activeSubscriptions: Number(row.active_subscriptions || 0),
          expiredSubscriptions: Number(row.expired_subscriptions || 0),
          cancelledSubscriptions: 0
        },
        planStats: [],
        monthlyStats: []
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

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (status === 'active') {
      whereClause += ` AND ps.is_active = true`;
    } else if (status === 'expired') {
      whereClause += ` AND ps.is_active = false`;
    }
    
    if (planType) {
      whereClause += ` AND ps.plan_name = $${paramIndex++}`;
      params.push(planType);
    }
    
    if (startDate) {
      whereClause += ` AND ps.started_at >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      whereClause += ` AND ps.started_at <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    const subscriptionsRes = await query(`
      SELECT ps.*, u.name as user_name, u.email as user_email, pp.duration_days as plan_duration, pp.price as plan_price
      FROM premium_subscriptions ps
      LEFT JOIN app_users u ON ps.user_id = u.id
      LEFT JOIN premium_plans pp ON ps.plan_id = pp.id
      ${whereClause}
      ORDER BY ps.created_at DESC
    `, params);

    const subscriptions = subscriptionsRes.rows;

    if (format === 'csv') {
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

      const csvData = subscriptions.map(s => [
        s.user_name || 'N/A',
        s.user_email || 'N/A',
        s.plan_name || 'N/A',
        s.plan_duration || 'N/A',
        s.plan_price || 'N/A',
        s.is_active ? 'active' : 'expired',
        s.started_at || 'N/A',
        s.expires_at || 'N/A',
        s.created_at || 'N/A'
      ]);

      const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
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
