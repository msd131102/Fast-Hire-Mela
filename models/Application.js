import { query } from '../config/database.js';

export class Application {
  // Create new application
  static async create(applicationData) {
    try {
      const {
        job_id, user_id, cover_letter, resume_url,
        portfolio_url, expected_salary, availability,
        status = 'pending'
      } = applicationData;

      const result = await query(
        `INSERT INTO job_applications (
          job_id, user_id, cover_letter, resume_url,
          portfolio_url, expected_salary, availability, application_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          job_id, user_id, cover_letter, resume_url,
          portfolio_url, expected_salary, availability, status
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Find application by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT a.*,
               j.title as job_title, j.company_id,
               c.name as company_name,
               au.name as user_name, au.email as user_email
        FROM job_applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        JOIN app_users au ON a.user_id = au.id
        WHERE a.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding application by ID:', error);
      throw error;
    }
  }

  // Check if user has already applied for a job
  static async hasApplied(jobId, userId) {
    try {
      const result = await query(
        'SELECT id FROM job_applications WHERE job_id = $1 AND user_id = $2',
        [jobId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if user has applied:', error);
      throw error;
    }
  }

  // Get applications by user
  static async getByUser(userId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE a.user_id = $1';
      const queryParams = [userId];
      let paramIndex = 2;

      // Add filters
      if (filters.status) {
        whereClause += ` AND a.application_status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.job_title) {
        whereClause += ` AND j.title ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.job_title}%`);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT a.*,
               j.title as job_title, j.location as job_location,
               j.salary_min, j.salary_max, j.job_type,
               c.name as company_name, c.logo_url as company_logo,
               j.application_deadline
        FROM job_applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting applications by user:', error);
      throw error;
    }
  }

  // Get applications by job
  static async getByJob(jobId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE a.job_id = $1';
      const queryParams = [jobId];
      let paramIndex = 2;

      // Add filters
      if (filters.status) {
        whereClause += ` AND a.application_status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.search) {
        whereClause += ` AND (au.name ILIKE $${paramIndex++} OR au.email ILIKE $${paramIndex++})`;
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT a.*,
               au.name as user_name, au.email as user_email, au.phone,
               au.location as user_location
        FROM job_applications a
        JOIN app_users au ON a.user_id = au.id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting applications by job:', error);
      throw error;
    }
  }

  // Get applications by company
  static async getByCompany(companyId, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE j.company_id = $1';
      const queryParams = [companyId];
      let paramIndex = 2;

      // Add filters
      if (filters.status) {
        whereClause += ` AND a.application_status = $${paramIndex++}`;
        queryParams.push(filters.status);
      }
      if (filters.job_title) {
        whereClause += ` AND j.title ILIKE $${paramIndex++}`;
        queryParams.push(`%${filters.job_title}%`);
      }

      // Add pagination
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT a.*,
               j.title as job_title, j.location as job_location,
               au.name as user_name, au.email as user_email, au.phone,
               au.location as user_location
        FROM job_applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN app_users au ON a.user_id = au.id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting applications by company:', error);
      throw error;
    }
  }

  // Update application status
  static async updateStatus(id, status, updatedBy = null) {
    try {
      const result = await query(
        `UPDATE job_applications
         SET application_status = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
         WHERE id = $3
         RETURNING *`,
        [status, updatedBy, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Update application
  static async update(id, applicationData) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query
      Object.keys(applicationData).forEach(key => {
        if (applicationData[key] !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(applicationData[key]);
        }
      });

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE job_applications SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // Delete application
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM job_applications WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  // Get application statistics
  static async getStats(filters = {}) {
    try {
      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.job_id) {
        whereClause += ` WHERE job_id = $${paramIndex++}`;
        queryParams.push(filters.job_id);
      }
      if (filters.company_id) {
        whereClause += whereClause ? ` AND j.company_id = $${paramIndex++}` : ` WHERE j.company_id = $${paramIndex++}`;
        queryParams.push(filters.company_id);
      }
      if (filters.user_id) {
        whereClause += whereClause ? ` AND user_id = $${paramIndex++}` : ` WHERE user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }

      const fromClause = filters.company_id ?
        'job_applications a JOIN jobs j ON a.job_id = j.id' : 'job_applications';

      const result = await query(`
        SELECT
          COUNT(*) as total_applications,
          COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN application_status = 'reviewing' THEN 1 END) as reviewing_applications,
          COUNT(CASE WHEN application_status = 'accepted' THEN 1 END) as accepted_applications,
          COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected_applications,
          COUNT(CASE WHEN applied_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as applications_last_30_days,
          COUNT(CASE WHEN applied_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as applications_last_7_days
        FROM ${fromClause}${whereClause}
      `, queryParams);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  }

