import { query } from '../config/database.js';

export class Activity {
  // Create a new activity record
  static async create(activityData) {
    try {
      const {
        user_id,
        activity_type,
        activity_subtype,
        resource_type,
        resource_id,
        metadata = {},
        ip_address = null,
        user_agent = null
      } = activityData;

      const result = await query(
        `INSERT INTO user_activities (
          user_id, activity_type, activity_subtype, resource_type, 
          resource_id, metadata, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          user_id, activity_type, activity_subtype, resource_type,
          resource_id, JSON.stringify(metadata), ip_address, user_agent
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Get activities by user with pagination
  static async getByUser(userId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE a.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.activity_type) {
        whereClause += ` AND a.activity_type = $${paramIndex++}`;
        queryParams.push(filters.activity_type);
      }
      if (filters.activity_subtype) {
        whereClause += ` AND a.activity_subtype = $${paramIndex++}`;
        queryParams.push(filters.activity_subtype);
      }
      if (filters.resource_type) {
        whereClause += ` AND a.resource_type = $${paramIndex++}`;
        queryParams.push(filters.resource_type);
      }
      if (filters.date_from) {
        whereClause += ` AND a.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND a.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT a.*,
               au.name as user_name, au.email as user_email
        FROM user_activities a
        JOIN app_users au ON a.user_id = au.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting activities by user:', error);
      throw error;
    }
  }

  // Get activity statistics for a user
  static async getUserStats(userId, days = 30) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(CASE WHEN activity_type = 'application' THEN 1 END) as application_activities,
          COUNT(CASE WHEN activity_type = 'job_search' THEN 1 END) as job_search_activities,
          COUNT(CASE WHEN activity_type = 'profile' THEN 1 END) as profile_activities,
          COUNT(CASE WHEN activity_type = 'saved_job' THEN 1 END) as saved_job_activities,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as activities_last_7_days,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as activities_last_30_days,
          DATE_TRUNC('day', created_at) as activity_date,
          COUNT(*) as daily_activities
        FROM user_activities
        WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY activity_date DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user activity stats:', error);
      throw error;
    }
  }

  // Get recent activities for all users (for admin)
  static async getRecent(limit = 50, filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.activity_type) {
        whereClause += ` AND a.activity_type = $${paramIndex++}`;
        queryParams.push(filters.activity_type);
      }
      if (filters.user_id) {
        whereClause += ` AND a.user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }

      queryParams.push(limit);

      const result = await query(`
        SELECT a.*,
               au.name as user_name, au.email as user_email
        FROM user_activities a
        JOIN app_users au ON a.user_id = au.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  // Get activity trends over time
  static async getTrends(days = 30, filters = {}) {
    try {
      let whereClause = `WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'`;
      const queryParams = [];
      let paramIndex = 1;

      if (filters.activity_type) {
        whereClause += ` AND activity_type = $${paramIndex++}`;
        queryParams.push(filters.activity_type);
      }
      if (filters.user_id) {
        whereClause += ` AND user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }

      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          activity_type,
          activity_subtype,
          COUNT(*) as count
        FROM user_activities
        ${whereClause}
        GROUP BY DATE(created_at), activity_type, activity_subtype
        ORDER BY date DESC, count DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting activity trends:', error);
      throw error;
    }
  }

  // Get most active users
  static async getMostActiveUsers(days = 30, limit = 10) {
    try {
      const result = await query(`
        SELECT au.id, au.name, au.email,
               COUNT(a.id) as activity_count,
               COUNT(DISTINCT a.activity_type) as unique_activity_types,
               MAX(a.created_at) as last_activity
        FROM app_users au
        LEFT JOIN user_activities a ON au.id = a.user_id 
          AND a.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        WHERE au.is_active = true
        GROUP BY au.id, au.name, au.email
        HAVING COUNT(a.id) > 0
        ORDER BY activity_count DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting most active users:', error);
      throw error;
    }
  }

  // Track job application related activities
  static async trackApplication(userId, applicationId, subtype, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'application',
      activity_subtype: subtype,
      resource_type: 'application',
      resource_id: applicationId,
      metadata
    });
  }

  // Track job search activities
  static async trackJobSearch(userId, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'job_search',
      activity_subtype: 'search',
      resource_type: 'job',
      metadata
    });
  }

  // Track job view activities
  static async trackJobView(userId, jobId, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'job_search',
      activity_subtype: 'view',
      resource_type: 'job',
      resource_id: jobId,
      metadata
    });
  }

  // Track saved job activities
  static async trackSavedJob(userId, jobId, subtype, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'saved_job',
      activity_subtype: subtype,
      resource_type: 'job',
      resource_id: jobId,
      metadata
    });
  }

  // Track profile activities
  static async trackProfile(userId, subtype, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'profile',
      activity_subtype: subtype,
      resource_type: 'profile',
      metadata
    });
  }

  // Track authentication activities
  static async trackAuth(userId, subtype, metadata = {}) {
    return this.create({
      user_id: userId,
      activity_type: 'auth',
      activity_subtype: subtype,
      resource_type: 'user',
      resource_id: userId,
      metadata
    });
  }

  // Get activity summary by type for a user
  static async getActivitySummaryByType(userId, days = 30) {
    try {
      const result = await query(`
        SELECT 
          activity_type,
          activity_subtype,
          COUNT(*) as count,
          MAX(created_at) as last_occurrence
        FROM user_activities
        WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY activity_type, activity_subtype
        ORDER BY count DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting activity summary by type:', error);
      throw error;
    }
  }

  // Get activities by resource
  static async getByResource(resourceType, resourceId, limit = 20) {
    try {
      const result = await query(`
        SELECT a.*,
               au.name as user_name, au.email as user_email
        FROM user_activities a
        JOIN app_users au ON a.user_id = au.id
        WHERE a.resource_type = $1 AND a.resource_id = $2
        ORDER BY a.created_at DESC
        LIMIT $3
      `, [resourceType, resourceId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting activities by resource:', error);
      throw error;
    }
  }

  // Delete old activities (for cleanup)
  static async deleteOld(daysToKeep = 90) {
    try {
      const result = await query(`
        DELETE FROM user_activities 
        WHERE created_at < CURRENT_DATE - INTERVAL '${daysToKeep} days'
        RETURNING COUNT(*) as deleted_count
      `);
      return result.rows[0].deleted_count;
    } catch (error) {
      console.error('Error deleting old activities:', error);
      throw error;
    }
  }
}

export default Activity;
