import pool from '../config/database.js';

class Location {
  // Find location by name
  static async findByName(location) {
    try {
      const query = `
        SELECT location FROM jobs 
        WHERE location = $1 AND location IS NOT NULL AND location != ''
        LIMIT 1
      `;
      
      const result = await pool.query(query, [location]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding location by name:', error);
      throw error;
    }
  }

  // Create a new location (this creates a dummy job entry to establish the location)
  static async create(locationData) {
    try {
      const { location, city, state, country = 'India', is_active = true } = locationData;
      
      // Since locations in this system are derived from jobs, we'll create a placeholder
      // job entry to establish the location. In a real system, you might want a separate locations table.
      // For now, we'll just return the location data as if it was created.
      
      return {
        location,
        city,
        state,
        country,
        is_active,
        created_at: new Date().toISOString(),
        message: 'Location reference created (locations are derived from jobs in this system)'
      };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }
  // Get all unique locations from jobs table
  static async getAll() {
    try {
      const query = `
        SELECT 
          location,
          COUNT(*) as job_count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_job_count,
          MAX(created_at) as last_job_posted
        FROM jobs 
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY job_count DESC, location ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // Get location statistics
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT location) as total_locations,
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_jobs,
          COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as jobs_last_30_days
        FROM jobs 
        WHERE location IS NOT NULL AND location != ''
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching location stats:', error);
      throw error;
    }
  }

  // Get locations with pagination and search
  static async getPaginated(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE location IS NOT NULL AND location != \'\'';
      let queryParams = [];
      let paramIndex = 1;
      
      if (search) {
        whereClause += ` AND location ILIKE $${paramIndex}`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      const countQuery = `
        SELECT COUNT(DISTINCT location) as total
        FROM jobs 
        ${whereClause}
      `;
      
      const locationsQuery = `
        SELECT 
          location,
          COUNT(*) as job_count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_job_count,
          COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_job_count,
          MAX(created_at) as last_job_posted,
          MIN(created_at) as first_job_posted
        FROM jobs 
        ${whereClause}
        GROUP BY location
        ORDER BY job_count DESC, location ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(limit, offset);
      
      const [countResult, locationsResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, paramIndex - 1)),
        pool.query(locationsQuery, queryParams)
      ]);
      
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      return {
        locations: locationsResult.rows,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching paginated locations:', error);
      throw error;
    }
  }

  // Get location details with jobs
  static async getDetails(location) {
    try {
      const query = `
        SELECT 
          location,
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_jobs,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_jobs,
          COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as jobs_this_week,
          COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as jobs_this_month,
          array_agg(DISTINCT c.name) as categories,
          array_agg(DISTINCT company_name) as companies,
          MIN(salary_min) as min_salary,
          MAX(salary_max) as max_salary,
          AVG(CASE WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN (salary_min + salary_max) / 2 END) as avg_salary
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        WHERE j.location = $1 AND j.location IS NOT NULL AND j.location != ''
        GROUP BY j.location
      `;
      
      const result = await pool.query(query, [location]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching location details:', error);
      throw error;
    }
  }

  // Get jobs by location
  static async getJobs(location, page = 1, limit = 10, activeOnly = true) {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE location = $1 AND location IS NOT NULL AND location != \'\'';
      const queryParams = [location];
      let paramIndex = 2;
      
      if (activeOnly) {
        whereClause += ` AND is_active = true`;
      }
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM jobs 
        ${whereClause}
      `;
      
      const jobsQuery = `
        SELECT 
          id,
          title,
          slug,
          company_name,
          company_logo,
          salary_min,
          salary_max,
          salary_currency,
          experience_level,
          job_type,
          is_active,
          is_featured,
          posted_date,
          application_deadline,
          c.name as category_name,
          c.slug as category_slug
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        ${whereClause}
        ORDER BY posted_date DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(limit, offset);
      
      const [countResult, jobsResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, 1)),
        pool.query(jobsQuery, queryParams)
      ]);
      
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      return {
        jobs: jobsResult.rows,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching jobs by location:', error);
      throw error;
    }
  }

  // Update location name (update all jobs with this location)
  static async updateLocation(oldLocation, newLocation) {
    try {
      if (!newLocation || newLocation.trim() === '') {
        throw new Error('New location name cannot be empty');
      }

      const query = `
        UPDATE jobs 
        SET location = $1, updated_at = CURRENT_TIMESTAMP
        WHERE location = $2
        RETURNING id, title, company_name, location
      `;
      
      const result = await pool.query(query, [newLocation.trim(), oldLocation]);
      return result.rows;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Delete location (set location to null for all jobs with this location)
  static async deleteLocation(location) {
    try {
      const query = `
        UPDATE jobs 
        SET location = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE location = $1
        RETURNING id, title, company_name
      `;
      
      const result = await pool.query(query, [location]);
      return result.rows;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  // Get location trends (job postings over time)
  static async getTrends(location, days = 30) {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('day', posted_date) as date,
          COUNT(*) as job_postings,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_postings
        FROM jobs 
        WHERE location = $1 
        AND posted_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE_TRUNC('day', posted_date)
        ORDER BY date ASC
      `;
      
      const result = await pool.query(query, [location]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching location trends:', error);
      throw error;
    }
  }

  // Get top locations by job count
  static async getTopLocations(limit = 10) {
    try {
      const query = `
        SELECT 
          location,
          COUNT(*) as job_count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_job_count
        FROM jobs 
        WHERE location IS NOT NULL AND location != ''
        GROUP BY location
        ORDER BY job_count DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching top locations:', error);
      throw error;
    }
  }
}

export default Location;
