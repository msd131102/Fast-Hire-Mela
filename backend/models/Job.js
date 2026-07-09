import { query } from '../config/database.js';
import { generateJobSlug, generateUniqueSlug } from '../utils/slugGenerator.js';

export class Job {
  // Create new job
  static async create(jobData) {
    try {
      const {
        title, description, company_id, category_id, location, 
        job_type, salary_min, salary_max, experience_level, 
        skills_required, responsibilities, eligibility, education_required,
        apply_link, application_deadline, work_mode,
        is_active, is_featured, company_name
      } = jobData;

      // Generate unique slug
      const baseSlug = generateJobSlug(title, company_name);
      const slug = await generateUniqueSlug(baseSlug, async (slugToCheck) => {
        const result = await query('SELECT id FROM jobs WHERE slug = $1', [slugToCheck]);
        return result.rows.length > 0;
      });

      const result = await query(
        `INSERT INTO jobs (
          title, slug, description, company_id, category_id, location,
          job_type, salary_min, salary_max, experience_level,
          skills_required, responsibilities, eligibility, education_required,
          apply_link, application_deadline, work_mode,
          is_active, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          title, slug, description, company_id, category_id, location,
          job_type, salary_min, salary_max, experience_level,
          skills_required, responsibilities, eligibility, education_required,
          apply_link, application_deadline, work_mode,
          is_active !== false, is_featured || false
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Find job by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo, co.website as company_website
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        WHERE j.id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding job by ID:', error);
      throw error;
    }
  }

  // Get all jobs with filtering and pagination
  static async getAll(filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE j.is_active = true';
      const queryParams = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause
      if (filters.category_id) {
        whereClause += ` AND j.category_id = $${paramIndex++}`;
        queryParams.push(filters.category_id);
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
      if (filters.search) {
        whereClause += ` AND (j.title ILIKE $${paramIndex++} OR j.description ILIKE $${paramIndex++})`;
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Add pagination parameters
      queryParams.push(limit, offset);

      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        ${whereClause}
        ORDER BY j.is_featured DESC, j.posted_date DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  // Update job
  static async update(id, jobData) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query
      Object.keys(jobData).forEach(key => {
        if (jobData[key] !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(jobData[key]);
        }
      });

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  // Delete job (soft delete)
  static async delete(id) {
    try {
      const result = await query(
        `UPDATE jobs SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Get job statistics
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_jobs,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_jobs,
          COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_jobs_last_30_days,
          COUNT(CASE WHEN application_deadline >= CURRENT_DATE THEN 1 END) as open_applications
        FROM jobs
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw error;
    }
  }

  // Get jobs by company
  static async getByCompany(companyId, limit = 20, offset = 0) {
    try {
      const result = await query(
        `SELECT j.*, c.name as category_name 
         FROM jobs j
         LEFT JOIN categories c ON j.category_id = c.id
         WHERE j.company_id = $1 AND j.is_active = true
         ORDER BY j.posted_date DESC
         LIMIT $2 OFFSET $3`,
        [companyId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting jobs by company:', error);
      throw error;
    }
  }

  // Get featured jobs
  static async getFeatured(limit = 10) {
    try {
      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        WHERE j.is_active = true AND j.is_featured = true
        ORDER BY j.posted_date DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting featured jobs:', error);
      throw error;
    }
  }

  // Search jobs with full-text search
  static async search(searchTerm, filters = {}, limit = 20, offset = 0) {
    try {
      let whereClause = 'WHERE j.is_active = true';
      const queryParams = [];
      let paramIndex = 1;

      if (searchTerm) {
        whereClause += ` AND (j.title ILIKE $${paramIndex++} OR j.description ILIKE $${paramIndex++} OR j.skills_required::text ILIKE $${paramIndex++} OR j.responsibilities::text ILIKE $${paramIndex++})`;
        queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }

      // Add other filters
      if (filters.category_id) {
        whereClause += ` AND j.category_id = $${paramIndex++}`;
        queryParams.push(filters.category_id);
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
      if (filters.work_mode) {
        whereClause += ` AND j.work_mode = $${paramIndex++}`;
        queryParams.push(filters.work_mode);
      }

      queryParams.push(limit, offset);

      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        ${whereClause}
        ORDER BY j.is_featured DESC, j.posted_date DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  // Increment view count
  static async incrementViewCount(jobId) {
    try {
      await query(
        `UPDATE jobs SET view_count = view_count + 1 WHERE id = $1`,
        [jobId]
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  }

  // Get recommended jobs for user
  static async getRecommendedJobs(userId, limit = 10) {
    try {
      const result = await query(
        `SELECT * FROM get_job_recommendations($1, $2)`,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      throw error;
    }
  }

  // Alias for getAll for compatibility with routes
  static async findAll(filters = {}, options = {}, isPremium = false) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      
      const jobs = await this.getAll(filters, limit, offset);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE is_active = true';
      let countParams = [];
      let paramIndex = 1;

      if (filters.search) {
        countQuery += ` AND (title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
        countParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      if (filters.category_id) {
        countQuery += ` AND category_id = $${paramIndex++}`;
        countParams.push(filters.category_id);
      }
      if (filters.location) {
        countQuery += ` AND location ILIKE $${paramIndex++}`;
        countParams.push(`%${filters.location}%`);
      }
      if (filters.experience_level) {
        countQuery += ` AND experience_level = $${paramIndex++}`;
        countParams.push(filters.experience_level);
      }
      if (filters.salary_min) {
        countQuery += ` AND salary_max >= $${paramIndex++}`;
        countParams.push(filters.salary_min);
      }
      if (filters.featured !== undefined) {
        countQuery += ` AND is_featured = $${paramIndex++}`;
        countParams.push(filters.featured);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding jobs:', error);
      throw error;
    }
  }

  // Get featured jobs with premium check
  static async findFeatured(limit = 10, isPremium = false) {
    try {
      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        WHERE j.is_active = true AND j.is_featured = true
        AND (j.is_premium_only = false OR $1 = true)
        ORDER BY j.posted_date DESC
        LIMIT $2
      `, [isPremium, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error finding featured jobs:', error);
      throw error;
    }
  }

  // Get latest jobs with premium check
  static async findLatest(limit = 10, isPremium = false) {
    try {
      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        WHERE j.is_active = true
        AND (j.is_premium_only = false OR $1 = true)
        ORDER BY j.posted_date DESC
        LIMIT $2
      `, [isPremium, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error finding latest jobs:', error);
      throw error;
    }
  }

  // Find similar jobs
  static async findSimilar(jobId, categoryId, location, isPremium = false) {
    try {
      const result = await query(`
        SELECT j.*, c.name as category_name, co.name as company_name, co.logo_url as company_logo, co.name as company_name,
               co.logo_url as company_logo
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        WHERE j.is_active = true AND j.id != $1
        AND (j.is_premium_only = false OR $4 = true)
        AND (j.category_id = $2 OR j.location ILIKE $3)
        ORDER BY j.category_id = $2 DESC, j.posted_date DESC
        LIMIT 5
      `, [jobId, categoryId, `%${location}%`, isPremium]);
      return result.rows;
    } catch (error) {
      console.error('Error finding similar jobs:', error);
      throw error;
    }
  }
}

export default Job;
