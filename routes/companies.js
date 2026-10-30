import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { query as dbQuery } from '../config/database.js';
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get company stats (must come before /:identifier)
router.get('/stats', [
  query('dummy').optional() // Add validation to ensure this route is processed correctly
], authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*)::integer as total_companies,
        COUNT(CASE WHEN is_featured = true THEN 1 END)::integer as featured_companies,
        COUNT(DISTINCT industry)::integer as unique_industries,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::integer as new_this_month
      FROM companies
    `;

    const result = await dbQuery(statsQuery);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company stats'
    });
  }
});

// Get all companies with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('industry').optional().isString().withMessage('Industry must be a string'),
  query('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const industry = req.query.industry || '';
    const isActive = req.query.is_active;

    let whereClause = 'WHERE true';
    const queryParams = [];
    let paramIndex = 1;

    // Add search condition
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add industry filter
    if (industry) {
      whereClause += ` AND industry ILIKE $${paramIndex}`;
      queryParams.push(`%${industry}%`);
      paramIndex++;
    }

    // Note: is_active column doesn't exist in companies table, skipping this filter
    // If needed, we could implement a different approach for filtering

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM companies 
      ${whereClause}
    `;
    const countResult = await dbQuery(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get companies with pagination
    const companiesQuery = `
      SELECT 
        c.id, c.name, c.description, c.logo_url, c.website, c.industry, 
        c.location, c.is_featured, c.created_at, c.updated_at,
        COALESCE(j.job_count, 0)::integer as job_count
      FROM companies c
      LEFT JOIN (
        SELECT company_id, COUNT(*)::integer as job_count
        FROM jobs 
        WHERE is_active = true
        GROUP BY company_id
      ) j ON c.id = j.company_id
      ${whereClause}
      ORDER BY c.name ASC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const companiesResult = await dbQuery(companiesQuery, queryParams);

    // Convert job_count from string to integer for each company
    const companiesWithIntegerCounts = companiesResult.rows.map(company => ({
      ...company,
      job_count: parseInt(company.job_count) || 0
    }));

    res.json({
      success: true,
      data: companiesWithIntegerCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies'
    });
  }
});

// Get featured companies (must come before /:identifier)
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const sqlQuery = `
      SELECT 
        c.id, c.name, c.description, c.logo_url, c.website, 
        c.industry, c.location, c.is_featured,
        COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
      GROUP BY c.id, c.name, c.description, c.logo_url, c.website, 
               c.industry, c.location, c.is_featured
      HAVING COUNT(j.id) > 0
      ORDER BY job_count DESC, c.name ASC
      LIMIT $1
    `;

    const result = await dbQuery(sqlQuery, [limit]);

    res.json({
      success: true,
      data: {
        companies: result.rows,
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching featured companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured companies'
    });
  }
});

// Get featured companies list (alternative endpoint)
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const sqlQuery = `
      SELECT 
        c.id, c.name, c.description, c.logo_url, c.website, 
        c.industry, c.location, c.is_featured,
        COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
      GROUP BY c.id, c.name, c.description, c.logo_url, c.website, 
               c.industry, c.location, c.is_featured
      HAVING COUNT(j.id) > 0
      ORDER BY job_count DESC, c.name ASC
      LIMIT $1
    `;

    const result = await dbQuery(sqlQuery, [limit]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching featured companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured companies'
    });
  }
});

// Search companies
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    const sqlQuery = `
      SELECT 
        c.id, c.name, c.description, c.logo_url, c.website, 
        c.industry, c.location, c.is_featured,
        COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
      WHERE c.name ILIKE $1 OR c.description ILIKE $1 OR c.industry ILIKE $1
      GROUP BY c.id, c.name, c.description, c.logo_url, c.website, 
               c.industry, c.location, c.is_featured
      ORDER BY c.name ASC
      LIMIT $2
    `;

    const result = await dbQuery(sqlQuery, [`%${query}%`, limit]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search companies'
    });
  }
});

// Get company by ID or slug (must come after specific routes)
router.get('/:identifier', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;
    console.log('🔍 Company lookup - identifier:', identifier);

    // Check if identifier is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let companyQuery;
    let queryParams;

    if (isUuid) {
      console.log('🔍 Looking up company by ID');
      companyQuery = `
        SELECT 
          c.*,
          COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE c.id = $1
        GROUP BY c.id
      `;
      queryParams = [identifier];
    } else {
      console.log('🔍 Looking up company by slug');
      companyQuery = `
        SELECT 
          c.*,
          COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
        WHERE c.slug = $1
        GROUP BY c.id
      `;
      queryParams = [identifier];
    }

    const result = await dbQuery(companyQuery, queryParams);

    if (result.rows.length === 0) {
      console.log('❌ Company not found');
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const company = result.rows[0];
    company.job_count = parseInt(company.job_count) || 0;

    console.log('✅ Company found:', company.name);
    res.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company'
    });
  }
});

// Create new company
router.post('/', [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('description').optional().trim(),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('industry').optional().trim(),
  body('location').optional().trim(),
  body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL'),
  body('is_featured').optional().isBoolean()
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      website,
      industry,
      location,
      logo_url,
      is_featured = false
    } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    console.log('🔍 Creating company:', { name, slug });

    // Check if company with same name or slug already exists
    const existingCompanyQuery = `
      SELECT id, name, slug FROM companies 
      WHERE name = $1 OR slug = $2
    `;
    const existingResult = await dbQuery(existingCompanyQuery, [name, slug]);

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.name === name) {
        return res.status(400).json({
          success: false,
          message: 'Company with this name already exists'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Company with this slug already exists'
        });
      }
    }

    const insertQuery = `
      INSERT INTO companies (
        name, slug, description, website, industry, location, 
        logo_url, is_featured, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      name,
      slug,
      description || null,
      website || null,
      industry || null,
      location || null,
      logo_url || null,
      is_featured
    ];

    console.log('🔍 Insert values:', values);
    console.log('🔍 Insert query:', insertQuery);

    const result = await dbQuery(insertQuery, values);

    console.log('✅ Company created successfully:', result.rows[0].name);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company'
    });
  }
});

