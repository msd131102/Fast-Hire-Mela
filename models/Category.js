import { query } from '../config/database.js';

export class Category {
  // Create new category
  static async create(categoryData) {
    try {
      const { name, slug, description, icon, color, is_active } = categoryData;

      // Generate slug if not provided
      const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const result = await query(
        `INSERT INTO categories (name, slug, description, icon, color, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, categorySlug, description, icon, color, is_active !== false]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Find category by ID
  static async findById(id) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding category by ID:', error);
      throw error;
    }
  }

  // Find category by name
  static async findByName(name) {
    try {
      const result = await query(
        'SELECT * FROM categories WHERE name = $1',
        [name]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding category by name:', error);
      throw error;
    }
  }

  // Get all active categories
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, categoryData) {
    try {
      // Filter out invalid fields and map field names
      const validFields = {};
      const fieldMapping = {
        'isactive': 'is_active',  // Map frontend field to database column
        'isActive': 'is_active'   // Map camelCase frontend field to database column
      };
      
      Object.keys(categoryData).forEach(key => {
        const dbField = fieldMapping[key] || key;
        // Only include fields that exist in database
        if (['name', 'slug', 'description', 'color', 'icon', 'is_active'].includes(dbField)) {
          validFields[dbField] = categoryData[key];
        }
      });

      const validKeys = Object.keys(validFields);
      if (validKeys.length === 0) {
        throw new Error('No valid fields to update');
      }

      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query with valid fields only
      validKeys.forEach(key => {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(validFields[key]);
      });

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category (soft delete)
  static async delete(id) {
    try {
      const result = await query(
        `UPDATE categories 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get popular categories by job count
  static async getPopular(limit = 10) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id
        HAVING COUNT(j.id) > 0
        ORDER BY job_count DESC, c.name ASC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting popular categories:', error);
      throw error;
    }
  }

  // Search categories
  static async search(searchTerm, limit = 20) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        WHERE c.is_active = true 
        AND (c.name ILIKE $1 OR c.description ILIKE $1)
        GROUP BY c.id
        ORDER BY job_count DESC, c.name ASC
        LIMIT $2
      `, [`%${searchTerm}%`, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  // Get category statistics
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_categories,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_categories_last_30_days,
          COUNT(CASE WHEN EXISTS (SELECT 1 FROM jobs WHERE category_id = categories.id AND is_active = true) THEN 1 END) as categories_with_jobs
        FROM categories
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw error;
    }
  }

  // Activate category
  static async activate(id) {
    try {
      const result = await query(
        `UPDATE categories 
         SET is_active = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error activating category:', error);
      throw error;
    }
  }

  // Deactivate category
  static async deactivate(id) {
    try {
      const result = await query(
        `UPDATE categories 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deactivating category:', error);
      throw error;
    }
  }

  // Get categories with job trends
  static async getWithJobTrends(days = 30) {
    try {
      const result = await query(`
        SELECT c.*, 
               COUNT(j.id) as total_jobs,
               COUNT(CASE WHEN j.created_at >= CURRENT_DATE - INTERVAL '${days} days' THEN 1 END) as recent_jobs,
               COUNT(CASE WHEN j.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_jobs
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY recent_jobs DESC, total_jobs DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting categories with trends:', error);
      throw error;
    }
  }

  // Check if category has jobs
  static async hasJobs(id) {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM jobs WHERE category_id = $1 AND is_active = true',
        [id]
      );
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking if category has jobs:', error);
      throw error;
    }
  }

  // Find all categories with optional job count and active filter
  static async findAll(includeJobCount = false, activeOnly = true, limit = null) {
    try {
      let queryStr = `
        SELECT c.*
        ${includeJobCount ? ', COUNT(j.id) as job_count' : ''}
        FROM categories c
        ${includeJobCount ? 'LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true' : ''}
        ${activeOnly ? 'WHERE c.is_active = true' : ''}
        ${includeJobCount ? 'GROUP BY c.id' : ''}
        ORDER BY c.name ASC
        ${limit ? `LIMIT ${limit}` : ''}
      `;
      
      const result = await query(queryStr);
      return result.rows;
    } catch (error) {
      console.error('Error finding all categories:', error);
      throw error;
    }
  }

  // Find category by slug
  static async findBySlug(slug, includeJobCount = false) {
    try {
      let queryStr = `
        SELECT c.*
        ${includeJobCount ? ', COUNT(j.id) as job_count' : ''}
        FROM categories c
        ${includeJobCount ? 'LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true' : ''}
        WHERE c.slug = $1
        ${includeJobCount ? 'GROUP BY c.id' : ''}
      `;
      
      const result = await query(queryStr, [slug]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding category by slug:', error);
      throw error;
    }
  }

  // Find popular categories (alias for getPopular)
  static async findPopular(limit = 10) {
    try {
      return await this.getPopular(limit);
    } catch (error) {
      console.error('Error finding popular categories:', error);
      throw error;
    }
  }
}

export default Category;
