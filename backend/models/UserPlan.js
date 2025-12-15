import { query } from '../config/database.js';

export class UserPlan {
  // Create new user plan
  static async create(planData) {
    try {
      const {
        user_id, payment_id, plan_name, features, duration_months,
        start_date, end_date, is_active = true, auto_renew = false
      } = planData;

      const result = await query(
        `INSERT INTO user_plans (
          user_id, payment_id, plan_name, features, duration_months,
          start_date, end_date, is_active, auto_renew
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          user_id, payment_id, plan_name, features, duration_months,
          start_date, end_date, is_active, auto_renew
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user plan:', error);
      throw error;
    }
  }

  // Find user plan by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT up.*,
               u.first_name, u.last_name, u.email,
               p.amount as payment_amount, p.status as payment_status,
               p.created_at as payment_date
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        LEFT JOIN payments p ON up.payment_id = p.id
        WHERE up.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user plan by ID:', error);
      throw error;
    }
  }

  // Get active plan for user
  static async getActiveByUser(userId) {
    try {
      const result = await query(`
        SELECT up.*,
               p.amount as payment_amount, p.created_at as payment_date
        FROM user_plans up
        LEFT JOIN payments p ON up.payment_id = p.id
        WHERE up.user_id = $1 
          AND up.is_active = true 
          AND up.end_date >= CURRENT_DATE
        ORDER BY up.created_at DESC
        LIMIT 1
      `, [userId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting active plan by user:', error);
      throw error;
    }
  }

  // Get all plans for user
  static async getByUser(userId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE up.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.is_active !== undefined) {
        whereClause += ` AND up.is_active = $${paramIndex++}`;
        queryParams.push(filters.is_active);
      }
      if (filters.plan_name) {
        whereClause += ` AND up.plan_name = $${paramIndex++}`;
        queryParams.push(filters.plan_name);
      }
      if (filters.date_from) {
        whereClause += ` AND up.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND up.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT up.*,
               p.amount as payment_amount, p.status as payment_status,
               p.created_at as payment_date,
               CASE 
                 WHEN up.end_date < CURRENT_DATE THEN 'expired'
                 WHEN up.end_date >= CURRENT_DATE AND up.is_active THEN 'active'
                 ELSE 'inactive'
               END as status
        FROM user_plans up
        LEFT JOIN payments p ON up.payment_id = p.id
        ${whereClause}
        ORDER BY up.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting plans by user:', error);
      throw error;
    }
  }

  // Get all user plans with filters (for admin)
  static async getAll(filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      // Add filters
      if (filters.user_id) {
        whereClause += ` AND up.user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }
      if (filters.status) {
        whereClause += ` AND CASE 
          WHEN up.end_date < CURRENT_DATE THEN 'expired'
          WHEN up.end_date >= CURRENT_DATE AND up.is_active THEN 'active'
          ELSE 'inactive'
        END = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.plan_type) {
        whereClause += ` AND LOWER(up.plan_name) = LOWER($${paramIndex++})`;
        queryParams.push(filters.plan_type);
      }
      if (filters.search) {
        whereClause += ` AND (LOWER(u.first_name) LIKE LOWER($${paramIndex++}) OR LOWER(u.last_name) LIKE LOWER($${paramIndex++}) OR LOWER(u.email) LIKE LOWER($${paramIndex++}))`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 2; // We added 3 parameters but only increment by 2 since we started counting from 1
      }
      if (filters.date_from) {
        whereClause += ` AND up.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND up.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT up.*,
               u.first_name, u.last_name, u.email,
               p.amount as payment_amount, p.status as payment_status,
               p.transaction_id,
               CASE 
                 WHEN up.end_date < CURRENT_DATE THEN 'expired'
                 WHEN up.end_date >= CURRENT_DATE AND up.is_active THEN 'active'
                 ELSE 'inactive'
               END as status,
               up.plan_name as plan,
               up.duration_months,
               up.start_date,
               up.end_date,
               up.created_at
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        LEFT JOIN payments p ON up.payment_id = p.id
        ${whereClause}
        ORDER BY up.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting user plans:', error);
      throw error;
    }
  }

  // Get plan count with filters (for admin)
  static async getCount(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.user_id) {
        whereClause += ` AND up.user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }
      if (filters.status) {
        whereClause += ` AND CASE 
          WHEN up.end_date < CURRENT_DATE THEN 'expired'
          WHEN up.end_date >= CURRENT_DATE AND up.is_active THEN 'active'
          ELSE 'inactive'
        END = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.plan_type) {
        whereClause += ` AND LOWER(up.plan_name) = LOWER($${paramIndex++})`;
        queryParams.push(filters.plan_type);
      }
      if (filters.search) {
        whereClause += ` AND (LOWER(u.first_name) LIKE LOWER($${paramIndex++}) OR LOWER(u.last_name) LIKE LOWER($${paramIndex++}) OR LOWER(u.email) LIKE LOWER($${paramIndex++}))`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 2; // We added 3 parameters but only increment by 2 since we started counting from 1
      }
      if (filters.date_from) {
        whereClause += ` AND up.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND up.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT COUNT(*) as count
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        ${whereClause}
      `, queryParams);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting user plan count:', error);
      throw error;
    }
  }

  // Update user plan
  static async update(id, updateData) {
    try {
      const allowedFields = [
        'plan_name', 'features', 'duration_months', 'start_date', 
        'end_date', 'is_active', 'auto_renew'
      ];
      
      const updateFields = [];
      const queryParams = [id];
      let paramIndex = 2;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = $${paramIndex++}`);
          queryParams.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      const result = await query(
        `UPDATE user_plans SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
        queryParams
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user plan:', error);
      throw error;
    }
  }

  // Deactivate user plan
  static async deactivate(id) {
    try {
      const result = await query(
        'UPDATE user_plans SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deactivating user plan:', error);
      throw error;
    }
  }

  // Deactivate all active plans for user (when creating new plan)
  static async deactivateAllForUser(userId) {
    try {
      const result = await query(
        `UPDATE user_plans 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND is_active = true
         RETURNING *`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error deactivating all plans for user:', error);
      throw error;
    }
  }

  // Extend user plan
  static async extend(id, additionalMonths) {
    try {
      const result = await query(
        `UPDATE user_plans 
         SET end_date = end_date + INTERVAL '${additionalMonths} months',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error extending user plan:', error);
      throw error;
    }
  }


  // Get plan statistics
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
          COUNT(*) as total_plans,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_plans,
          COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as expired_plans,
          COUNT(CASE WHEN end_date >= CURRENT_DATE AND is_active = true THEN 1 END) as currently_active,
          COUNT(CASE WHEN plan_name = 'Basic' THEN 1 END) as basic_plans,
          COUNT(CASE WHEN plan_name = 'Professional' THEN 1 END) as professional_plans,
          COUNT(CASE WHEN plan_name = 'Enterprise' THEN 1 END) as enterprise_plans,
          COUNT(CASE WHEN auto_renew = true THEN 1 END) as auto_renew_plans,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as plans_last_30_days,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as plans_last_7_days
        FROM user_plans
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user plan stats:', error);
      throw error;
    }
  }

  // Get expiring plans
  static async getExpiring(days = 30) {
    try {
      const result = await query(`
        SELECT up.*,
               u.first_name, u.last_name, u.email,
               DATEDIFF(up.end_date, CURRENT_DATE) as days_until_expiry
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        WHERE up.is_active = true 
          AND up.end_date <= CURRENT_DATE + INTERVAL '${days} days'
          AND up.end_date >= CURRENT_DATE
        ORDER BY up.end_date ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting expiring plans:', error);
      throw error;
    }
  }

  // Get plan distribution by type
  static async getPlanDistribution() {
    try {
      const result = await query(`
        SELECT 
          plan_name,
          COUNT(*) as total_count,
          COUNT(CASE WHEN is_active = true AND end_date >= CURRENT_DATE THEN 1 END) as active_count,
          COUNT(CASE WHEN is_active = false OR end_date < CURRENT_DATE THEN 1 END) as inactive_count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM user_plans
        GROUP BY plan_name
        ORDER BY total_count DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting plan distribution:', error);
      throw error;
    }
  }

  // Get monthly plan subscriptions
  static async getMonthlyTrends(year = null) {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const result = await query(`
        SELECT 
          EXTRACT(MONTH FROM created_at) as month,
          COUNT(*) as new_subscriptions,
          COUNT(CASE WHEN plan_name = 'Basic' THEN 1 END) as basic_count,
          COUNT(CASE WHEN plan_name = 'Professional' THEN 1 END) as professional_count,
          COUNT(CASE WHEN plan_name = 'Enterprise' THEN 1 END) as enterprise_count
        FROM user_plans
        WHERE EXTRACT(YEAR FROM created_at) = $1
        GROUP BY EXTRACT(MONTH FROM created_at)
        ORDER BY month
      `, [targetYear]);

      return result.rows;
    } catch (error) {
      console.error('Error getting monthly plan trends:', error);
      throw error;
    }
  }

  // Get revenue from plans
  static async getRevenueByPlan(filters = {}) {
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
          up.plan_name,
          COUNT(p.id) as payment_count,
          COALESCE(SUM(p.amount), 0) as total_revenue,
          COALESCE(AVG(p.amount), 0) as avg_revenue,
          COUNT(DISTINCT up.user_id) as unique_customers
        FROM user_plans up
        JOIN payments p ON up.payment_id = p.id
        ${whereClause}
        GROUP BY up.plan_name
        ORDER BY total_revenue DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting revenue by plan:', error);
      throw error;
    }
  }

  // Check if user has specific feature
  static async hasFeature(userId, feature) {
    try {
      const result = await query(`
        SELECT 1
        FROM user_plans up
        WHERE up.user_id = $1 
          AND up.is_active = true 
          AND up.end_date >= CURRENT_DATE
          AND up.features ? $2
        LIMIT 1
      `, [userId, feature]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking user feature:', error);
      throw error;
    }
  }

  // Get user's current plan features
  static async getUserFeatures(userId) {
    try {
      const result = await query(`
        SELECT features
        FROM user_plans up
        WHERE up.user_id = $1 
          AND up.is_active = true 
          AND up.end_date >= CURRENT_DATE
        LIMIT 1
      `, [userId]);

      return result.rows[0]?.features || {};
    } catch (error) {
      console.error('Error getting user features:', error);
      throw error;
    }
  }

  // Get recent plan subscriptions
  static async getRecent(limit = 10) {
    try {
      const result = await query(`
        SELECT up.*,
               u.first_name, u.last_name, u.email,
               p.amount as payment_amount
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        LEFT JOIN payments p ON up.payment_id = p.id
        ORDER BY up.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting recent plan subscriptions:', error);
      throw error;
    }
  }

  // Get plan renewal candidates
  static async getRenewalCandidates(days = 7) {
    try {
      const result = await query(`
        SELECT up.*,
               u.first_name, u.last_name, u.email,
               p.amount as last_payment_amount,
               DATEDIFF(up.end_date, CURRENT_DATE) as days_until_expiry
        FROM user_plans up
        JOIN users u ON up.user_id = u.id
        LEFT JOIN payments p ON up.payment_id = p.id
        WHERE up.is_active = true 
          AND up.end_date <= CURRENT_DATE + INTERVAL '${days} days'
          AND up.end_date >= CURRENT_DATE
          AND up.auto_renew = true
        ORDER BY up.end_date ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting renewal candidates:', error);
      throw error;
    }
  }

  // Auto-renew expired plans
  static async processAutoRenewals() {
    try {
      const result = await query(`
        SELECT up.*
        FROM user_plans up
        WHERE up.is_active = true 
          AND up.end_date < CURRENT_DATE
          AND up.auto_renew = true
      `);

      const renewedPlans = [];
      
      for (const plan of result.rows) {
        // Calculate new end date
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + plan.duration_months);
        
        // Create new plan record
        const newPlan = await this.create({
          user_id: plan.user_id,
          payment_id: plan.payment_id, // Use same payment ID for renewal
          plan_name: plan.plan_name,
          features: plan.features,
          duration_months: plan.duration_months,
          start_date: new Date(),
          end_date: newEndDate,
          is_active: true,
          auto_renew: plan.auto_renew
        });
        
        // Deactivate old plan
        await this.deactivate(plan.id);
        
        renewedPlans.push(newPlan);
      }
      
      return renewedPlans;
    } catch (error) {
      console.error('Error processing auto-renewals:', error);
      throw error;
    }
  }

  // Get plan usage analytics
  static async getUsageAnalytics() {
    try {
      const result = await query(`
        SELECT 
          plan_name,
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true AND end_date >= CURRENT_DATE THEN 1 END) as active_users,
          AVG(duration_months) as avg_duration,
          COUNT(CASE WHEN auto_renew = true THEN 1 END) as auto_renew_users,
          ROUND(COUNT(CASE WHEN auto_renew = true THEN 1 END) * 100.0 / COUNT(*), 2) as auto_renew_percentage
        FROM user_plans
        GROUP BY plan_name
        ORDER BY total_users DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      throw error;
    }
  }
}

export default UserPlan;