// Update company
router.put('/:identifier', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required'),
  body('name').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('description').optional().trim(),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('industry').optional().trim(),
  body('location').optional().trim(),
  body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL'),
  body('is_featured').optional().isBoolean()
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;
    const updateData = req.body;

    // Check if identifier is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let whereClause = isUuid ? 'WHERE id = $1' : 'WHERE slug = $1';
    let queryParams = [identifier];

    // Check if company exists
    const checkQuery = `SELECT id, name FROM companies ${whereClause}`;
    const checkResult = await dbQuery(checkQuery, queryParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // If name is being updated, generate new slug
    if (updateData.name) {
      const newSlug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      updateData.slug = newSlug;
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 2; // Start from 2 since $1 is the identifier

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(...queryParams);

    const updateQuery = `
      UPDATE companies 
      SET ${updateFields.join(', ')}
      ${whereClause}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, updateValues);

    console.log('✅ Company updated successfully:', result.rows[0].name);

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company'
    });
  }
});

// Delete company
router.delete('/:identifier', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required')
], authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;

    // Check if identifier is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let whereClause = isUuid ? 'WHERE id = $1' : 'WHERE slug = $1';
    let queryParams = [identifier];

    // Check if company exists
    const checkQuery = `SELECT id, name FROM companies ${whereClause}`;
    const checkResult = await dbQuery(checkQuery, queryParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if company has associated jobs
    const jobsCheckQuery = `
      SELECT COUNT(*) as job_count 
      FROM jobs 
      WHERE company_id = (SELECT id FROM companies ${whereClause})
    `;
    const jobsResult = await dbQuery(jobsCheckQuery, queryParams);
    const jobCount = parseInt(jobsResult.rows[0].job_count);

    if (jobCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company with ${jobCount} associated jobs. Please delete the jobs first.`
      });
    }

    // Delete the company
    const deleteQuery = `DELETE FROM companies ${whereClause} RETURNING *`;
    const deleteResult = await dbQuery(deleteQuery, queryParams);

    console.log('✅ Company deleted successfully:', deleteResult.rows[0].name);

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company'
    });
  }
});

