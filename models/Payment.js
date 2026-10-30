import { query } from '../config/database.js';

export class Payment {
  // Create new payment record
  static async create(paymentData) {
    try {
      const {
        user_id, amount, currency = 'INR', payment_method,
        transaction_id, payment_gateway, status = 'pending',
        payment_type, description, metadata = {}
      } = paymentData;

      const result = await query(
        `INSERT INTO payments (
          user_id, amount, currency, payment_method, transaction_id,
          payment_gateway, status, payment_type, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          user_id, amount, currency, payment_method, transaction_id,
          payment_gateway, status, payment_type, description, metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Find payment by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT p.*, 
               u.first_name, u.last_name, u.email,
               up.plan_name, up.features, up.duration_months
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN user_plans up ON p.id = up.payment_id
        WHERE p.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      throw error;
    }
  }

  // Find payment by transaction ID
  static async findByTransactionId(transactionId) {
    try {
      const result = await query(
        'SELECT * FROM payments WHERE transaction_id = $1',
        [transactionId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding payment by transaction ID:', error);
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(id, status, gatewayResponse = null) {
    try {
      const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
      const queryParams = [id, status];
      let paramIndex = 3;

      if (gatewayResponse) {
        updateFields.push(`metadata = metadata || $${paramIndex++}`);
        queryParams.push(JSON.stringify(gatewayResponse));
      }

      const result = await query(
        `UPDATE payments SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get payments by user
  static async getByUser(userId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE p.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.status) {
        whereClause += ` AND p.status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.payment_type) {
        whereClause += ` AND p.payment_type = $${paramIndex++}`;
        queryParams.push(filters.payment_type);
      }
      if (filters.payment_gateway) {
        whereClause += ` AND p.payment_gateway = $${paramIndex++}`;
        queryParams.push(filters.payment_gateway);
      }
      if (filters.date_from) {
        whereClause += ` AND p.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND p.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT p.*, 
               up.plan_name, up.features, up.duration_months,
               up.start_date as plan_start_date, up.end_date as plan_end_date
        FROM payments p
        LEFT JOIN user_plans up ON p.id = up.payment_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting payments by user:', error);
      throw error;
    }
  }

  // Get payments with filters
  static async getAll(filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      // Add filters
      if (filters.status) {
        whereClause += ` AND p.status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.payment_type) {
        whereClause += ` AND p.payment_type = $${paramIndex++}`;
        queryParams.push(filters.payment_type);
      }
      if (filters.payment_gateway) {
        whereClause += ` AND p.payment_gateway = $${paramIndex++}`;
        queryParams.push(filters.payment_gateway);
      }
      if (filters.user_id) {
        whereClause += ` AND p.user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }
      if (filters.amount_min) {
        whereClause += ` AND p.amount >= $${paramIndex++}`;
        queryParams.push(filters.amount_min);
      }
      if (filters.amount_max) {
        whereClause += ` AND p.amount <= $${paramIndex++}`;
        queryParams.push(filters.amount_max);
      }
      if (filters.date_from) {
        whereClause += ` AND p.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND p.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT p.*, 
               u.first_name, u.last_name, u.email,
               up.plan_name, up.features
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN user_plans up ON p.id = up.payment_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  }

  // Get payment count with filters
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      // Add filters
      if (filters.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.payment_type) {
        whereClause += ` AND payment_type = $${paramIndex++}`;
        queryParams.push(filters.payment_type);
      }
      if (filters.user_id) {
        whereClause += ` AND user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }

      const result = await query(`
        SELECT COUNT(*) as count
        FROM payments
        ${whereClause}
      `, queryParams);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting payment count:', error);
      throw error;
    }
  }

  // Get payment statistics
  static async getStats(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END), 0) as avg_payment,
          COUNT(CASE WHEN payment_type = 'premium_plan' THEN 1 END) as premium_plan_payments,
          COUNT(CASE WHEN payment_type = 'featured_job' THEN 1 END) as featured_job_payments,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as payments_last_30_days,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as payments_last_7_days
        FROM payments
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  // Get payment trends
  static async getTrends(days = 30, filters = {}) {
    try {
      let whereClause = `WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'`;
      const queryParams = [];

      if (filters.payment_type) {
        whereClause += ` AND payment_type = $1`;
        queryParams.push(filters.payment_type);
      }

      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as payment_count,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as daily_revenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
        FROM payments
        ${whereClause}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting payment trends:', error);
      throw error;
    }
  }

