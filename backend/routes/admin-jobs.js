import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { generateJobSlug, generateUniqueSlug } from '../utils/slugGenerator.js';


// Flexible parser helper for sheets with or without headers, or leading blank lines
function parseSheetFlexible(worksheet) {
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length === 0) return [];

  const standardHeaders = [
    'id', 'title', 'slug', 'description', 'company_name', 'company_id',
    'company_logo', 'location', 'salary_min', 'salary_max', 'salary_currency',
    'salary_type', 'experience_min', 'experience_max', 'experience_level',
    'job_type', 'skills_required', 'responsibilities', 'eligibility',
    'education_required', 'apply_link', 'category_id', 'is_active',
    'is_featured', 'is_premium_only', 'application_deadline', 'posted_date',
    'expires_at', 'view_count', 'click_count', 'created_at', 'updated_at',
    'work_mode', 'posted_by'
  ];

  // Find first row with data
  let headerRowIndex = -1;
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row && row.some(cell => String(cell).trim() !== '')) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) return [];

  const firstRow = rawRows[headerRowIndex];
  const isHeaderRow = firstRow.some(cell => {
    const s = String(cell).toLowerCase().trim();
    return s === 'title' || s === 'job_title' || s === 'job title' || s === 'company_name';
  });

  let headers = [];
  let dataRows = [];

  if (isHeaderRow) {
    headers = firstRow.map(c => String(c).trim().toLowerCase());
    dataRows = rawRows.slice(headerRowIndex + 1);
  } else {
    headers = standardHeaders;
    dataRows = rawRows.slice(headerRowIndex);
  }

  const results = [];
  for (const row of dataRows) {
    if (!row || !row.some(cell => String(cell).trim() !== '')) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c] || ('col_' + c);
      obj[key] = row[c] !== undefined ? row[c] : null;
    }
    results.push(obj);
  }

  return results;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// =============================================