// Update company featured status
router.patch('/:identifier/featured', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required'),
  body('isFeatured').isBoolean().withMessage('isFeatured must be a boolean')
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;
    const { isFeatured } = req.body;

    // Check if identifier is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let whereClause = isUuid ? 'WHERE id = $1' : 'WHERE slug = $1';
    let queryParams = [identifier, isFeatured];

    // Check if company exists and update featured status
    const updateQuery = `
      UPDATE companies 
      SET is_featured = $2, updated_at = NOW()
      ${whereClause}
      RETURNING *
    `;

    const result = await dbQuery(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('✅ Company featured status updated:', result.rows[0].name, isFeatured);

    res.json({
      success: true,
      message: `Company ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating company featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company featured status'
    });
  }
});

// Block company (set is_active to false)
router.patch('/:identifier/block', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required')
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;
    console.log('🔍 Blocking company - identifier:', identifier);

    // Check if identifier is a number (integer ID) or UUID or slug
    const isInteger = /^\d+$/.test(identifier);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let whereClause;
    let queryParams;

    if (isInteger) {
      console.log('🔍 Looking up company by integer ID');
      whereClause = 'WHERE id = $1';
      queryParams = [parseInt(identifier)];
    } else if (isUuid) {
      console.log('🔍 Looking up company by UUID');
      whereClause = 'WHERE id = $1';
      queryParams = [identifier];
    } else {
      console.log('🔍 Looking up company by slug');
      whereClause = 'WHERE slug = $1';
      queryParams = [identifier];
    }

    // Check if company exists and update active status
    const updateQuery = `
      UPDATE companies 
      SET is_active = false, updated_at = NOW()
      ${whereClause}
      RETURNING *
    `;

    console.log('🔍 Update query:', updateQuery);
    console.log('🔍 Query params:', queryParams);

    const result = await dbQuery(updateQuery, queryParams);

    if (result.rows.length === 0) {
      console.log('❌ Company not found for identifier:', identifier);
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('✅ Company blocked successfully:', result.rows[0].name);

    res.json({
      success: true,
      message: 'Company blocked successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error blocking company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block company'
    });
  }
});

// Unblock company (set is_active to true)
router.patch('/:identifier/unblock', [
  param('identifier').notEmpty().withMessage('Company ID or slug is required')
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier } = req.params;
    console.log('🔍 Unblocking company - identifier:', identifier);

    // Check if identifier is a number (integer ID) or UUID or slug
    const isInteger = /^\d+$/.test(identifier);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(identifier);

    let whereClause;
    let queryParams;

    if (isInteger) {
      console.log('🔍 Looking up company by integer ID');
      whereClause = 'WHERE id = $1';
      queryParams = [parseInt(identifier)];
    } else if (isUuid) {
      console.log('🔍 Looking up company by UUID');
      whereClause = 'WHERE id = $1';
      queryParams = [identifier];
    } else {
      console.log('🔍 Looking up company by slug');
      whereClause = 'WHERE slug = $1';
      queryParams = [identifier];
    }

    // Check if company exists and update active status
    const updateQuery = `
      UPDATE companies 
      SET is_active = true, updated_at = NOW()
      ${whereClause}
      RETURNING *
    `;

    console.log('🔍 Update query:', updateQuery);
    console.log('🔍 Query params:', queryParams);

    const result = await dbQuery(updateQuery, queryParams);

    if (result.rows.length === 0) {
      console.log('❌ Company not found for identifier:', identifier);
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    console.log('✅ Company unblocked successfully:', result.rows[0].name);

    res.json({
      success: true,
      message: 'Company unblocked successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error unblocking company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock company'
    });
  }
});

export default router;
