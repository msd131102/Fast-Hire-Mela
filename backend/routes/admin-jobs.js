import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// =============================================
// GET ALL JOBS FOR ADMIN MANAGEMENT
// =============================================
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      sort_by = 'posted_date',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions for admin
    if (search) {
      paramCount++;
      whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR  ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      if (status === 'active') {
        whereConditions.push(`j.is_active = true AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)`);
      } else if (status === 'inactive') {
        whereConditions.push(`j.is_active = false`);
      } else if (status === 'expired') {
        whereConditions.push(`j.expires_at IS NOT NULL AND j.expires_at <= CURRENT_TIMESTAMP`);
      } else if (status === 'pending') {
        whereConditions.push(`j.is_active = true AND j.is_featured = false`);
      }
    }

    if (type) {
      paramCount++;
      whereConditions.push(`j.job_type = $${paramCount}`);
      queryParams.push(type);
    }

    // Validate sort_by parameter
    const validSortFields = ['posted_date', 'title', 'salary_min', 'view_count', 'company_name', 'is_active'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'posted_date';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query for admin
    const jobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.slug,
        
        
        j.location,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.salary_type,
        j.experience_min,
        j.experience_max,
        j.experience_level,
        j.job_type,
        j.skills_required,
        j.posted_date,
        j.application_deadline,
        j.expires_at,
        j.is_active,
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        CASE 
          WHEN j.is_active = true AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP) THEN 'active'
          WHEN j.is_active = false THEN 'inactive'
          WHEN j.expires_at IS NOT NULL AND j.expires_at <= CURRENT_TIMESTAMP THEN 'expired'
          ELSE 'pending'
        END as status,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description,
        -- Get application count
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
      ORDER BY ${sortField === 'company_name' ? 'co.name' : 'j.' + sortField} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    `;

    const [jobsResult, countResult] = await Promise.all([
      query(jobsQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalJobs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        totalPages: totalPages,
        currentPage: parseInt(page),
        totalJobs: totalJobs
      }
    });

  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET JOB BY ID FOR ADMIN
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const jobQuery = `
      SELECT 
        j.*,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.name as company_details_name,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description,
        co.industry as company_industry,
        co.company_size as company_size,
        co.headquarters as company_headquarters,
        co.founded_year as company_founded_year,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      WHERE j.id = $1
    `;

    const result = await query(jobQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching admin job details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// CREATE NEW JOB
// =============================================
router.post('/', [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('company_name').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('job_type').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).withMessage('Invalid job type'),
  body('experience_level').optional().isIn(['fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('category_id').custom(value => {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      throw new Error('Category ID must be a positive integer');
    }
    return true;
  }),
  body('company_id').optional().custom(value => {
    if (value === '' || value === null || value === undefined) return true;
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      throw new Error('Company ID must be a positive integer');
    }
    return true;
  }),
  body('work_mode').optional().isIn(['onsite', 'remote', 'hybrid']).withMessage('Invalid work mode')
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

    const {
      title,
      description,
      company_name,
      company_logo,
      location,
      salary_min,
      salary_max,
      salary_currency = 'USD',
      salary_type = 'annual',
      experience_min,
      experience_max,
      experience_level,
      job_type,
      skills_required,
      responsibilities,
      category_id,
      company_id,
      application_deadline,
      expires_at,
      is_featured = false,
      is_premium_only = false,
      is_active = true
    } = req.body;

    // Get company name if company_id is provided but company_name is not
    let finalCompanyName = company_name;
    if (!finalCompanyName && company_id) {
      const companyResult = await query('SELECT name FROM companies WHERE id = $1', [company_id]);
      if (companyResult.rows.length > 0) {
        finalCompanyName = companyResult.rows[0].name;
      } else {
        // If company_id is provided but company doesn't exist, use a default name
        finalCompanyName = 'Unknown Company';
      }
    }
    
    // Ensure company_name is never null
    if (!finalCompanyName || finalCompanyName.trim() === '') {
      finalCompanyName = 'Unknown Company';
    }

    // Generate apply_link if not provided
    let applyLink = req.body.apply_link;
    if (!applyLink) {
      applyLink = `/jobs/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const insertQuery = `
      INSERT INTO jobs (
        title, slug, description, company_name, company_logo, location,
        salary_min, salary_max, salary_currency, salary_type,
        experience_min, experience_max, experience_level, job_type,
        skills_required, responsibilities, category_id, company_id, application_deadline,
        expires_at, is_featured, is_premium_only, is_active, posted_date, apply_link
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP, $24
      )
      RETURNING *
    `;

    // Handle skills_required - ensure it's properly formatted as array
    let skillsArray = null;
    if (skills_required && skills_required.trim() !== '') {
      // If it's already an array, use it directly
      if (Array.isArray(skills_required)) {
        skillsArray = skills_required;
      } 
      // If it's a string, split by comma and clean up
      else if (typeof skills_required === 'string') {
        skillsArray = skills_required.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      }
      // If it's already a JSON string, parse it
      else {
        try {
          const parsed = JSON.parse(skills_required);
          skillsArray = Array.isArray(parsed) ? parsed : [skills_required];
        } catch (e) {
          skillsArray = [skills_required];
        }
      }
    }

    // Handle responsibilities - ensure it's properly formatted as array
    let responsibilitiesArray = null;
    if (responsibilities && responsibilities.trim() !== '') {
      // If it's already an array, use it directly
      if (Array.isArray(responsibilities)) {
        responsibilitiesArray = responsibilities;
      } 
      // If it's a string, split by newline and clean up
      else if (typeof responsibilities === 'string') {
        responsibilitiesArray = responsibilities.split('\n').map(resp => resp.trim()).filter(resp => resp.length > 0);
      }
      // If it's already a JSON string, parse it
      else {
        try {
          const parsed = JSON.parse(responsibilities);
          responsibilitiesArray = Array.isArray(parsed) ? parsed : [responsibilities];
        } catch (e) {
          responsibilitiesArray = [responsibilities];
        }
      }
    }

    // Convert empty strings to null for numeric fields
    const salaryMin = salary_min && salary_min.trim() !== '' ? parseFloat(salary_min) : null;
    const salaryMax = salary_max && salary_max.trim() !== '' ? parseFloat(salary_max) : null;
    const experienceMin = experience_min && experience_min.trim() !== '' ? parseInt(experience_min) : null;
    const experienceMax = experience_max && experience_max.trim() !== '' ? parseInt(experience_max) : null;
    
    // Handle company_id - convert to number or null
    const companyId = company_id && company_id.trim() !== '' ? parseInt(company_id) : null;
    const categoryId = parseInt(category_id);

    const result = await query(insertQuery, [
      title, slug, description, finalCompanyName, company_logo, location,
      salaryMin, salaryMax, salary_currency, salary_type,
      experienceMin, experienceMax, experience_level, job_type,
      skillsArray, responsibilitiesArray, categoryId, companyId,
      application_deadline, expires_at, is_featured, is_premium_only, is_active, applyLink
    ]);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// UPDATE JOB
