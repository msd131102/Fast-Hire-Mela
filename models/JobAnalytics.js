 import { query } from '../config/database.js';

export class JobAnalytics {
  // Record job view
  static async recordView(jobId, userId = null, metadata = {}) {
    try {
      const result = await query(
        `INSERT INTO analytics (job_id, user_id, event_type, metadata)
         VALUES ($1, $2, 'view', $3)
         RETURNING *`,
        [jobId, userId, metadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error recording job view:', error);
      throw error;
    }
  }

  // Record job application
  static async recordApplication(jobId, userId, metadata = {}) {
    try {
      const result = await query(
        `INSERT INTO analytics (job_id, user_id, event_type, metadata)
         VALUES ($1, $2, 'application', $3)
         RETURNING *`,
        [jobId, userId, metadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error recording job application:', error);
      throw error;
    }
  }

  // Record job save/unsave
  static async recordSave(jobId, userId, isSaved, metadata = {}) {
    try {
      const eventType = isSaved ? 'save' : 'unsave';
      const result = await query(
        `INSERT INTO analytics (job_id, user_id, event_type, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [jobId, userId, eventType, metadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error recording job save:', error);
      throw error;
    }
  }

  // Record job share
  static async recordShare(jobId, userId = null, platform, metadata = {}) {
    try {
      const shareMetadata = { platform, ...metadata };
      const result = await query(
        `INSERT INTO analytics (job_id, user_id, event_type, metadata)
         VALUES ($1, $2, 'share', $3)
         RETURNING *`,
        [jobId, userId, shareMetadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error recording job share:', error);
      throw error;
    }
  }

  // Get analytics for specific job
  static async getJobAnalytics(jobId, filters = {}) {
    try {
      let whereClause = 'WHERE ja.job_id = $1';
      const queryParams = [jobId];
      let paramIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applications,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'save' THEN ja.user_id END) as unique_saves,

          -- Unsave metrics
          COUNT(CASE WHEN ja.event_type = 'unsave' THEN 1 END) as total_unsaves,

          -- Share metrics
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as total_shares,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'share' THEN ja.user_id END) as unique_shares,

          -- Conversion rates
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as view_to_application_rate,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as view_to_save_rate,

          -- Time-based metrics
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as views_last_24h,
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7d,
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30d

        FROM analytics ja
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting job analytics:', error);
      throw error;
    }
  }

  // Get daily analytics for job
  static async getJobDailyAnalytics(jobId, days = 30) {
    try {
      const result = await query(`
        SELECT 
          DATE(ja.created_at) as date,
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as applications,
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as saves,
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as shares
        FROM job_analytics ja
        WHERE ja.job_id = $1 
          AND ja.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(ja.created_at)
        ORDER BY date DESC
      `, [jobId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting job daily analytics:', error);
      throw error;
    }
  }

  // Get analytics for company's jobs
  static async getCompanyAnalytics(companyId, filters = {}) {
    try {
      let whereClause = 'WHERE j.company_id = $1';
      const queryParams = [companyId];
      let paramIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          -- Job count
          COUNT(DISTINCT j.id) as total_jobs,

          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applications,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'save' THEN ja.user_id END) as unique_saves,

          -- Share metrics
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as total_shares,

          -- Average metrics per job
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_views_per_job,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_applications_per_job,

          -- Overall conversion rate
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as overall_conversion_rate

        FROM analytics ja
        JOIN jobs j ON ja.job_id = j.id
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting company analytics:', error);
      throw error;
    }
  }

  // Get top performing jobs for company
  static async getTopPerformingJobs(companyId, metric = 'views', limit = 10) {
    try {
      let orderBy = '';
      switch (metric) {
        case 'views':
          orderBy = 'ORDER BY view_count DESC';
          break;
        case 'applications':
          orderBy = 'ORDER BY application_count DESC';
          break;
        case 'conversion_rate':
          orderBy = 'ORDER BY conversion_rate DESC';
          break;
        default:
          orderBy = 'ORDER BY view_count DESC';
      }

      const result = await query(`
        SELECT
          j.id,
          j.title,
          j.location,
          j.job_type,
          j.created_at as posted_date,

          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as view_count,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as application_count,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applications,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as save_count,

          -- Share metrics
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as share_count,

          -- Conversion rate
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as conversion_rate

        FROM jobs j
        LEFT JOIN analytics ja ON j.id = ja.job_id
        WHERE j.company_id = $1
        GROUP BY j.id, j.title, j.location, j.job_type, j.created_at
        ${orderBy}
        LIMIT $2
      `, [companyId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting top performing jobs:', error);
      throw error;
    }
  }

  // Get overall platform analytics
  static async getPlatformAnalytics(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          -- Job counts
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.is_active = true THEN j.id END) as active_jobs,

          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_viewers,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applicants,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'save' THEN ja.user_id END) as unique_savers,

          -- Share metrics
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as total_shares,

          -- Platform conversion rates
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as platform_conversion_rate,

          -- Average metrics per job
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_views_per_job,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_applications_per_job,

          -- Time-based metrics
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as views_last_24h,
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7d,
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30d

        FROM analytics ja
        JOIN jobs j ON ja.job_id = j.id
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  // Get analytics by job category
  static async getAnalyticsByCategory(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          c.id as category_id,
          c.name as category_name,
          COUNT(DISTINCT j.id) as job_count,

          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applications,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,

          -- Average metrics per job in category
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_views_per_job,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_applications_per_job,

          -- Conversion rate
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as conversion_rate

        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id
        LEFT JOIN analytics ja ON j.id = ja.job_id
        ${whereClause}
        GROUP BY c.id, c.name
        ORDER BY total_views DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting analytics by category:', error);
      throw error;
    }
  }

  // Get analytics by job type
  static async getAnalyticsByJobType(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          j.job_type,
          COUNT(DISTINCT j.id) as job_count,

          -- View metrics
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_views,

          -- Application metrics
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applications,

          -- Save metrics
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,

          -- Average metrics per job type
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_views_per_job,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 1.0 /
            NULLIF(COUNT(DISTINCT j.id), 0), 2
          ) as avg_applications_per_job,

          -- Conversion rate
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as conversion_rate

        FROM jobs j
        LEFT JOIN analytics ja ON j.id = ja.job_id
        ${whereClause}
        GROUP BY j.job_type
        ORDER BY total_views DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting analytics by job type:', error);
      throw error;
    }
  }

  // Get user engagement analytics
  static async getUserEngagementAnalytics(userId, filters = {}) {
    try {
      let whereClause = 'WHERE ja.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          -- Activity counts
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as total_views,
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as total_applications,
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as total_saves,
          COUNT(CASE WHEN ja.event_type = 'unsave' THEN 1 END) as total_unsaves,
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as total_shares,

          -- Unique interactions
          COUNT(DISTINCT ja.job_id) as unique_jobs_interacted,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.job_id END) as unique_jobs_viewed,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.job_id END) as unique_jobs_applied,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'save' THEN ja.job_id END) as unique_jobs_saved,

          -- Conversion rates
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as view_to_application_rate,

          ROUND(
            COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as view_to_save_rate,

          -- First and last activity
          MIN(ja.created_at) as first_activity,
          MAX(ja.created_at) as last_activity,

          -- Activity breakdown by type
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as activities_last_7d,
          COUNT(CASE WHEN ja.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as activities_last_30d

        FROM analytics ja
        ${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user engagement analytics:', error);
      throw error;
    }
  }

  // Get daily platform trends
  static async getDailyPlatformTrends(days = 30) {
    try {
      const result = await query(`
        SELECT
          DATE(ja.created_at) as date,
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as daily_views,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'view' THEN ja.user_id END) as unique_viewers,
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as daily_applications,
          COUNT(DISTINCT CASE WHEN ja.event_type = 'application' THEN ja.user_id END) as unique_applicants,
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as daily_saves,
          COUNT(CASE WHEN ja.event_type = 'share' THEN 1 END) as daily_shares,

          -- Daily conversion rate
          ROUND(
            COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END), 0), 2
          ) as daily_conversion_rate

        FROM analytics ja
        WHERE ja.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(ja.created_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting daily platform trends:', error);
      throw error;
    }
  }

  // Get popular job categories
  static async getPopularCategories(limit = 10, filters = {}) {
    try {
      let whereClause = 'WHERE ja.event_type = \'view\'';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND ja.created_at >= $${paramIndex++}`;
        queryParams.push(filters.date_from);
      }
      if (filters.date_to) {
        whereClause += ` AND ja.created_at <= $${paramIndex++}`;
        queryParams.push(filters.date_to);
      }

      const result = await query(`
        SELECT
          c.id as category_id,
          c.name as category_name,
          COUNT(ja.id) as view_count,
          COUNT(DISTINCT ja.user_id) as unique_viewers,
          COUNT(DISTINCT j.id) as job_count,

          -- Application metrics
          COUNT(CASE WHEN ja2.event_type = 'application' THEN 1 END) as application_count,
          COUNT(DISTINCT CASE WHEN ja2.event_type = 'application' THEN ja2.user_id END) as unique_applicants,

          -- Conversion rate
          ROUND(
            COUNT(CASE WHEN ja2.event_type = 'application' THEN 1 END) * 100.0 /
            NULLIF(COUNT(ja.id), 0), 2
          ) as conversion_rate

        FROM categories c
        JOIN jobs j ON c.id = j.category_id
        JOIN analytics ja ON j.id = ja.job_id AND ja.event_type = 'view'
        LEFT JOIN analytics ja2 ON j.id = ja2.job_id AND ja2.event_type = 'application'
        ${whereClause}
        GROUP BY c.id, c.name
        ORDER BY view_count DESC
        LIMIT $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting popular categories:', error);
      throw error;
    }
  }

  // Get user activity heatmap data
  static async getUserActivityHeatmap(userId, days = 30) {
    try {
      const result = await query(`
        SELECT
          EXTRACT(DOW FROM ja.created_at) as day_of_week,
          EXTRACT(HOUR FROM ja.created_at) as hour_of_day,
          COUNT(*) as activity_count,
          COUNT(CASE WHEN ja.event_type = 'view' THEN 1 END) as views,
          COUNT(CASE WHEN ja.event_type = 'application' THEN 1 END) as applications,
          COUNT(CASE WHEN ja.event_type = 'save' THEN 1 END) as saves
        FROM analytics ja
        WHERE ja.user_id = $1
          AND ja.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY EXTRACT(DOW FROM ja.created_at), EXTRACT(HOUR FROM ja.created_at)
        ORDER BY day_of_week, hour_of_day
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user activity heatmap:', error);
      throw error;
    }
  }
}

export default JobAnalytics;
