import { query } from '../config/database.js';

class SeoSettings {
  // Get all SEO settings
  static async getAll(filters = {}) {
    let whereClause = 'WHERE ss.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (filters.setting_type) {
      whereClause += ` AND ss.setting_type = $${paramIndex}`;
      params.push(filters.setting_type);
      paramIndex++;
    }

    if (filters.page_type) {
      whereClause += ` AND ss.page_type = $${paramIndex}`;
      params.push(filters.page_type);
      paramIndex++;
    }

    const sql = `
      SELECT 
        ss.*,
        CASE 
          WHEN ss.setting_type = 'global' THEN 'Global Settings'
          WHEN ss.setting_type = 'homepage' THEN 'Homepage'
          WHEN ss.setting_type = 'jobs' AND ss.page_type = 'job_listing' THEN 'Jobs Listing'
          WHEN ss.setting_type = 'jobs' AND ss.page_type = 'job_detail' THEN 'Job Detail'
          WHEN ss.setting_type = 'companies' AND ss.page_type = 'company_listing' THEN 'Companies Listing'
          WHEN ss.setting_type = 'companies' AND ss.page_type = 'company_detail' THEN 'Company Detail'
          WHEN ss.setting_type = 'blog' AND ss.page_type = 'blog_listing' THEN 'Blog Listing'
          WHEN ss.setting_type = 'blog' AND ss.page_type = 'blog_detail' THEN 'Blog Detail'
          ELSE ss.setting_type
        END as display_name
      FROM seo_settings ss
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN ss.setting_type = 'global' THEN 1
          WHEN ss.setting_type = 'homepage' THEN 2
          ELSE 3
        END,
        ss.setting_type,
        ss.page_type
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get SEO setting by ID
  static async getById(id) {
    const sql = `
      SELECT 
        ss.*,
        CASE 
          WHEN ss.setting_type = 'global' THEN 'Global Settings'
          WHEN ss.setting_type = 'homepage' THEN 'Homepage'
          WHEN ss.setting_type = 'jobs' AND ss.page_type = 'job_listing' THEN 'Jobs Listing'
          WHEN ss.setting_type = 'jobs' AND ss.page_type = 'job_detail' THEN 'Job Detail'
          WHEN ss.setting_type = 'companies' AND ss.page_type = 'company_listing' THEN 'Companies Listing'
          WHEN ss.setting_type = 'companies' AND ss.page_type = 'company_detail' THEN 'Company Detail'
          WHEN ss.setting_type = 'blog' AND ss.page_type = 'blog_listing' THEN 'Blog Listing'
          WHEN ss.setting_type = 'blog' AND ss.page_type = 'blog_detail' THEN 'Blog Detail'
          ELSE ss.setting_type
        END as display_name
      FROM seo_settings ss
      WHERE ss.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get SEO settings for a specific page type
  static async getByPageType(pageType, settingType = null) {
    const sql = `
      SELECT 
        ss.id,
        ss.meta_title,
        ss.meta_description,
        ss.meta_keywords,
        ss.og_title,
        ss.og_description,
        ss.og_image,
        ss.twitter_card,
        ss.twitter_title,
        ss.twitter_description,
        ss.twitter_image,
        ss.canonical_url,
        ss.robots_meta,
        ss.json_ld_schema
      FROM seo_settings ss
      WHERE ss.is_active = true
      AND (
        ($2 IS NOT NULL AND ss.setting_type = $2 AND ss.page_type = $1)
        OR ($2 IS NULL AND ss.page_type = $1)
        OR ($2 IS NULL AND ss.setting_type = 'global' AND ss.page_type IS NULL)
      )
      ORDER BY 
        CASE 
          WHEN ss.setting_type = 'global' THEN 3
          WHEN ss.page_type = $1 THEN 2
          ELSE 1
        END DESC
      LIMIT 1
    `;
    
    const result = await query(sql, [pageType, settingType]);
    return result.rows[0];
  }

  // Create new SEO setting
  static async create(data) {
    const sql = `
      INSERT INTO seo_settings (
        setting_type, page_type, meta_title, meta_description, meta_keywords,
        og_title, og_description, og_image, twitter_card, twitter_title,
        twitter_description, twitter_image, canonical_url, robots_meta,
        json_ld_schema, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *
    `;

    const params = [
      data.setting_type,
      data.page_type || null,
      data.meta_title || null,
      data.meta_description || null,
      data.meta_keywords || null,
      data.og_title || null,
      data.og_description || null,
      data.og_image || null,
      data.twitter_card || 'summary_large_image',
      data.twitter_title || null,
      data.twitter_description || null,
      data.twitter_image || null,
      data.canonical_url || null,
      data.robots_meta || 'index, follow',
      data.json_ld_schema ? JSON.stringify(data.json_ld_schema) : null,
      data.is_active !== undefined ? data.is_active : true
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Update SEO setting
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    // Build dynamic update query
    const updateFields = [
      'setting_type', 'page_type', 'meta_title', 'meta_description', 'meta_keywords',
      'og_title', 'og_description', 'og_image', 'twitter_card', 'twitter_title',
      'twitter_description', 'twitter_image', 'canonical_url', 'robots_meta',
      'json_ld_schema', 'is_active'
    ];

    updateFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        if (field === 'json_ld_schema' && data[field]) {
          params.push(JSON.stringify(data[field]));
        } else {
          params.push(data[field]);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `
      UPDATE seo_settings 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Delete SEO setting
  static async delete(id) {
    const sql = 'DELETE FROM seo_settings WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id) {
    const sql = `
      UPDATE seo_settings 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get SEO settings summary
  static async getSummary() {
    const sql = `
      SELECT 
        COUNT(*) as total_settings,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_settings,
        COUNT(CASE WHEN setting_type = 'global' THEN 1 END) as global_settings,
        COUNT(CASE WHEN setting_type = 'homepage' THEN 1 END) as homepage_settings,
        COUNT(CASE WHEN setting_type = 'jobs' THEN 1 END) as jobs_settings,
        COUNT(CASE WHEN setting_type = 'companies' THEN 1 END) as companies_settings,
        COUNT(CASE WHEN setting_type = 'blog' THEN 1 END) as blog_settings
      FROM seo_settings
    `;
    
    const result = await query(sql);
    return result.rows[0];
  }
}

export default SeoSettings;