  // Get revenue by payment type
  static async getRevenueByType(filters = {}) {
    try {
      let whereClause = 'WHERE status = $1';
      const queryParams = ['completed'];
      let paramIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT 
          payment_type,
          COUNT(*) as payment_count,
          COALESCE(SUM(amount), 0) as total_revenue,
          COALESCE(AVG(amount), 0) as avg_amount
        FROM payments
        ${whereClause}
        GROUP BY payment_type
        ORDER BY total_revenue DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting revenue by type:', error);
      throw error;
    }
  }

  // Get recent payments
  static async getRecent(limit = 10) {
    try {
      const result = await query(`
        SELECT p.*, 
               u.first_name, u.last_name, u.email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting recent payments:', error);
      throw error;
    }
  }

  // Refund payment
  static async refund(id, refundAmount = null, reason = null) {
    try {
      // Get payment details first
      const payment = await this.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      const actualRefundAmount = refundAmount || payment.amount;

      if (actualRefundAmount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      const result = await query(
        `UPDATE payments 
         SET status = 'refunded', 
             updated_at = CURRENT_TIMESTAMP,
             metadata = metadata || jsonb_build_object(
               'refund_amount', $2,
               'refund_reason', $3,
               'refunded_at', CURRENT_TIMESTAMP
             )
         WHERE id = $1 
         RETURNING *`,
        [id, actualRefundAmount, reason]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  // Get payment analytics
  static async getAnalytics(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT 
          -- Payment counts by status
          COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
          COUNT(*) FILTER (WHERE status = 'refunded') as refunded_count,
          
          -- Revenue metrics
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_revenue,
          COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) as total_refunded,
          COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as avg_payment_amount,
          
          -- Payment type breakdown
          COUNT(*) FILTER (WHERE payment_type = 'premium_plan' AND status = 'completed') as premium_plan_count,
          COUNT(*) FILTER (WHERE payment_type = 'featured_job' AND status = 'completed') as featured_job_count,
          COUNT(*) FILTER (WHERE payment_type = 'resume_highlight' AND status = 'completed') as resume_highlight_count,
          
          -- Gateway breakdown
          COUNT(*) FILTER (WHERE payment_gateway = 'razorpay' AND status = 'completed') as razorpay_count,
          COUNT(*) FILTER (WHERE payment_gateway = 'stripe' AND status = 'completed') as stripe_count,
          COUNT(*) FILTER (WHERE payment_gateway = 'paypal' AND status = 'completed') as paypal_count,
          
          -- Time-based metrics
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours') as payments_last_24h,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as payments_last_7d,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as payments_last_30d,
          
          -- Revenue by time period
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '24 hours'), 0) as revenue_last_24h,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as revenue_last_7d,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_last_30d
          
        FROM payments
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }

  // Get top customers by revenue
  static async getTopCustomers(limit = 10, filters = {}) {
    try {
      let whereClause = 'WHERE p.status = $1';
      const queryParams = ['completed'];
      let paramIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND p.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND p.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(p.id) as payment_count,
          COALESCE(SUM(p.amount), 0) as total_spent,
          COALESCE(AVG(p.amount), 0) as avg_payment,
          MIN(p.created_at) as first_payment,
          MAX(p.created_at) as last_payment
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ${whereClause}
        GROUP BY u.id, u.first_name, u.last_name, u.email
        HAVING COUNT(p.id) > 0
        ORDER BY total_spent DESC
        LIMIT $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting top customers:', error);
      throw error;
    }
  }

  // Get monthly revenue report
  static async getMonthlyRevenue(year = null) {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const result = await query(`
        SELECT 
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as payment_count,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as revenue,
          COALESCE(SUM(amount) FILTER (WHERE status = 'refunded'), 0) as refunded_amount,
          COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as avg_payment
        FROM payments
        WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY month
      `, [targetYear]);

      return result.rows;
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      throw error;
    }
  }

  // Get payment failure analysis
  static async getFailureAnalysis(days = 30) {
    try {
      const result = await query(`
        SELECT 
          payment_gateway,
          payment_method,
          payment_type,
          COUNT(*) as failure_count,
          COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as failure_percentage,
          MIN(created_at) as first_failure,
          MAX(created_at) as last_failure
        FROM payments
        WHERE status = 'failed' 
          AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY payment_gateway, payment_method, payment_type
        ORDER BY failure_count DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting failure analysis:', error);
      throw error;
    }
  }
}

export default Payment;