  // Get application trends
  static async getTrends(days = 30, filters = {}) {
    try {
      let whereClause = `WHERE applied_at >= CURRENT_DATE - INTERVAL '${days} days'`;
      const queryParams = [];
      let paramIndex = 1;

      if (filters.job_id) {
        whereClause += ` AND job_id = $${paramIndex++}`;
        queryParams.push(filters.job_id);
      }
      if (filters.company_id) {
        whereClause += ` AND EXISTS (SELECT 1 FROM jobs WHERE id = job_applications.job_id AND company_id = $${paramIndex++})`;
        queryParams.push(filters.company_id);
      }

      const result = await query(`
        SELECT
          DATE(applied_at) as date,
          COUNT(*) as applications_count,
          COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN application_status = 'accepted' THEN 1 END) as accepted_count,
          COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected_count
        FROM job_applications
        ${whereClause}
        GROUP BY DATE(applied_at)
        ORDER BY date DESC
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting application trends:', error);
      throw error;
    }
  }

  // Get recent applications
  static async getRecent(limit = 10, filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (filters.company_id) {
        whereClause += ` AND j.company_id = $${paramIndex++}`;
        queryParams.push(filters.company_id);
      }
      if (filters.user_id) {
        whereClause += ` AND a.user_id = $${paramIndex++}`;
        queryParams.push(filters.user_id);
      }

      queryParams.push(limit);

      const result = await query(`
        SELECT a.*,
               j.title as job_title,
               c.name as company_name,
               au.name as user_name
        FROM job_applications a
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN companies c ON j.company_id = c.id
        JOIN app_users au ON a.user_id = au.id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting recent applications:', error);
      throw error;
    }
  }

  // Bulk update application status
  static async bulkUpdateStatus(applicationIds, status, updatedBy = null) {
    try {
      const placeholders = applicationIds.map((_, index) => `$${index + 3}`).join(',');
      const result = await query(
        `UPDATE job_applications
         SET application_status = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
         WHERE id IN (${placeholders})
         RETURNING *`,
        [status, updatedBy, ...applicationIds]
      );
      return result.rows;
    } catch (error) {
      console.error('Error bulk updating application status:', error);
      throw error;
    }
  }

  // Get application count by status for a job
  static async getStatusCountByJob(jobId) {
    try {
      const result = await query(
        `SELECT application_status, COUNT(*) as count
         FROM job_applications
         WHERE job_id = $1
         GROUP BY application_status
         ORDER BY count DESC`,
        [jobId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting status count by job:', error);
      throw error;
    }
  }

  // Get top applicants for a company
  static async getTopApplicants(companyId, limit = 10) {
    try {
      const result = await query(`
        SELECT au.*,
               COUNT(a.id) as application_count,
               COUNT(CASE WHEN a.application_status = 'accepted' THEN 1 END) as accepted_count,
               MAX(a.applied_at) as last_application_date
        FROM app_users au
        JOIN job_applications a ON au.id = a.user_id
        JOIN jobs j ON a.job_id = j.id
        WHERE j.company_id = $1
        GROUP BY au.id
        HAVING COUNT(a.id) > 0
        ORDER BY accepted_count DESC, application_count DESC
        LIMIT $2
      `, [companyId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting top applicants:', error);
      throw error;
    }
  }

  // Track application click (for analytics)
  static async trackClick(jobId, userId = null, ipAddress = null, userAgent = null) {
    try {
      const result = await query(
        `INSERT INTO job_application_clicks (job_id, user_id, ip_address, user_agent, clicked_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [jobId, userId, ipAddress, userAgent]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error tracking application click:', error);
      throw error;
    }
  }
}

export default Application;
