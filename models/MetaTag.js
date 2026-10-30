import { query } from '../config/database.js';

class MetaTag {
  // Get all meta tags
  static async getAll(filters = {}) {
    let whereClause = 'WHERE mt.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (filters.name) {
      whereClause += ` AND mt.name ILIKE $${paramIndex}`;
      params.push(`%${filters.name}%`);
      paramIndex++;
    }

    if (filters.tag_type) {
      whereClause += ` AND mt.tag_type = $${paramIndex}`;
      params.push(filters.tag_type);
      paramIndex++;
    }

    const sql = `
      SELECT 
        mt.*,
        CASE 
          WHEN mt.tag_type = 'meta_name' THEN 'Meta Name'
          WHEN mt.tag_type = 'meta_property' THEN 'Meta Property'
          WHEN mt.tag_type = 'meta_http_equiv' THEN 'HTTP-Equiv'
          ELSE 'Unknown'
        END as type_description
      FROM meta_tags mt
      ${whereClause}
      ORDER BY mt.tag_type, mt.name
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get meta tag by ID
  static async getById(id) {
    const sql = `
      SELECT 
        mt.*,
        CASE 
          WHEN mt.tag_type = 'meta_name' THEN 'Meta Name'
          WHEN mt.tag_type = 'meta_property' THEN 'Meta Property'
          WHEN mt.tag_type = 'meta_http_equiv' THEN 'HTTP-Equiv'
          ELSE 'Unknown'
        END as type_description
      FROM meta_tags mt
      WHERE mt.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get meta tags by type
  static async getByType(tagType) {
    const sql = `
      SELECT * FROM meta_tags 
      WHERE tag_type = $1 AND is_active = true
      ORDER BY name
    `;
    
    const result = await query(sql, [tagType]);
    return result.rows;
  }

  // Get global meta tags
  static async getGlobal() {
    const sql = `
      SELECT * FROM meta_tags 
      WHERE is_global = true AND is_active = true
      ORDER BY tag_type, name
    `;
    
    const result = await query(sql);
    return result.rows;
  }

