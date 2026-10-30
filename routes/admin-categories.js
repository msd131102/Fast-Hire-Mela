import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// =============================================
// GET ALL CATEGORIES FOR ADMIN
// =============================================
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      sort_by = 'sort_order',
      sort_order = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`(c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const validSortFields = ['name', 'created_at', 'updated_at', 'job_count'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const categoriesQuery = `
      SELECT 
        c.*,
        COUNT(j.id) as job_count,
        COUNT(CASE WHEN j.is_active = true 
              AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        THEN 1 END) as active_job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id
      ${whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''}
      GROUP BY c.id
      ORDER BY c.${sortField} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM categories c
      ${whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    `;

    const [categoriesResult, countResult] = await Promise.all([
      query(categoriesQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalCategories = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCategories / parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: categoriesResult.rows,
        totalPages,
        currentPage: parseInt(page),
        totalCategories
      }
    });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// =============================================
// GET CATEGORY STATS
// =============================================
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_categories,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_categories,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_categories_this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_categories_this_month
      FROM categories
    `;

    const topCategoriesQuery = `
      SELECT 
        c.name,
        c.slug,
        c.color,
        COUNT(j.id) as job_count,
        COUNT(CASE WHEN j.is_active = true 
          AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        THEN 1 END) as active_job_count,
        AVG(j.salary_min) as avg_salary_min,
        AVG(j.salary_max) as avg_salary_max
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id
      GROUP BY c.id
      HAVING COUNT(j.id) > 0
      ORDER BY job_count DESC
      LIMIT 10
    `;

    const [statsResult, topCategoriesResult] = await Promise.all([
      query(statsQuery),
      query(topCategoriesQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        top_categories: topCategoriesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching admin category statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// =============================================
// GET CATEGORY BY ID
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categoryQuery = `
      SELECT 
        c.*,
        COUNT(j.id) as job_count,
        COUNT(CASE WHEN j.is_active = true 
          AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        THEN 1 END) as active_job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await query(categoryQuery, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// =============================================
// CREATE CATEGORY
// =============================================
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('slug').optional().trim(),
    body('description').optional().trim(),
    body('color').optional().trim(),
    body('icon').optional().trim(),
    body('sort_order').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

      const { name, slug, description, color, icon, sort_order = 0, is_active = true } = req.body;

      const categorySlug =
        slug ||
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const nameCheck = await query('SELECT id FROM categories WHERE name ILIKE $1', [name]);
      if (nameCheck.rows.length)
        return res.status(400).json({ success: false, message: 'Name already exists' });

      const slugCheck = await query('SELECT id FROM categories WHERE slug = $1', [categorySlug]);
      if (slugCheck.rows.length)
        return res.status(400).json({ success: false, message: 'Slug already exists' });

      const insertQuery = `
        INSERT INTO categories 
        (name, slug, description, color, icon, is_active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
        RETURNING *
      `;

      const result = await query(insertQuery, [
        name, categorySlug, description, color, icon, is_active
      ]);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// =============================================
// UPDATE CATEGORY
// =============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const check = await query('SELECT id FROM categories WHERE id = $1', [id]);
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: 'Not found' });

    const keys = Object.keys(updateFields);
    if (!keys.length)
      return res.status(400).json({ success: false, message: 'No fields to update' });

    if (updateFields.name && !updateFields.slug) {
      updateFields.slug = updateFields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Filter out invalid fields and map field names
    const validFields = {};
    const fieldMapping = {
      'isactive': 'is_active',  // Map frontend field to database column
      'isActive': 'is_active'   // Map camelCase frontend field to database column
    };
    
    Object.keys(updateFields).forEach(key => {
      const dbField = fieldMapping[key] || key;
      // Only include fields that exist in the database
      if (['name', 'slug', 'description', 'color', 'icon', 'is_active'].includes(dbField)) {
        validFields[dbField] = updateFields[key];
      }
    });

    const validKeys = Object.keys(validFields);
    if (!validKeys.length)
      return res.status(400).json({ success: false, message: 'No valid fields to update' });

    const setClause = validKeys.map((key, i) => `${key}=$${i + 2}`).join(', ');

    const updateQuery = `
      UPDATE categories 
      SET ${setClause}, updated_at=NOW()
      WHERE id=$1 RETURNING *
    `;

    const result = await query(updateQuery, [id, ...Object.values(validFields)]);

    res.json({
      success: true,
      message: 'Category updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// =============================================
// DELETE CATEGORY
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const check = await query('SELECT id FROM categories WHERE id=$1', [id]);
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: 'Category not found' });

    const jobsCheck = await query('SELECT COUNT(*) FROM jobs WHERE category_id=$1', [id]);
    if (parseInt(jobsCheck.rows[0].count) > 0)
      return res.status(400).json({
        success: false,
        message: 'Category contains jobs. Reassign or delete jobs first.'
      });

    await query('DELETE FROM categories WHERE id=$1', [id]);

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// =============================================
// REORDER CATEGORIES
// =============================================
router.put('/reorder', async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders))
      return res.status(400).json({ success: false, message: 'Invalid format' });

    await query('BEGIN');

    for (const item of orders) {
      await query(
        'UPDATE categories SET updated_at=NOW() WHERE id=$2',
        [item.id]
      );
    }

    await query('COMMIT');

    res.json({ success: true, message: 'Categories reordered' });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error reordering:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
