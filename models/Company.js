import { query } from '../config/database.js';

export class Company {
  // Create new company
  static async create(companyData) {
    try {
      const {
        name, description, logo, website, industry, size,
        founded_year, headquarters, social_links, is_verified
      } = companyData;

      const result = await query(
        `INSERT INTO companies (
          name, description, logo, website, industry, size,
          founded_year, headquarters, social_links, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          name, description, logo, website, industry, size,
          founded_year, headquarters, social_links, is_verified || false
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Find company by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count,
               MAX(j.created_at) as latest_job_posted
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding company by ID:', error);
      throw error;
    }
  }

  // Get all companies with pagination
  static async getAll(limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count,
               MAX(j.created_at) as latest_job_posted
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        GROUP BY c.id
        ORDER BY c.is_verified DESC, c.name ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  }

  // Update company
  static async update(id, companyData) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(companyData[key]);
        }
      });

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Delete company
  static async delete(id) {
    try {
      const result = await query(
        `DELETE FROM companies WHERE id = $1 RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Search companies
  static async search(searchTerm, limit = 20) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE (c.name ILIKE $1 OR c.description ILIKE $1 OR c.industry ILIKE $1)
        GROUP BY c.id
        ORDER BY c.is_verified DESC, c.name ASC
        LIMIT $2
      `, [`%${searchTerm}%`, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  // Get verified companies
  static async getVerified(limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE c.is_verified = true
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting verified companies:', error);
      throw error;
    }
  }

  // Get top companies by job count
  static async getTopCompanies(limit = 10) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count,
               MAX(j.created_at) as latest_job_posted
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        GROUP BY c.id
        HAVING COUNT(j.id) > 0
        ORDER BY job_count DESC, c.name ASC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting top companies:', error);
      throw error;
    }
  }

  // Verify company
  static async verify(id) {
    try {
      const result = await query(
        `UPDATE companies 
         SET is_verified = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error verifying company:', error);
      throw error;
    }
  }

  // Get company statistics
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_companies,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_companies,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_companies_last_30_days,
          COUNT(CASE WHEN EXISTS (SELECT 1 FROM jobs WHERE company_id = companies.id AND is_active = true) THEN 1 END) as companies_with_jobs
        FROM companies
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting company stats:', error);
      throw error;
    }
  }

  // Get companies by industry
  static async getByIndustry(industry, limit = 20, offset = 0) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE c.industry ILIKE $1
        GROUP BY c.id
        ORDER BY c.is_verified DESC, c.name ASC
        LIMIT $2 OFFSET $3
      `, [`%${industry}%`, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting companies by industry:', error);
      throw error;
    }
  }

  // Get industries list
  static async getIndustries() {
    try {
      const result = await query(`
        SELECT industry, COUNT(*) as company_count
        FROM companies 
        WHERE industry IS NOT NULL AND industry != ''
        GROUP BY industry
        ORDER BY company_count DESC, industry ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting industries:', error);
      throw error;
    }
  }
}

export default Company;