  // Create new meta tag
  static async create(data) {
    const sql = `
      INSERT INTO meta_tags (
        name, content, tag_type, is_global, is_active
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *
    `;

    const params = [
      data.name,
      data.content,
      data.tag_type || 'meta_name',
      data.is_global !== undefined ? data.is_global : false,
      data.is_active !== undefined ? data.is_active : true
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Update meta tag
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const updateFields = ['name', 'content', 'tag_type', 'is_global', 'is_active'];

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
      UPDATE meta_tags 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Delete meta tag
  static async delete(id) {
    const sql = 'DELETE FROM meta_tags WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id) {
    const sql = `
      UPDATE meta_tags 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Toggle global status
  static async toggleGlobal(id) {
    const sql = `
      UPDATE meta_tags 
      SET is_global = NOT is_global, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get meta tag statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_tags,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_tags,
        COUNT(CASE WHEN is_global = true THEN 1 END) as global_tags,
        COUNT(CASE WHEN tag_type = 'meta_name' THEN 1 END) as meta_name_tags,
        COUNT(CASE WHEN tag_type = 'meta_property' THEN 1 END) as meta_property_tags,
        COUNT(CASE WHEN tag_type = 'meta_http_equiv' THEN 1 END) as http_equiv_tags
      FROM meta_tags
    `;
    
    const result = await query(sql);
    return result.rows[0];
  }

  // Validate tag type
  static validateTagType(type) {
    const validTypes = ['meta_name', 'meta_property', 'meta_http_equiv'];
    return validTypes.includes(type);
  }

  // Check if meta tag already exists
  static async metaTagExists(name, tagType, excludeId = null) {
    let sql = 'SELECT id FROM meta_tags WHERE name = $1 AND tag_type = $2';
    const params = [name, tagType];
    
    if (excludeId) {
      sql += ' AND id != $3';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  // Generate meta tag HTML
  static generateHtml(metaTag) {
    if (!metaTag || !metaTag.name || !metaTag.content) {
      return '';
    }

    switch (metaTag.tag_type) {
      case 'meta_name':
        return `<meta name="${metaTag.name}" content="${metaTag.content}">`;
      case 'meta_property':
        return `<meta property="${metaTag.name}" content="${metaTag.content}">`;
      case 'meta_http_equiv':
        return `<meta http-equiv="${metaTag.name}" content="${metaTag.content}">`;
      default:
        return '';
    }
  }

  // Generate all global meta tags HTML
  static async generateGlobalHtml() {
    const globalTags = await this.getGlobal();
    return globalTags.map(tag => this.generateHtml(tag)).join('\n    ');
  }

  // Get common meta tag suggestions
  static getCommonMetaTags() {
    return [
      // Meta Name tags
      { name: 'description', tag_type: 'meta_name', description: 'Page description' },
      { name: 'keywords', tag_type: 'meta_name', description: 'Page keywords' },
      { name: 'author', tag_type: 'meta_name', description: 'Page author' },
      { name: 'robots', tag_type: 'meta_name', description: 'Search engine directives' },
      { name: 'viewport', tag_type: 'meta_name', description: 'Viewport settings' },
      { name: 'theme-color', tag_type: 'meta_name', description: 'Theme color for mobile browsers' },
      
      // Meta Property tags (Open Graph)
      { name: 'og:title', tag_type: 'meta_property', description: 'Open Graph title' },
      { name: 'og:description', tag_type: 'meta_property', description: 'Open Graph description' },
      { name: 'og:image', tag_type: 'meta_property', description: 'Open Graph image' },
      { name: 'og:url', tag_type: 'meta_property', description: 'Open Graph URL' },
      { name: 'og:type', tag_type: 'meta_property', description: 'Open Graph type' },
      { name: 'og:site_name', tag_type: 'meta_property', description: 'Open Graph site name' },
      
      // Twitter Card tags
      { name: 'twitter:card', tag_type: 'meta_name', description: 'Twitter card type' },
      { name: 'twitter:title', tag_type: 'meta_name', description: 'Twitter card title' },
      { name: 'twitter:description', tag_type: 'meta_name', description: 'Twitter card description' },
      { name: 'twitter:image', tag_type: 'meta_name', description: 'Twitter card image' },
      { name: 'twitter:site', tag_type: 'meta_name', description: 'Twitter site handle' },
      { name: 'twitter:creator', tag_type: 'meta_name', description: 'Twitter creator handle' },
      
      // HTTP-Equiv tags
      { name: 'content-type', tag_type: 'meta_http_equiv', description: 'Content type' },
      { name: 'refresh', tag_type: 'meta_http_equiv', description: 'Page refresh' },
      { name: 'expires', tag_type: 'meta_http_equiv', description: 'Page expiration' }
    ];
  }

  // Validate meta tag data
  static validateMetaTag(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push('Content is required and must be a non-empty string');
    }

    if (data.tag_type && !this.validateTagType(data.tag_type)) {
      errors.push('Invalid tag type. Must be: meta_name, meta_property, or meta_http_equiv');
    }

    return errors;
  }

  // Bulk import meta tags
  static async bulkImport(metaTags) {
    const results = {
      success: [],
      errors: []
    };

    for (const tagData of metaTags) {
      try {
        // Validate data
        const validationErrors = this.validateMetaTag(tagData);
        if (validationErrors.length > 0) {
          results.errors.push({
            data: tagData,
            error: validationErrors.join(', ')
          });
          continue;
        }

        // Check if meta tag already exists
        const existing = await this.metaTagExists(
          tagData.name, 
          tagData.tag_type || 'meta_name'
        );
        if (existing) {
          results.errors.push({
            data: tagData,
            error: 'Meta tag with this name and type already exists'
          });
          continue;
        }

        // Create meta tag
        const metaTag = await this.create({
          name: tagData.name,
          content: tagData.content,
          tag_type: tagData.tag_type || 'meta_name',
          is_global: tagData.is_global !== false,
          is_active: tagData.is_active !== false
        });

        results.success.push(metaTag);

      } catch (error) {
        results.errors.push({
          data: tagData,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default MetaTag;
