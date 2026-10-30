import express from 'express';
import { query } from '../config/database.js';
import { optionalAuth, authenticateToken, checkUserActive } from '../middleware/auth.js';

const router = express.Router();

// =============================================
// GET JOBS BY CATEGORY
// =============================================
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    // Check if authenticated user is inactive
    if (req.user && !req.user.is_active) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: { 
            current_page: 1,
            total_pages: 0,
            total_jobs: 0,
            jobs_per_page: parseInt(req.query.limit || 10),
            has_next: false,
            has_prev: false
          },
          filters: {
            search: req.query.search,
            location: req.query.location,
            category: req.params.category,
            job_type: req.query.job_type,
            experience_level: req.query.experience_level,
            salary_min: req.query.salary_min,
            salary_max: req.query.salary_max,
            remote: req.query.remote,
            featured: req.query.featured
          }
        },
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Determine query source based on user status
    const isUserActive = req.user && req.user.is_active;
    const querySource = isUserActive ? 'jobs' : 'jobs';

    const {
      page = 1,
      limit = 10,
      search,
      location,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      remote,
      featured,
      sort_by = 'posted_date',
      sort_order = 'DESC'
    } = req.query;

    const { category } = req.params;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    whereConditions.push('j.is_active = true');
    whereConditions.push('(j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)');
    
    // Add category filter - support both ID and slug
    if (/^\d+$/.test(category)) {
      whereConditions.push(`c.id = $${paramCount + 1}`);
    } else {
      whereConditions.push(`c.slug = $${paramCount + 1}`);
    }
    queryParams.push(category);
    paramCount = 1;

    if (search) {
      paramCount++;
      whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR co.name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      whereConditions.push(`j.location ILIKE $${paramCount}`);
      queryParams.push(`%${location}%`);
    }

    if (company && company.trim() !== '') {
      paramCount++;
      // Check if company is numeric (ID) or string (name)
      if (/^\d+$/.test(company)) {
        whereConditions.push(`j.company_id = $${paramCount}`);
      } else {
        whereConditions.push(`co.name ILIKE $${paramCount}`);
      }
      queryParams.push(company);
    }

    if (job_type) {
      paramCount++;
      whereConditions.push(`j.job_type = $${paramCount}`);
      queryParams.push(job_type);
    }

    if (experience_level) {
      paramCount++;
      whereConditions.push(`j.experience_level = $${paramCount}`);
      queryParams.push(experience_level);
    }

    if (salary_min) {
      paramCount++;
      whereConditions.push(`j.salary_min >= $${paramCount}`);
      queryParams.push(salary_min);
    } 
    if (salary_max) {
      paramCount++;
      whereConditions.push(`j.salary_max <= $${paramCount}`);
      queryParams.push(salary_max);
    }

    if (remote === 'true') {
      whereConditions.push(`(j.job_type = 'remote' OR j.job_type = 'hybrid')`);
    }

    if (featured === 'true') {
      whereConditions.push(`j.is_featured = true`);
    }

    // Validate sort_by parameter
    const validSortFields = ['posted_date', 'title', 'salary_min', 'view_count', 'company_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'posted_date';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Add user activity filter for active users
    if (isUserActive) {
      whereConditions.push('(j.posted_by IS NULL OR u.is_active = true)');
    }

    // Main query using dynamic source
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
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description
      FROM ${querySource} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${isUserActive ? 'LEFT JOIN app_users u ON j.posted_by = u.id' : ''}
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY ${sortField === 'company_name' ? 'co.name' : 'j.' + sortField} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query using dynamic source
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${querySource} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${isUserActive ? 'LEFT JOIN app_users u ON j.posted_by = u.id' : ''}
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
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
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_jobs: totalJobs,
          jobs_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        },
        filters: {
          search,
          location,
          category,
          company,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          remote,
          featured
        }
      }
    });

  } catch (error) {
    console.error('Error fetching jobs by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET LATEST JOBS
// =============================================
router.get('/latest', optionalAuth, async (req, res) => {
  try {
    // Check if authenticated user is inactive
    if (req.user && !req.user.is_active) {
      return res.json({
        success: true,
        data: {
          jobs: []
        },
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Determine query source based on user status
    const isUserActive = req.user && req.user.is_active;
    const querySource = isUserActive ? 'jobs' : 'jobs';
    const { limit = 6 } = req.query;

    const latestJobsQuery = `
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
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description
      FROM ${querySource} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${isUserActive ? 'LEFT JOIN app_users u ON j.posted_by = u.id' : ''}
      WHERE j.is_active = true 
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        ${isUserActive ? 'AND (j.posted_by IS NULL OR u.is_active = true)' : ''}
      ORDER BY j.posted_date DESC
      LIMIT $1
    `;

    const result = await query(latestJobsQuery, [parseInt(limit)]);

    res.json({
      success: true,
      data: {
        jobs: result.rows
      }
    });

  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET ALL JOBS WITH FILTERING, SEARCHING, AND PAGINATION
// =============================================
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Check if authenticated user is inactive
    if (req.user && !req.user.is_active) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: { 
            current_page: 1,
            total_pages: 0,
            total_jobs: 0,
            jobs_per_page: parseInt(req.query.limit || 10),
            has_next: false,
            has_prev: false
          },
          filters: {
            search: req.query.search,
            location: req.query.location,
            category: req.query.category,
            company: req.query.company,
            job_type: req.query.job_type,
            experience_level: req.query.experience_level,
            salary_min: req.query.salary_min,
            salary_max: req.query.salary_max,
            remote: req.query.remote,
            featured: req.query.featured
          }
        },
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Determine query source based on user status
    const isUserActive = req.user && req.user.is_active;
    const querySource = isUserActive ? 'jobs' : 'jobs';
    const {
      page = 1,
      limit = 10,
      search,
      location,
      category,
      company,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      remote,
      featured,
      sort_by = 'posted_date',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    whereConditions.push('j.is_active = true');
    whereConditions.push('(j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)');

    if (search) {
      paramCount++;
      whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR co.name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      whereConditions.push(`j.location ILIKE $${paramCount}`);
      queryParams.push(`%${location}%`);
    }

    if (category) {
      paramCount++;
      // Check if category is numeric (ID) or string (slug)
      if (/^\d+$/.test(category)) {
        whereConditions.push(`c.id = $${paramCount}`);
      } else {
        whereConditions.push(`c.slug = $${paramCount}`);
      }
      queryParams.push(category);
    }

    if (company && company.trim() !== '') {
      paramCount++;
      // Check if company is numeric (ID) or string (name)
      if (/^\d+$/.test(company)) {
        whereConditions.push(`j.company_id = $${paramCount}`);
      } else {
        whereConditions.push(`co.name ILIKE $${paramCount}`);
      }
      queryParams.push(company);
    }

    if (job_type) {
      paramCount++;
      whereConditions.push(`j.job_type = $${paramCount}`);
      queryParams.push(job_type);
    }

    if (experience_level) {
      paramCount++;
      whereConditions.push(`j.experience_level = $${paramCount}`);
      queryParams.push(experience_level);
    }

    if (salary_min) {
      paramCount++;
      whereConditions.push(`j.salary_min >= $${paramCount}`);
      queryParams.push(salary_min);
    }

    if (salary_max) {
      paramCount++;
      whereConditions.push(`j.salary_max <= $${paramCount}`);
      queryParams.push(salary_max);
    }

    if (remote === 'true') {
      whereConditions.push(`(j.job_type = 'remote' OR j.job_type = 'hybrid')`);
    }

    if (featured === 'true') {
      whereConditions.push(`j.is_featured = true`);
    }

    // Validate sort_by parameter
    const validSortFields = ['posted_date', 'title', 'salary_min', 'view_count', 'company_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'posted_date';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query using jobs view
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
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY ${sortField === 'company_name' ? 'co.name' : 'j.' + sortField} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query using jobs view
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
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
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_jobs: totalJobs,
          jobs_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        },
        filters: {
          search,
          location,
          category,
          company,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          remote,
          featured
        }
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// SAVE/UNSAVE JOB (AUTHENTICATED) - MUST COME BEFORE /:identifier
// =============================================
router.post('/:jobIdentifier/save', authenticateToken, checkUserActive, async (req, res) => {
  try {
    console.log('🔧 Save job endpoint called');
    console.log('🔧 req.user:', req.user);
    console.log('🔧 req.params:', req.params);
    
    const { jobIdentifier } = req.params;
    const userId = req.user.userId || req.user.id;

    console.log('🔧 Processing save job - userId:', userId, 'jobIdentifier:', jobIdentifier);

    // Check if identifier is ID or slug
    const isId = /^\d+$/.test(jobIdentifier);
    const jobQuery = isId 
      ? 'SELECT id FROM jobs WHERE id = $1 AND is_active = true'
      : 'SELECT id FROM jobs WHERE slug = $1 AND is_active = true';

    // Check if job exists
    const jobCheck = await query(jobQuery, [jobIdentifier]);

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobId = jobCheck.rows[0].id;

    // Check if already saved
    const existingSave = await query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    if (existingSave.rows.length > 0) {
      // Unsave the job
      await query(
        'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );

      res.json({
        success: true,
        message: 'Job removed from saved jobs',
        is_saved: false
      });
    } else {
      // Save the job
      await query(
        'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT (user_id, job_id) DO NOTHING',
        [userId, jobId]
      );

      res.json({
        success: true,
        message: 'Job saved successfully',
        is_saved: true
      });
    }

  } catch (error) {
    console.error('Error saving/un-saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// CHECK IF JOB IS SAVED (AUTHENTICATED) - MUST COME BEFORE /:identifier
// =============================================
router.get('/:jobIdentifier/saved', authenticateToken, checkUserActive, async (req, res) => {
  try {
    const { jobIdentifier } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if identifier is ID or slug
    const isId = /^\d+$/.test(jobIdentifier);
    const jobQuery = isId 
      ? 'SELECT id FROM jobs WHERE id = $1 AND is_active = true'
      : 'SELECT id FROM jobs WHERE slug = $1 AND is_active = true';

    // Get job ID
    const jobCheck = await query(jobQuery, [jobIdentifier]);

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobId = jobCheck.rows[0].id;

    const result = await query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    res.json({
      success: true,
      is_saved: result.rows.length > 0
    });

  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// =============================================
// CHECK IF JOB IS SAVED (ALTERNATE ROUTE FOR FRONTEND COMPATIBILITY) - MUST COME BEFORE /:identifier
// =============================================
router.get('/save/:jobId/check', authenticateToken, checkUserActive, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId || req.user.id;

    const result = await query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    res.json({
      success: true,
      is_saved: result.rows.length > 0
    });

  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// =============================================
// GET SAVED JOBS (AUTHENTICATED) - MUST COME BEFORE /:identifier
// =============================================
router.get('/saved/list', authenticateToken, checkUserActive, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort parameters
    const validSortFields = ['created_at', 'posted_date', 'title', 'salary_min', 'company_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const savedJobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.slug,
        
        
        j.location,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.salary_type,
        j.experience_level,
        j.job_type,
        j.skills_required,
        j.posted_date,
        j.application_deadline,
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        sj.created_at as saved_at,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE sj.user_id = $1 AND j.is_active = true
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        AND (j.posted_by IS NULL OR u.is_active = true)
      ORDER BY sj.${sortField} ${sortDirection}
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE sj.user_id = $1 AND j.is_active = true
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        AND (j.posted_by IS NULL OR u.is_active = true)
    `;

    const [jobsResult, countResult] = await Promise.all([
      query(savedJobsQuery, [userId, parseInt(limit), offset]),
      query(countQuery, [userId])
    ]);

    const totalJobs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_jobs: totalJobs,
          jobs_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// =============================================
// GET JOB RECOMMENDATIONS (AUTHENTICATED)
// =============================================
router.get('/recommendations/:userId?', authenticateToken, checkUserActive, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId || req.user.id;
    const { limit = 10 } = req.query;

    // Get user's application history to understand preferences
    const userHistoryQuery = `
      SELECT 
        j.category_id,
        j.location,
        j.experience_level,
        j.job_type,
        COUNT(*) as application_count
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      GROUP BY j.category_id, j.location, j.experience_level, j.job_type
      ORDER BY application_count DESC
      LIMIT 5
    `;

    const historyResult = await query(userHistoryQuery, [userId]);

    if (historyResult.rows.length === 0) {
      // If no history, return featured jobs
      const featuredJobsQuery = `
        SELECT 
          j.id,
          j.title,
          j.slug,
          
          
          j.location,
          j.salary_min,
          j.salary_max,
          j.salary_currency,
          j.experience_level,
          j.job_type,
          j.skills_required,
          j.posted_date,
          j.application_deadline,
          j.is_featured,
          j.view_count,
          c.name as category_name, co.name as company_name, co.logo_url as company_logo,
          c.slug as category_slug,
          c.color as category_color,
          co.logo_url as company_logo_url,
          co.website as company_website,
          co.description as company_description
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN companies co ON j.company_id = co.id
        LEFT JOIN app_users u ON j.posted_by = u.id
        WHERE j.is_active = true AND j.is_featured = true
          AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
          AND (j.posted_by IS NULL OR u.is_active = true)
          AND j.id NOT IN (
            SELECT job_id FROM saved_jobs WHERE user_id = $1
          )
        ORDER BY j.posted_date DESC
        LIMIT $2
      `;

      const featuredResult = await query(featuredJobsQuery, [userId, parseInt(limit)]);

      return res.json({
        success: true,
        data: featuredResult.rows,
        recommendation_type: 'featured'
      });
    }

    // Build recommendation query based on user history
    const preferences = historyResult.rows;
    const categoryIds = [...new Set(preferences.map(p => p.category_id).filter(Boolean))];
    const locations = [...new Set(preferences.map(p => p.location).filter(Boolean))];
    const experienceLevels = [...new Set(preferences.map(p => p.experience_level).filter(Boolean))];
    const jobTypes = [...new Set(preferences.map(p => p.job_type).filter(Boolean))];

    let whereConditions = ['j.is_active = true', '(j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)', '(j.posted_by IS NULL OR u.is_active = true)'];
    let queryParams = [userId];
    let paramCount = 1;

    if (categoryIds.length > 0) {
      paramCount++;
      whereConditions.push(`j.category_id = ANY($${paramCount})`);
      queryParams.push(categoryIds);
    }

    if (locations.length > 0) {
      paramCount++;
      whereConditions.push(`j.location = ANY($${paramCount})`);
      queryParams.push(locations);
    }

    if (experienceLevels.length > 0) {
      paramCount++;
      whereConditions.push(`j.experience_level = ANY($${paramCount})`);
      queryParams.push(experienceLevels);
    }

    if (jobTypes.length > 0) {
      paramCount++;
      whereConditions.push(`j.job_type = ANY($${paramCount})`);
      queryParams.push(jobTypes);
    }

    // Exclude already saved jobs
    paramCount++;
    whereConditions.push(`j.id NOT IN (SELECT job_id FROM saved_jobs WHERE user_id = $${paramCount})`);

    const recommendationsQuery = `
      SELECT 
        j.id,
        j.title,
        j.slug,
        
        
        j.location,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.experience_level,
        j.job_type,
        j.skills_required,
        j.posted_date,
        j.application_deadline,
        j.is_featured,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description,
        -- Calculate recommendation score
        CASE 
          WHEN j.category_id = ANY($${paramCount - 4}) THEN 0.4
          ELSE 0
        END +
        CASE 
          WHEN j.location = ANY($${paramCount - 3}) THEN 0.2
          ELSE 0
        END +
        CASE 
          WHEN j.experience_level = ANY($${paramCount - 2}) THEN 0.2
          ELSE 0
        END +
        CASE 
          WHEN j.job_type = ANY($${paramCount - 1}) THEN 0.2
          ELSE 0
        END as recommendation_score
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY recommendation_score DESC, j.posted_date DESC
      LIMIT $${paramCount + 1}
    `;

    queryParams.push(parseInt(limit));

    const recommendationsResult = await query(recommendationsQuery, queryParams);

    res.json({
      success: true,
      data: recommendationsResult.rows,
      recommendation_type: 'personalized',
      user_preferences: {
        categories: categoryIds,
        locations: locations,
        experience_levels: experienceLevels,
        job_types: jobTypes
      }
    });

  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET JOB STATISTICS
// =============================================
router.get('/stats/overview', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_jobs,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_jobs,
        COUNT(CASE WHEN is_premium_only = true THEN 1 END) as premium_jobs,
        COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_jobs_this_week,
        COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_jobs_this_month,
        COUNT(CASE WHEN application_deadline >= CURRENT_DATE THEN 1 END) as jobs_with_deadline,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs
    `;

    const categoryStatsQuery = `
      SELECT 
        c.name,
        c.slug,
        c.color,
        COUNT(j.id) as job_count,
        AVG(j.salary_min) as avg_salary_min,
        AVG(j.salary_max) as avg_salary_max
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
      GROUP BY c.id, c.name, c.slug, c.color
      ORDER BY job_count DESC
      LIMIT 10
    `;

    const locationStatsQuery = `
      SELECT 
        location,
        COUNT(*) as job_count,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs
      WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      GROUP BY location
      ORDER BY job_count DESC
      LIMIT 10
    `;

    const jobTypeStatsQuery = `
      SELECT 
        job_type,
        COUNT(*) as job_count,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs
      WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
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
    console.error('Error fetching job statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// SEARCH JOBS WITH ADVANCED FILTERING
// =============================================
router.post('/search', async (req, res) => {
  try {
    const {
      query: searchQuery,
      filters = {},
      pagination = {},
      sort = {}
    } = req.body;

    const {
      page = 1,
      limit = 10
    } = pagination;

    const {
      sort_by = 'relevance',
      sort_order = 'DESC'
    } = sort;

    const {
      categories = [],
      locations = [],
      job_types = [],
      experience_levels = [],
      salary_range = {},
      remote_only = false,
      featured_only = false,
      premium_only = false
    } = filters;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Base conditions
    whereConditions.push('j.is_active = true');
    whereConditions.push('(j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)');
    whereConditions.push('(j.posted_by IS NULL OR u.is_active = true)');

    // Search query
    if (searchQuery) {
      paramCount++;
      whereConditions.push(`(
        j.title ILIKE $${paramCount} OR 
        j.description ILIKE $${paramCount} OR 
        co.name ILIKE $${paramCount} OR
        j.skills_required && ARRAY[$${paramCount}]
      )`);
      queryParams.push(`%${searchQuery}%`);
    }

    // Category filters
    if (categories.length > 0) {
      paramCount++;
      whereConditions.push(`c.slug = ANY($${paramCount})`);
      queryParams.push(categories);
    }

    // Location filters
    if (locations.length > 0) {
      paramCount++;
      whereConditions.push(`j.location = ANY($${paramCount})`);
      queryParams.push(locations);
    }

    // Job type filters
    if (job_types.length > 0) {
      paramCount++;
      whereConditions.push(`j.job_type = ANY($${paramCount})`);
      queryParams.push(job_types);
    }

    // Experience level filters
    if (experience_levels.length > 0) {
      paramCount++;
      whereConditions.push(`j.experience_level = ANY($${paramCount})`);
      queryParams.push(experience_levels);
    }

    // Salary range
    if (salary_range.min) {
      paramCount++;
      whereConditions.push(`j.salary_min >= $${paramCount}`);
      queryParams.push(salary_range.min);
    }

    if (salary_range.max) {
      paramCount++;
      whereConditions.push(`j.salary_max <= $${paramCount}`);
      queryParams.push(salary_range.max);
    }

    // Remote only
    if (remote_only) {
      whereConditions.push(`(j.job_type = 'remote' OR j.job_type = 'hybrid')`);
    }

    // Featured only
    if (featured_only) {
      whereConditions.push(`j.is_featured = true`);
    }

    // Premium only
    if (premium_only) {
      whereConditions.push(`j.is_premium_only = true`);
    }

    // Sorting
    let orderClause;
    if (sort_by === 'relevance' && searchQuery) {
      orderClause = `CASE 
        WHEN j.title ILIKE $1 THEN 1
        WHEN co.name ILIKE $1 THEN 2
        WHEN j.description ILIKE $1 THEN 3
        ELSE 4
      END, j.posted_date DESC`;
    } else {
      const validSortFields = ['posted_date', 'title', 'salary_min', 'view_count', 'company_name'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'posted_date';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderClause = `j.${sortField} ${sortDirection}`;
    }

    // Main query
    const searchJobsQuery = `
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
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description,
        -- Relevance score for search
        CASE 
          WHEN j.title ILIKE $1 THEN 1.0
          WHEN co.name ILIKE $1 THEN 0.8
          WHEN j.description ILIKE $1 THEN 0.6
          WHEN j.skills_required && ARRAY[$1] THEN 0.4
          ELSE 0.0
        END as relevance_score
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [jobsResult, countResult] = await Promise.all([
      query(searchJobsQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalJobs = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_jobs: totalJobs,
          jobs_per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        },
        search_query: searchQuery,
        filters: filters,
        sort: sort
      }
    });

  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET SIMILAR JOBS - MUST COME BEFORE /:identifier
// =============================================
router.get('/:jobIdentifier/similar', async (req, res) => {
  try {
    const { jobIdentifier } = req.params;
    const { limit = 5 } = req.query;

    // Check if identifier is ID or slug
    const isId = /^\d+$/.test(jobIdentifier);
    const jobQuery = isId 
      ? 'SELECT id, category_id, location, experience_level, job_type, skills_required, salary_min, salary_max FROM jobs WHERE id = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)'
      : 'SELECT id, category_id, location, experience_level, job_type, skills_required, salary_min, salary_max FROM jobs WHERE slug = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)';

    const currentJobResult = await query(jobQuery, [jobIdentifier]);

    if (currentJobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const currentJob = currentJobResult.rows[0];

    // Build similarity query
    let whereConditions = [
      'j.is_active = true',
      '(j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)',
      '(j.posted_by IS NULL OR u.is_active = true)',
      'j.id != $1'
    ];
    let queryParams = [currentJobResult.rows[0].id];
    let paramCount = 1;

    // Add category similarity (highest weight)
    if (currentJob.category_id) {
      paramCount++;
      whereConditions.push(`j.category_id = $${paramCount}`);
      queryParams.push(currentJob.category_id);
    }

    // Add location similarity
    if (currentJob.location) {
      paramCount++;
      whereConditions.push(`j.location = $${paramCount}`);
      queryParams.push(currentJob.location);
    }

    // Add experience level similarity
    if (currentJob.experience_level) {
      paramCount++;
      whereConditions.push(`j.experience_level = $${paramCount}`);
      queryParams.push(currentJob.experience_level);
    }

    // Add job type similarity
    if (currentJob.job_type) {
      paramCount++;
      whereConditions.push(`j.job_type = $${paramCount}`);
      queryParams.push(currentJob.job_type);
    }

    // Add salary range similarity
    if (currentJob.salary_min && currentJob.salary_max) {
      paramCount++;
      whereConditions.push(`(
        (j.salary_min >= $${paramCount} * 0.8 AND j.salary_min <= $${paramCount} * 1.2) OR
        (j.salary_max >= $${paramCount + 1} * 0.8 AND j.salary_max <= $${paramCount + 1} * 1.2)
      )`);
      queryParams.push(currentJob.salary_min, currentJob.salary_max);
      paramCount += 2;
    }

    // Skills similarity
    if (currentJob.skills_required && currentJob.skills_required.length > 0) {
      paramCount++;
      whereConditions.push(`j.skills_required && $${paramCount}`);
      queryParams.push(currentJob.skills_required);
    }

    const similarJobsQuery = `
      SELECT 
        j.id,
        j.title,
        j.slug,
        
        
        j.location,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.experience_level,
        j.job_type,
        j.skills_required,
        j.posted_date,
        j.application_deadline,
        j.is_featured,
        j.is_premium_only,
        j.view_count,
        c.name as category_name, co.name as company_name, co.logo_url as company_logo,
        c.slug as category_slug,
        c.color as category_color,
        co.logo_url as company_logo_url,
        co.website as company_website,
        co.description as company_description,
        -- Calculate similarity score
        CASE 
          WHEN j.category_id = $2 THEN 0.3
          ELSE 0
        END +
        CASE 
          WHEN j.location = $3 THEN 0.2
          ELSE 0
        END +
        CASE 
          WHEN j.experience_level = $4 THEN 0.2
          ELSE 0
        END +
        CASE 
          WHEN j.job_type = $5 THEN 0.15
          ELSE 0
        END +
        CASE 
          WHEN j.skills_required && $6 THEN 0.15
          ELSE 0
        END as similarity_score
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN app_users u ON j.posted_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY similarity_score DESC, j.posted_date DESC
      LIMIT $7
    `;

    queryParams.push(parseInt(limit));

    const similarJobsResult = await query(similarJobsQuery, queryParams);

    res.json({
      success: true,
      data: {
        similar_jobs: similarJobsResult.rows,
        current_job: {
          id: currentJobResult.rows[0].id,
          category_id: currentJob.category_id,
          location: currentJob.location,
          experience_level: currentJob.experience_level,
          job_type: currentJob.job_type,
          skills_required: currentJob.skills_required
        }
      }
    });

  } catch (error) {
    console.error('Error fetching similar jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =============================================
// GET JOB BY ID OR SLUG - MUST COME LAST
// =============================================
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    // Check if authenticated user is inactive
    if (req.user && !req.user.is_active) {
      return res.json({
        success: true,
        data: {
          job: null
        },
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Determine query source based on user status
    const isUserActive = req.user && req.user.is_active;
    const querySource = isUserActive ? 'jobs' : 'jobs';
    
    const { identifier } = req.params;
    const userId = req.user?.id;

    // Check if identifier is a number (ID) or string (slug)
    const isId = /^\d+$/.test(identifier);
    const whereClause = isId ? 'j.id = $1' : 'j.slug = $1';

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
        CASE WHEN sj.user_id IS NOT NULL THEN true ELSE false END as is_saved
      FROM ${querySource} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN companies co ON j.company_id = co.id
      LEFT JOIN saved_jobs sj ON j.id = sj.job_id AND sj.user_id = $2
      ${isUserActive ? 'LEFT JOIN app_users u ON j.posted_by = u.id' : ''}
      WHERE ${whereClause}
        AND j.is_active = true 
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        ${isUserActive ? 'AND (j.posted_by IS NULL OR u.is_active = true)' : ''}
    `;

    const result = await query(jobQuery, [identifier, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = result.rows[0];

    // Increment view count
    await query(
      'UPDATE jobs SET view_count = view_count + 1 WHERE id = $1',
      [job.id]
    );

    // Record job view for analytics
    if (userId) {
      await query(
        'INSERT INTO job_views (job_id, user_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [job.id, userId, req.ip, req.get('User-Agent')]
      );
    } else {
      await query(
        'INSERT INTO job_views (job_id, ip_address, user_agent) VALUES ($1, $2, $3)',
        [job.id, req.ip, req.get('User-Agent')]
      );
    }

    res.json({
      success: true,
      data: {
        job: job
      }
    });

  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
