import { query } from '../config/database.js';

export class SavedJob {
  // Save a job for a user
  static async create(userId, jobId) {
    try {
      const result = await query(
        `INSERT INTO saved_jobs (user_id, job_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, job_id) DO NOTHING
         RETURNING *`,
        [userId, jobId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  // Remove a saved job
  static async remove(userId, jobId) {
    try {
      const result = await query(
        'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING *',
        [userId, jobId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error removing saved job:', error);
      throw error;
    }
  }

  // Check if job is saved by user
  static async isSaved(userId, jobId) {
    try {
      const result = await query(
        'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      throw error;
    }
  }

  // Get all saved jobs for a user
  static async getByUser(userId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE sj.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.job_title) {
        whereClause += ` AND j.title ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.job_title}%`);
      }
      if (filters.company_name) {
        whereClause += ` AND c.name ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.company_name}%`);
      }
      if (filters.location) {
        whereClause += ` AND j.location ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.location}%`);
      }
      if (filters.job_type) {
        whereClause += ` AND j.job_type = $${paramIndex++}`;
        queryParams.push(filters.job_type);
      }
      if (filters.experience_level) {
        whereClause += ` AND j.experience_level = $${paramIndex++}`;
        queryParams.push(filters.experience_level);
      }
      if (filters.salary_min) {
        whereClause += ` AND j.salary_max >= $${paramIndex++}`;
        queryParams.push(filters.salary_min);
      }
      if (filters.salary_max) {
        whereClause += ` AND j.salary_min <= $${paramIndex++}`;
        queryParams.push(filters.salary_max);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT sj.*,
               j.title, j.description, j.location, j.salary_min, j.salary_max,
               j.job_type, j.experience_level, j.application_deadline,
               j.is_active as job_active, j.created_at as job_created_at,
               j.skills_required, j.benefits, j.employment_type,
               c.name as company_name, c.logo as company_logo, c.website,
               cat.name as category_name, cat.icon as category_icon
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN categories cat ON j.category_id = cat.id
        ${whereClause}
        ORDER BY sj.saved_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs by user:', error);
      throw error;
    }
  }

  // Get saved jobs by user with job details
  static async getWithJobDetails(userId, limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT sj.*,
               j.title, j.description, j.location, j.salary_min, j.salary_max,
               j.job_type, j.experience_level, j.application_deadline,
               j.is_active as job_active, j.created_at as job_created_at,
               c.name as company_name, c.logo as company_logo,
               cat.name as category_name,
               CASE WHEN a.id IS NOT NULL THEN true ELSE false END as has_applied
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN categories cat ON j.category_id = cat.id
        LEFT JOIN applications a ON sj.job_id = a.job_id AND sj.user_id = a.user_id
        WHERE sj.user_id = $1 AND j.is_active = true
        ORDER BY sj.saved_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs with details:', error);
      throw error;
    }
  }

  // Get saved job count for a user
  static async getCountByUser(userId, filters = {}) {
    try {
      let whereClause = 'WHERE sj.user_id = $1 AND j.is_active = true';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.job_title) {
        whereClause += ` AND j.title ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.job_title}%`);
      }
      if (filters.company_name) {
        whereClause += ` AND c.name ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.company_name}%`);
      }
      if (filters.location) {
        whereClause += ` AND j.location ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.location}%`);
      }

      const result = await query(`
        SELECT COUNT(*) as count
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        ${whereClause}
      `, queryParams);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting saved jobs count:', error);
      throw error;
    }
  }

  // Get saved jobs statistics for a user
  static async getStatsByUser(userId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_saved_jobs,
          COUNT(CASE WHEN j.is_active = true THEN 1 END) as active_saved_jobs,
          COUNT(CASE WHEN sj.saved_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as saved_last_30_days,
          COUNT(CASE WHEN a.id IS NOT NULL THEN 1 END) as applied_saved_jobs,
          COUNT(DISTINCT j.company_id) as unique_companies,
          COUNT(DISTINCT j.category_id) as unique_categories
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN applications a ON sj.job_id = a.job_id AND sj.user_id = a.user_id
        WHERE sj.user_id = $1
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting saved jobs stats:', error);
      throw error;
    }
  }

  // Get popular saved jobs (jobs saved by most users)
  static async getPopular(limit = 10) {
    try {
      const result = await query(`
        SELECT j.*, 
               COUNT(sj.id) as save_count,
               c.name as company_name,
               cat.name as category_name
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN categories cat ON j.category_id = cat.id
        WHERE j.is_active = true
        GROUP BY j.id, c.name, cat.name
        HAVING COUNT(sj.id) > 0
        ORDER BY save_count DESC, j.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting popular saved jobs:', error);
      throw error;
    }
  }

  // Get saved jobs trends
  static async getTrends(days = 30) {
    try {
      const result = await query(`
        SELECT 
          DATE(saved_at) as date,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_saves
        FROM saved_jobs
        WHERE saved_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(saved_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs trends:', error);
      throw error;
    }
  }

  // Bulk remove saved jobs
  static async bulkRemove(userId, jobIds) {
    try {
      const placeholders = jobIds.map((_, index) => `$${index + 2}`).join(',');
      const result = await query(
        `DELETE FROM saved_jobs 
         WHERE user_id = $1 AND job_id IN (${placeholders})
         RETURNING *`,
        [userId, ...jobIds]
      );
      return result.rows;
    } catch (error) {
      console.error('Error bulk removing saved jobs:', error);
      throw error;
    }
  }

  // Get saved jobs by category for a user
  static async getByCategory(userId, categoryId, limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT sj.*,
               j.title, j.description, j.location, j.salary_min, j.salary_max,
               j.job_type, j.experience_level, j.application_deadline,
               c.name as company_name, c.logo as company_logo,
               cat.name as category_name
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN categories cat ON j.category_id = cat.id
        WHERE sj.user_id = $1 AND j.category_id = $2 AND j.is_active = true
        ORDER BY sj.saved_at DESC
        LIMIT $3 OFFSET $4
      `, [userId, categoryId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs by category:', error);
      throw error;
    }
  }

  // Get saved jobs by company for a user
  static async getByCompany(userId, companyId, limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT sj.*,
               j.title, j.description, j.location, j.salary_min, j.salary_max,
               j.job_type, j.experience_level, j.application_deadline,
               c.name as company_name, c.logo as company_logo,
               cat.name as category_name
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN categories cat ON j.category_id = cat.id
        WHERE sj.user_id = $1 AND j.company_id = $2 AND j.is_active = true
        ORDER BY sj.saved_at DESC
        LIMIT $3 OFFSET $4
      `, [userId, companyId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting saved jobs by company:', error);
      throw error;
    }
  }
}

export default SavedJob;
