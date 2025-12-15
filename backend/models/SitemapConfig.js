import { query } from '../config/database.js';

class SitemapConfig {
  // Get all sitemap configurations
  static async getAll(filters = {}) {
    let whereClause = 'WHERE sc.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (filters.name) {
      whereClause += ` AND sc.name ILIKE $${paramIndex}`;
      params.push(`%${filters.name}%`);
      paramIndex++;
    }

    const sql = `
      SELECT 
        sc.*,
        COUNT(j.id) as job_count,
        COUNT(c.id) as company_count
      FROM sitemap_config sc
      LEFT JOIN jobs j ON (sc.url_pattern = '/jobs' OR sc.url_pattern LIKE '/jobs/%') AND j.is_active = true
      LEFT JOIN companies c ON (sc.url_pattern = '/companies' OR sc.url_pattern LIKE '/companies/%') AND c.is_active = true
      ${whereClause}
      GROUP BY sc.id
      ORDER BY sc.priority DESC, sc.name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get sitemap config by ID
  static async getById(id) {
    const sql = `
      SELECT * FROM sitemap_config 
      WHERE id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Create new sitemap config
  static async create(data) {
    const sql = `
      INSERT INTO sitemap_config (
        name, url_pattern, priority, change_frequency, include_last_mod, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING *
    `;

    const params = [
      data.name,
      data.url_pattern,
      data.priority || 0.8,
      data.change_frequency || 'weekly',
      data.include_last_mod !== undefined ? data.include_last_mod : true,
      data.is_active !== undefined ? data.is_active : true
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Update sitemap config
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const updateFields = [
      'name', 'url_pattern', 'priority', 'change_frequency', 
      'include_last_mod', 'is_active'
    ];

    updateFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        params.push(data[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `
      UPDATE sitemap_config 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Delete sitemap config
  static async delete(id) {
    const sql = 'DELETE FROM sitemap_config WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id) {
    const sql = `
      UPDATE sitemap_config 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Generate sitemap XML
  static async generateSitemapXml(baseUrl = 'https://fasthiremela.com') {
    const sql = 'SELECT generate_sitemap_xml($1) as sitemap_xml';
    const result = await query(sql, [baseUrl]);
    return result.rows[0].sitemap_xml;
  }

  // Get sitemap statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_configs,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_configs,
        COUNT(CASE WHEN change_frequency = 'daily' THEN 1 END) as daily_configs,
        COUNT(CASE WHEN change_frequency = 'weekly' THEN 1 END) as weekly_configs,
        COUNT(CASE WHEN change_frequency = 'monthly' THEN 1 END) as monthly_configs,
        AVG(priority) as avg_priority,
        COUNT(CASE WHEN include_last_mod = true THEN 1 END) as with_lastmod
      FROM sitemap_config
    `;
    
    const result = await query(sql);
    return result.rows[0];
  }

  // Validate URL pattern
  static validateUrlPattern(pattern) {
    if (!pattern || typeof pattern !== 'string') {
      return false;
    }
    
    // Basic URL pattern validation
    const validPatterns = [
      /^\/$/,                    // Root
      /^\/[a-zA-Z0-9-]+$/,       // Simple path
      /^\/[a-zA-Z0-9-]+\/$/,     // Path with trailing slash
      /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/, // Nested path
      /^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/$/ // Nested path with trailing slash
    ];
    
    return validPatterns.some(regex => regex.test(pattern));
  }

  // Check if name already exists
  static async nameExists(name, excludeId = null) {
    let sql = 'SELECT id FROM sitemap_config WHERE name = $1';
    const params = [name];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  // Check if URL pattern already exists
  static async urlPatternExists(urlPattern, excludeId = null) {
    let sql = 'SELECT id FROM sitemap_config WHERE url_pattern = $1';
    const params = [urlPattern];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}

export default SitemapConfig;