// BULK IMPORT JOBS FROM EXCEL / CSV
// =============================================
router.post('/bulk-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file && (!req.body.jobs || !Array.isArray(req.body.jobs))) {
      return res.status(400).json({
        success: false,
        message: 'No file or jobs array uploaded'
      });
    }

    let rows = [];

    if (req.file) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = parseSheetFlexible(worksheet);
    } else if (Array.isArray(req.body.jobs)) {
      rows = req.body.jobs;
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is empty or has no readable rows'
      });
    }

    let importedCount = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // Accounting for 1-indexed Excel + header row

      try {
        const title = row.title || row.Title || row.job_title;
        if (!title || String(title).trim() === '') {
          errors.push(`Row ${rowIndex}: Title is required`);
          continue;
        }

        const description = row.description || row.Description || 'No description provided';
        const location = row.location || row.Location || 'India';
        const applyLink = row.apply_link || row.ApplyLink || row.apply_url || row.ApplyUrl || 'https://fasthiremela.online';
        
        // Handle Company
        let companyId = row.company_id ? parseInt(row.company_id) : null;
        const companyName = row.company_name || row.CompanyName || row.company || null;
        const companyLogo = row.company_logo || row.CompanyLogo || row.company_logo_url || null;

        if (!companyId && companyName && companyName.trim() !== '') {
          // Check if company exists by name
          const compCheck = await query('SELECT id FROM companies WHERE name ILIKE $1 LIMIT 1', [companyName.trim()]);
          if (compCheck.rows.length > 0) {
            companyId = compCheck.rows[0].id;
          } else {
            // Auto create company
            const compSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
            const newComp = await query(
              'INSERT INTO companies (name, slug, logo_url, is_active) VALUES ($1, $2, $3, true) RETURNING id',
              [companyName.trim(), compSlug, companyLogo]
            );
            companyId = newComp.rows[0].id;
          }
        }

        // Handle Category
        let categoryId = row.category_id ? parseInt(row.category_id) : null;
        const categoryName = row.category_name || row.Category || null;
        if (!categoryId && categoryName && categoryName.trim() !== '') {
          const catCheck = await query('SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1', [categoryName.trim()]);
          if (catCheck.rows.length > 0) {
            categoryId = catCheck.rows[0].id;
          }
        }

        // Handle Slug
        let slug = row.slug ? String(row.slug).trim() : null;
        if (!slug) {
          const baseSlug = generateJobSlug(title, companyName || '');
          slug = await generateUniqueSlug(baseSlug, async (s) => {
            const check = await query('SELECT id FROM jobs WHERE slug = $1', [s]);
            return check.rows.length > 0;
          });
        } else {
          // If provided slug already exists, make it unique
          const check = await query('SELECT id FROM jobs WHERE slug = $1', [slug]);
          if (check.rows.length > 0) {
            slug = slug + '-' + Date.now() + '-' + i;
          }
        }

        // Numeric fields
        const salaryMin = row.salary_min ? parseFloat(row.salary_min) : null;
        const salaryMax = row.salary_max ? parseFloat(row.salary_max) : null;
        const salaryCurrency = row.salary_currency || 'INR';
        const salaryType = row.salary_type || 'annual';
        const experienceMin = row.experience_min ? parseInt(row.experience_min) : null;
        const experienceMax = row.experience_max ? parseInt(row.experience_max) : null;

        // Enum mappings & defaults
        let experienceLevel = (row.experience_level || 'entry').toLowerCase().trim();
        const validExp = ['fresher', 'entry', 'mid', 'senior', 'lead', 'executive'];
        if (!validExp.includes(experienceLevel)) experienceLevel = 'entry';

        let jobType = (row.job_type || 'full-time').toLowerCase().trim().replace(/\s+/g, '-');
        const validTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid'];
        if (!validTypes.includes(jobType)) jobType = 'full-time';

        // Arrays (skills, responsibilities)
        const parseArray = (val) => {
          if (!val) return null;
          if (Array.isArray(val)) return val;
          const str = String(val).trim();
          if (str.startsWith('[') && str.endsWith(']')) {
            try {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
            } catch (e) {
              // fallback
            }
          }
          return str.split(',').map(s => s.trim().replace(/^[\[\"']+|[\"\]']+$/g, '')).filter(Boolean);
        };

        const skillsRequired = parseArray(row.skills_required);
        const responsibilities = parseArray(row.responsibilities);

        // Booleans
        const parseBool = (val, def = true) => {
          if (val === undefined || val === null || val === '') return def;
          const s = String(val).toLowerCase().trim();
          return s === 'true' || s === '1' || s === 'yes' || s === 't';
        };

        const isActive = parseBool(row.is_active, true);
        const isFeatured = parseBool(row.is_featured, false);
        const isPremiumOnly = parseBool(row.is_premium_only, false);

        // Safe date parsing supporting Excel serial dates (numbers like 46010) and date strings
        const parseDate = (val) => {
          if (!val) return null;
          if (typeof val === 'number') {
            return new Date(Math.round((val - 25569) * 86400 * 1000));
          }
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d;
        };

        const deadline = parseDate(row.application_deadline);
        const postedDate = parseDate(row.posted_date) || new Date();
        const expiresAt = parseDate(row.expires_at);

        const eligibility = row.eligibility || null;
        const educationRequired = row.education_required || null;
        const workMode = row.work_mode || (jobType === 'remote' ? 'remote' : 'onsite');

        // Insert into jobs table
        await query(`
          INSERT INTO jobs (
            title, slug, description, company_id, location,
            salary_min, salary_max, salary_currency, salary_type,
            experience_min, experience_max, experience_level, job_type,
            skills_required, responsibilities, eligibility, education_required,
            apply_link, category_id, is_active, is_featured, is_premium_only,
            application_deadline, posted_date, expires_at, work_mode
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13,
            $14, $15, $16, $17,
            $18, $19, $20, $21, $22,
            $23, $24, $25, $26
          )
        `, [
          title, slug, description, companyId, location,
          salaryMin, salaryMax, salaryCurrency, salaryType,
          experienceMin, experienceMax, experienceLevel, jobType,
          skillsRequired, responsibilities, eligibility, educationRequired,
          applyLink, categoryId, isActive, isFeatured, isPremiumOnly,
          deadline, postedDate, expiresAt, workMode
        ]);

        importedCount++;
      } catch (rowErr) {
        console.error(`Error importing row ${rowIndex}:`, rowErr);
        errors.push(`Row ${rowIndex} ("${rows[i].title || 'Unknown'}"): ${rowErr.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} job(s)`,
      data: {
        totalRows: rows.length,
        importedCount,
        failedCount: errors.length,
        errors: errors.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk import',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions for admin
    if (search) {
      paramCount++;
      whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR co.name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (status) {
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
    const validSortFields = ['created_at', 'posted_date', 'id', 'title', 'salary_min', 'view_count', 'company_name', 'is_active'];
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

    // Resolve company_id: verify existence or create if needed
    let finalCompanyId = company_id && company_id.toString().trim() !== '' ? parseInt(company_id) : null;
    let finalCompanyName = (company_name || '').trim();

    // If company_id is provided, verify it actually exists in the database
    if (finalCompanyId) {
      const existingComp = await query('SELECT id FROM companies WHERE id = $1', [finalCompanyId]);
      if (existingComp.rows.length === 0) {
        // Provided company_id does not exist!
        finalCompanyId = null;
      }
    }

    // If no valid company_id but we have a name or logo, find or create the company
    if (!finalCompanyId) {
      if (!finalCompanyName && finalCompanyId === null && company_id) {
        // If user typed a custom company name in company_id field or logo exists
        finalCompanyName = 'Company ' + company_id;
      }

      if (finalCompanyName) {
        const compCheck = await query('SELECT id FROM companies WHERE LOWER(name) = LOWER($1)', [finalCompanyName]);
        if (compCheck.rows.length > 0) {
          finalCompanyId = compCheck.rows[0].id;
        } else {
          // Sync sequence first to prevent duplicate key
          try {
            await query("SELECT setval('companies_id_seq', COALESCE((SELECT MAX(id) FROM companies), 0) + 1, false)");
          } catch(seqErr) {}

          const compSlug = finalCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
          const newComp = await query(
            'INSERT INTO companies (name, slug, logo_url, is_active) VALUES ($1, $2, $3, true) RETURNING id',
            [finalCompanyName, compSlug, company_logo || null]
          );
          finalCompanyId = newComp.rows[0].id;
        }
      } else if (company_logo) {
        // Name not provided but logo provided
        const defaultName = title.split(' ')[0] + ' Employer';
        const compSlug = defaultName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        try {
          await query("SELECT setval('companies_id_seq', COALESCE((SELECT MAX(id) FROM companies), 0) + 1, false)");
        } catch(seqErr) {}
        const newComp = await query(
          'INSERT INTO companies (name, slug, logo_url, is_active) VALUES ($1, $2, $3, true) RETURNING id',
          [defaultName, compSlug, company_logo]
        );
        finalCompanyId = newComp.rows[0].id;
      }
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
        title, slug, description, company_id, location,
        salary_min, salary_max, salary_currency, salary_type,
        experience_min, experience_max, experience_level, job_type,
        skills_required, responsibilities, category_id,
        application_deadline, expires_at, is_featured, is_premium_only, is_active,
        apply_link, posted_date
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, CURRENT_TIMESTAMP
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
    
    const categoryId = parseInt(category_id);

    const result = await query(insertQuery, [
      title, slug, description, finalCompanyId, location,
      salaryMin, salaryMax, salary_currency, salary_type,
      experienceMin, experienceMax, experience_level, job_type,
      skillsArray, responsibilitiesArray, categoryId,
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
    
    // Remove non-existent columns from jobs update
    delete filteredFields.company_name;
    delete filteredFields.company_logo;

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
