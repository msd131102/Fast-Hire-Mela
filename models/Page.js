import { query } from '../config/database.js';

export class Page {
  // Create a new page
  static async create(pageData) {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status = 'published',
      is_homepage = false,
      template = 'default',
      featured_image,
      author_id,
      published_at
    } = pageData;

    try {
      // If this is set as homepage, unset all other homepages
      if (is_homepage) {
        await query(
          'UPDATE pages SET is_homepage = false, updated_at = CURRENT_TIMESTAMP'
        );
      }

      const result = await query(
        `INSERT INTO pages (
          title, slug, content, meta_title, meta_description, 
          meta_keywords, status, is_homepage, template, 
          featured_image, author_id, published_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          title, slug, content, meta_title, meta_description,
          meta_keywords, status, is_homepage, template,
          featured_image, author_id, published_at || new Date()
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  // Get all pages with filtering and pagination
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      author_id,
      template,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (author_id) {
      whereConditions.push(`author_id = $${paramIndex}`);
      queryParams.push(author_id);
      paramIndex++;
    }

    if (template) {
      whereConditions.push(`template = $${paramIndex}`);
      queryParams.push(template);
      paramIndex++;
    }

    // Build the query
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const pagesQuery = `
      SELECT 
        p.*,
        u.name as author_name,
        u.email as author_email
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pages p
      ${whereClause}
    `;

    try {
      const [pagesResult, countResult] = await Promise.all([
        query(pagesQuery, queryParams),
        query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
      ]);

      return {
        pages: pagesResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }
  }

  // Get page by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT 
          p.*,
          u.name as author_name,
          u.email as author_email
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  // Get page by slug
  static async findBySlug(slug) {
    try {
      const result = await query(
        `SELECT 
          p.*,
          u.name as author_name,
          u.email as author_email
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.slug = $1 AND p.status = 'published'`,
        [slug]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch page by slug: ${error.message}`);
    }
  }

  // Get homepage
  static async findHomepage() {
    try {
      const result = await query(
        `SELECT 
          p.*,
          u.name as author_name,
          u.email as author_email
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_homepage = true AND p.status = 'published'
        ORDER BY p.updated_at DESC
        LIMIT 1`
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch homepage: ${error.message}`);
    }
  }

  // Update page
  static async update(id, updateData) {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status,
      is_homepage,
      template,
      featured_image,
      author_id,
      published_at
    } = updateData;

    try {
      // If this is set as homepage, unset all other homepages
      if (is_homepage) {
        await query(
          'UPDATE pages SET is_homepage = false, updated_at = CURRENT_TIMESTAMP WHERE id != $1',
          [id]
        );
      }

      const result = await query(
        `UPDATE pages SET 
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          content = COALESCE($3, content),
          meta_title = COALESCE($4, meta_title),
          meta_description = COALESCE($5, meta_description),
          meta_keywords = COALESCE($6, meta_keywords),
          status = COALESCE($7, status),
          is_homepage = COALESCE($8, is_homepage),
          template = COALESCE($9, template),
          featured_image = COALESCE($10, featured_image),
          author_id = COALESCE($11, author_id),
          published_at = COALESCE($12, published_at),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *`,
        [
          title, slug, content, meta_title, meta_description,
          meta_keywords, status, is_homepage, template,
          featured_image, author_id, published_at, id
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update page: ${error.message}`);
    }
  }

  // Delete page
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM pages WHERE id = $1 RETURNING *',
        [id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete page: ${error.message}`);
    }
  }

  // Check if slug exists
  static async slugExists(slug, excludeId = null) {
    try {
      let queryText = 'SELECT id FROM pages WHERE slug = $1';
      let queryParams = [slug];

      if (excludeId) {
        queryText += ' AND id != $2';
        queryParams.push(excludeId);
      }

      const result = await query(queryText, queryParams);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check slug: ${error.message}`);
    }
  }

  // Get page statistics
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_pages,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_pages,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_pages,
          COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_pages,
          COUNT(CASE WHEN is_homepage = true THEN 1 END) as homepage_pages,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_pages
        FROM pages
      `);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get page statistics: ${error.message}`);
    }
  }

  // Get recently updated pages
  static async getRecentlyUpdated(limit = 5) {
    try {
      const result = await query(
        `SELECT 
          p.id, p.title, p.slug, p.status, p.updated_at,
          u.name as author_name
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        ORDER BY p.updated_at DESC
        LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get recently updated pages: ${error.message}`);
    }
  }

  // Get pages by template
  static async findByTemplate(template, limit = 10) {
    try {
      const result = await query(
        `SELECT 
          p.id, p.title, p.slug, p.status, p.template, p.updated_at,
          u.name as author_name
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.template = $1 AND p.status = 'published'
        ORDER BY p.updated_at DESC
        LIMIT $2`,
        [template, limit]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get pages by template: ${error.message}`);
    }
  }

  // Search pages
  static async search(searchTerm, limit = 20) {
    try {
      const result = await query(
        `SELECT 
          p.id, p.title, p.slug, p.status, p.template, p.updated_at,
          u.name as author_name,
          ts_rank_cd(
            setweight(to_tsvector('english', p.title), 'A') ||
            setweight(to_tsvector('english', p.content), 'B') ||
            setweight(to_tsvector('english', p.meta_description), 'C'),
            plainto_tsquery('english', $1)
          ) as rank
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE 
          p.status = 'published' AND (
            to_tsvector('english', p.title) @@ plainto_tsquery('english', $1) OR
            to_tsvector('english', p.content) @@ plainto_tsquery('english', $1) OR
            to_tsvector('english', p.meta_description) @@ plainto_tsquery('english', $1)
          )
        ORDER BY rank DESC, p.updated_at DESC
        LIMIT $2`,
        [searchTerm, limit]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to search pages: ${error.message}`);
    }
  }

  // Duplicate a page
  static async duplicate(id, newTitle, newSlug) {
    try {
      const originalPage = await this.findById(id);
      if (!originalPage) {
        throw new Error('Original page not found');
      }

      const result = await query(
        `INSERT INTO pages (
          title, slug, content, meta_title, meta_description, 
          meta_keywords, status, is_homepage, template, 
          featured_image, author_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          newTitle,
          newSlug,
          originalPage.content,
          originalPage.meta_title,
          originalPage.meta_description,
          originalPage.meta_keywords,
          'draft', // Start as draft
          false, // Not homepage
          originalPage.template,
          originalPage.featured_image,
          originalPage.author_id
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to duplicate page: ${error.message}`);
    }
  }

  // Bulk operations
  static async bulkUpdate(ids, updateData) {
    try {
      const placeholders = ids.map((_, index) => `$${index + 2}`).join(', ');
      const { status, template } = updateData;

      let updateFields = [];
      let queryParams = [ids.length];

      if (status !== undefined) {
        updateFields.push(`status = $${queryParams.length + 1}`);
        queryParams.push(status);
      }

      if (template !== undefined) {
        updateFields.push(`template = $${queryParams.length + 1}`);
        queryParams.push(template);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      const queryText = `
        UPDATE pages 
        SET ${updateFields.join(', ')}
        WHERE id = ANY($1::int[])
        RETURNING *
      `;

      const result = await query(queryText, queryParams);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to bulk update pages: ${error.message}`);
    }
  }

  static async bulkDelete(ids) {
    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
      
      const result = await query(
        `DELETE FROM pages WHERE id = ANY($1::int[]) RETURNING *`,
        [ids]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Failed to bulk delete pages: ${error.message}`);
    }
  }
}
