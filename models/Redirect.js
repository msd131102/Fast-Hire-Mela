import { query } from '../config/database.js';

class Redirect {
  // Get all redirects
  static async getAll(filters = {}) {
    let whereClause = 'WHERE r.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (filters.from_path) {
      whereClause += ` AND r.from_path ILIKE $${paramIndex}`;
      params.push(`%${filters.from_path}%`);
      paramIndex++;
    }

    if (filters.to_url) {
      whereClause += ` AND r.to_url ILIKE $${paramIndex}`;
      params.push(`%${filters.to_url}%`);
      paramIndex++;
    }

    if (filters.status_code) {
      whereClause += ` AND r.status_code = $${paramIndex}`;
      params.push(filters.status_code);
      paramIndex++;
    }

    const sql = `
      SELECT 
        r.*,
        CASE 
          WHEN r.status_code = 301 THEN 'Moved Permanently'
          WHEN r.status_code = 302 THEN 'Found (Temporary)'
          WHEN r.status_code = 303 THEN 'See Other'
          WHEN r.status_code = 307 THEN 'Temporary Redirect'
          WHEN r.status_code = 308 THEN 'Permanent Redirect'
          ELSE 'Unknown'
        END as status_description
      FROM redirects r
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  // Get redirect by ID
  static async getById(id) {
    const sql = `
      SELECT 
        r.*,
        CASE 
          WHEN r.status_code = 301 THEN 'Moved Permanently'
          WHEN r.status_code = 302 THEN 'Found (Temporary)'
          WHEN r.status_code = 303 THEN 'See Other'
          WHEN r.status_code = 307 THEN 'Temporary Redirect'
          WHEN r.status_code = 308 THEN 'Permanent Redirect'
          ELSE 'Unknown'
        END as status_description
      FROM redirects r
      WHERE r.id = $1
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get redirect by from_path
  static async getByFromPath(fromPath) {
    const sql = `
      SELECT * FROM redirects 
      WHERE from_path = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await query(sql, [fromPath]);
    return result.rows[0];
  }

  // Create new redirect
  static async create(data) {
    const sql = `
      INSERT INTO redirects (
        from_path, to_url, status_code, is_active
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING *
    `;

    const params = [
      data.from_path,
      data.to_url,
      data.status_code || 301,
      data.is_active !== undefined ? data.is_active : true
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Update redirect
  static async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    const updateFields = ['from_path', 'to_url', 'status_code', 'is_active'];

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
      UPDATE redirects 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Delete redirect
  static async delete(id) {
    const sql = 'DELETE FROM redirects WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Toggle active status
  static async toggleActive(id) {
    const sql = `
      UPDATE redirects 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get redirect statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_redirects,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_redirects,
        COUNT(CASE WHEN status_code = 301 THEN 1 END) as permanent_redirects,
        COUNT(CASE WHEN status_code = 302 THEN 1 END) as temporary_redirects,
        COUNT(CASE WHEN status_code = 303 THEN 1 END) as see_other_redirects,
        COUNT(CASE WHEN status_code = 307 THEN 1 END) as temp_redirects,
        COUNT(CASE WHEN status_code = 308 THEN 1 END) as perm_redirects
      FROM redirects
    `;
    
    const result = await query(sql);
    return result.rows[0];
  }

  // Validate from_path format
  static validateFromPath(path) {
    if (!path || typeof path !== 'string') {
      return false;
    }
    
    // Should start with / and not contain spaces
    return /^\/[^\s]+$/.test(path);
  }

  // Validate to_url format
  static validateToUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    // Can be relative (starting with /) or absolute (starting with http)
    return /^\/|^https?:\/\//.test(url);
  }

  // Validate status code
  static validateStatusCode(code) {
    const validCodes = [301, 302, 303, 307, 308];
    return validCodes.includes(code);
  }

  // Check if from_path already exists
  static async fromPathExists(fromPath, excludeId = null) {
    let sql = 'SELECT id FROM redirects WHERE from_path = $1';
    const params = [fromPath];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  // Test redirect path
  static async testRedirect(fromPath) {
    const redirect = await this.getByFromPath(fromPath);
    
    if (!redirect) {
      return {
        found: false,
        message: 'No redirect found for this path'
      };
    }
    
    return {
      found: true,
      redirect: {
        from_path: redirect.from_path,
        to_url: redirect.to_url,
        status_code: redirect.status_code,
        is_active: redirect.is_active
      },
      message: `Redirect found: ${redirect.from_path} → ${redirect.to_url} (${redirect.status_code})`
    };
  }

  // Bulk import redirects
  static async bulkImport(redirects) {
    const results = {
      success: [],
      errors: []
    };

    for (const redirectData of redirects) {
      try {
        // Validate required fields
        if (!redirectData.from_path || !redirectData.to_url) {
          results.errors.push({
            data: redirectData,
            error: 'Missing required fields: from_path and to_url'
          });
          continue;
        }

        // Check if from_path already exists
        const existing = await this.fromPathExists(redirectData.from_path);
        if (existing) {
          results.errors.push({
            data: redirectData,
            error: 'from_path already exists'
          });
          continue;
        }

        // Validate formats
        if (!this.validateFromPath(redirectData.from_path)) {
          results.errors.push({
            data: redirectData,
            error: 'Invalid from_path format'
          });
          continue;
        }

        if (!this.validateToUrl(redirectData.to_url)) {
          results.errors.push({
            data: redirectData,
            error: 'Invalid to_url format'
          });
          continue;
        }

        const status_code = redirectData.status_code || 301;
        if (!this.validateStatusCode(status_code)) {
          results.errors.push({
            data: redirectData,
            error: 'Invalid status code'
          });
          continue;
        }

        // Create redirect
        const redirect = await this.create({
          from_path: redirectData.from_path,
          to_url: redirectData.to_url,
          status_code: status_code,
          is_active: redirectData.is_active !== false
        });

        results.success.push(redirect);

      } catch (error) {
        results.errors.push({
          data: redirectData,
          error: error.message
        });
      }
    }

    return results;
  }
}

export default Redirect;