// =============================================
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('company_name').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('job_type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']).withMessage('Invalid job type'),
  body('experience_level').optional().isIn(['fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level')
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

    const { id } = req.params;
    const updateFields = req.body;

    // Check if job exists
    const jobCheck = await query('SELECT id FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Filter out empty string fields and build dynamic update query
    const filteredFields = {};
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined && value !== '') {
        filteredFields[key] = value;
      }
    }
    
    const updateKeys = Object.keys(filteredFields);
    const updateValues = Object.values(filteredFields);
    
    if (updateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Handle skills_required array
    if (filteredFields.skills_required !== undefined) {
      const skillsIndex = updateKeys.indexOf('skills_required');
      // Convert skills to proper PostgreSQL array format
      let skillsArray = null;
      if (filteredFields.skills_required && filteredFields.skills_required.trim() !== '') {
        if (Array.isArray(filteredFields.skills_required)) {
          skillsArray = filteredFields.skills_required;
        } else if (typeof filteredFields.skills_required === 'string') {
          skillsArray = filteredFields.skills_required.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        }
      }
      updateValues[skillsIndex] = skillsArray;
    }

    // Handle responsibilities array
    if (filteredFields.responsibilities !== undefined) {
      const responsibilitiesIndex = updateKeys.indexOf('responsibilities');
      // Convert responsibilities to proper PostgreSQL array format
      let responsibilitiesArray = null;
      if (filteredFields.responsibilities && filteredFields.responsibilities.trim() !== '') {
        if (Array.isArray(filteredFields.responsibilities)) {
          responsibilitiesArray = filteredFields.responsibilities;
        } else if (typeof filteredFields.responsibilities === 'string') {
          responsibilitiesArray = filteredFields.responsibilities.split('\n').map(resp => resp.trim()).filter(resp => resp.length > 0);
        }
      }
      updateValues[responsibilitiesIndex] = responsibilitiesArray;
    }

    // Generate new slug if title is updated
    if (filteredFields.title) {
      const slug = filteredFields.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
      updateKeys.push('slug');
      updateValues.push(slug);
    }


    const setClause = updateKeys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    
    const updateQuery = `
      UPDATE jobs 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [id, ...updateValues]);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// DELETE JOB
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists
    const jobCheck = await query('SELECT id FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete job (this will cascade delete related records)
    await query('DELETE FROM jobs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// BULK DELETE JOBS
// =============================================
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job IDs are required'
      });
    }

    // Delete jobs
    const result = await query(
      'DELETE FROM jobs WHERE id = ANY($1) RETURNING id',
      [ids]
    );

    res.json({
      success: true,
      message: `${result.rows.length} jobs deleted successfully`,
      deletedCount: result.rows.length
    });

  } catch (error) {
    console.error('Error bulk deleting jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// UPDATE JOB STATUS
// =============================================
router.patch('/:id/status', [
  body('status').isIn(['active', 'inactive', 'expired', 'pending']).withMessage('Invalid status')
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

    const { id } = req.params;
    const { status } = req.body;

    // Check if job exists
    const jobCheck = await query('SELECT id FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    let updateFields = {};
    
    switch (status) {
      case 'active':
        updateFields = { is_active: true };
        break;
      case 'inactive':
        updateFields = { is_active: false };
        break;
      case 'expired':
        updateFields = { expires_at: new Date() };
        break;
      case 'pending':
        updateFields = { is_active: true, is_featured: false };
        break;
    }

    const updateQuery = `
      UPDATE jobs 
      SET ${Object.keys(updateFields).map((key, index) => `${key} = $${index + 2}`).join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [id, ...Object.values(updateFields)]);

    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET JOB STATISTICS FOR ADMIN
// =============================================
router.get('/stats/overview', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) THEN 1 END) as active_jobs,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_jobs,
        COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP THEN 1 END) as expired_jobs,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_jobs,
        COUNT(CASE WHEN is_premium_only = true THEN 1 END) as premium_jobs,
        COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_jobs_this_week,
        COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_jobs_this_month,
        COUNT(CASE WHEN application_deadline >= CURRENT_DATE THEN 1 END) as jobs_with_deadline,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max,
        SUM(view_count) as total_views
      FROM jobs
    `;

    const categoryStatsQuery = `
      SELECT 
        c.name,
        c.slug,
        c.color,
        COUNT(j.id) as job_count,
        COUNT(CASE WHEN j.is_active = true AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP) THEN 1 END) as active_count,
        AVG(j.salary_min) as avg_salary_min,
        AVG(j.salary_max) as avg_salary_max
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id
      GROUP BY c.id, c.name, c.slug, c.color
      ORDER BY job_count DESC
      LIMIT 10
    `;

    const locationStatsQuery = `
      SELECT 
        location,
        COUNT(*) as job_count,
        COUNT(CASE WHEN is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) THEN 1 END) as active_count,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs
      GROUP BY location
      ORDER BY job_count DESC
      LIMIT 10
    `;

    const jobTypeStatsQuery = `
      SELECT 
        job_type,
        COUNT(*) as job_count,
        COUNT(CASE WHEN is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) THEN 1 END) as active_count,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs
      GROUP BY job_type
      ORDER BY job_count DESC
    `;

    const [statsResult, categoryResult, locationResult, jobTypeResult] = await Promise.all([
      query(statsQuery),
      query(categoryStatsQuery),
      query(locationStatsQuery),
      query(jobTypeStatsQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        top_categories: categoryResult.rows,
        top_locations: locationResult.rows,
        job_types: jobTypeResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching admin job statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
