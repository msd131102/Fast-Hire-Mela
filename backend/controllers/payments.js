import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
const prisma = new PrismaClient();

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
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (paymentMethod) {
      where.payment_method = paymentMethod;
    }
    
    if (startDate || endDate) {
      where.payment_date = {};
      if (startDate) where.payment_date.gte = new Date(startDate);
      if (endDate) where.payment_date.lte = new Date(endDate);
    }

    if (search) {
      where.app_users = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Get payments and total count
    const [payments, totalCount] = await Promise.all([
      prisma.payment_transactions.findMany({
        where,
        take: limitNum,
        skip: offset,
        include: {
          app_users: {
            select: { name: true, email: true }
          },
          premium_subscriptions: {
            select: { plan_name: true }
          }
        },
        orderBy: { payment_date: 'desc' }
      }),
      prisma.payment_transactions.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    // Format for frontend
    const formattedPayments = payments.map(p => ({
      ...p,
      user_name: p.app_users?.name,
      user_email: p.app_users?.email,
      plan_name: p.premium_subscriptions?.plan_name
    }));

    res.json({
      success: true,
      data: {
        payments: formattedPayments,
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
    
    const where = {};
    if (startDate || endDate) {
      where.payment_date = {};
      if (startDate) where.payment_date.gte = new Date(startDate);
      if (endDate) where.payment_date.lte = new Date(endDate);
    }

    // Get overview stats
    const totalPayments = await prisma.payment_transactions.count({ where });
    const successfulPayments = await prisma.payment_transactions.count({ where: { ...where, status: 'completed' } });
    const failedPayments = await prisma.payment_transactions.count({ where: { ...where, status: 'failed' } });
    const pendingPayments = await prisma.payment_transactions.count({ where: { ...where, status: 'pending' } });
    
    const revenueAggr = await prisma.payment_transactions.aggregate({
      _sum: { amount: true },
      where: { ...where, status: 'completed' }
    });

    const overview = {
      totalRevenue: Number(revenueAggr._sum.amount || 0),
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments
    };

    // Note: detailed monthly and method stats can be approximated or done via raw queries.
    // Simplifying for now since schema changed.
    res.json({
      success: true,
      data: {
        overview,
        monthlyStats: [], // Needs raw query or groupBy
        paymentMethods: [] // Needs groupBy
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
    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.payment_method = paymentMethod;
    if (startDate || endDate) {
      where.payment_date = {};
      if (startDate) where.payment_date.gte = new Date(startDate);
      if (endDate) where.payment_date.lte = new Date(endDate);
    }

    // Get all payments (no pagination for export)
    const payments = await prisma.payment_transactions.findMany({
      where,
      include: {
        app_users: { select: { name: true, email: true } },
        premium_subscriptions: { select: { plan_name: true } }
      },
      orderBy: { payment_date: 'desc' }
    });

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
        p.app_users?.name || 'N/A',
        p.app_users?.email || 'N/A',
        p.premium_subscriptions?.plan_name || 'N/A',
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

    // Build filters
    const where = {};
    
    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive' || status === 'expired') {
      where.is_active = false;
    }
    
    if (planType) {
      where.plan_name = planType;
    }
    
    if (startDate || endDate) {
      where.started_at = {};
      if (startDate) where.started_at.gte = new Date(startDate);
      if (endDate) where.started_at.lte = new Date(endDate);
    }

    if (search) {
      where.app_users = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Get subscriptions and total count
    const [subscriptions, totalCount] = await Promise.all([
      prisma.premium_subscriptions.findMany({
        where,
        take: limitNum,
        skip: offset,
        include: {
          app_users: { select: { name: true, email: true } },
          premium_plans: { select: { price: true, duration_days: true } }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.premium_subscriptions.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    const formattedSubscriptions = subscriptions.map(s => ({
      ...s,
      user_name: s.app_users?.name,
      user_email: s.app_users?.email,
      plan_duration: s.premium_plans?.duration_days,
      plan_price: s.premium_plans?.price,
      status: s.is_active ? 'active' : 'expired'
    }));

    res.json({
      success: true,
      data: {
        subscriptions: formattedSubscriptions,
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
    const totalSubscriptions = await prisma.premium_subscriptions.count();
    const activeSubscriptions = await prisma.premium_subscriptions.count({ where: { is_active: true } });
    const expiredSubscriptions = await prisma.premium_subscriptions.count({ where: { is_active: false } });

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
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

    const where = {};
    if (status === 'active') where.is_active = true;
    if (status === 'expired') where.is_active = false;
    if (planType) where.plan_name = planType;
    if (startDate || endDate) {
      where.started_at = {};
      if (startDate) where.started_at.gte = new Date(startDate);
      if (endDate) where.started_at.lte = new Date(endDate);
    }

    const subscriptions = await prisma.premium_subscriptions.findMany({
      where,
      include: {
        app_users: { select: { name: true, email: true } },
        premium_plans: { select: { price: true, duration_days: true } }
      },
      orderBy: { created_at: 'desc' }
    });

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
        s.app_users?.name || 'N/A',
        s.app_users?.email || 'N/A',
        s.plan_name || 'N/A',
        s.premium_plans?.duration_days || 'N/A',
        s.premium_plans?.price || 'N/A',
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
