import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for different file types
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.user?.userId || req.user?.id || 'unknown';
    cb(null, 'resume-' + userId + '-' + uniqueSuffix + ext);
  }
});

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.user?.userId || req.user?.id || 'unknown';
    cb(null, 'profile-' + userId + '-' + uniqueSuffix + ext);
  }
});

// File filter for resumes only
const resumeFileFilter = (req, file, cb) => {
  // Allow document formats for resumes
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
  }
};

// File filter for profile pictures
const profileFileFilter = (req, file, cb) => {
  // Allow image formats for profile pictures
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, GIF, and WebP files are allowed for profile pictures'), false);
  }
};

const upload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for resumes
  }
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
  }
});

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User registration
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, and basic symbols')
], validateRequest, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const { query } = await import('../config/database.js');

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM app_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await query(
      `INSERT INTO app_users (name, email, password_hash, phone, is_active) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, is_active, created_at`,
      [name, email, hashedPassword, phone, true]
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_active: user.is_active,
          created_at: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { query } = await import('../config/database.js');

    // Find user by email
    const userResult = await query(
      'SELECT id, name, email, password_hash, phone, is_active FROM app_users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_active: user.is_active
        },
        token
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = await import('../config/database.js');

    // Get user profile
    const userResult = await query(
      `SELECT id, name, email, phone, city, state, country, postal_code, address,
              bio, website_url, linkedin_url, github_url, experience_years, 
              current_job_title, current_company, industry, education_level, 
              skills, resume_url, portfolio_url, preferred_job_types,
              preferred_locations, preferred_salary_min, preferred_salary_max,
              salary_currency, is_open_to_work, profile_visibility, profile_picture,
              is_premium, premium_expiry, is_active, created_at, updated_at 
       FROM app_users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get application statistics
    const applicationsResult = await query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN application_status = 'accepted' THEN 1 END) as accepted_applications,
        COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected_applications,
        COUNT(CASE WHEN applied_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_applications
      FROM job_applications 
      WHERE user_id = $1
    `, [userId]);

    // Get saved jobs count
    const savedJobsResult = await query(`
      SELECT COUNT(*) as saved_jobs_count
      FROM saved_jobs 
      WHERE user_id = $1
    `, [userId]);

    // Get recent applications with job details
    const recentApplicationsResult = await query(`
      SELECT 
        ja.id,
        ja.application_status as status,
        ja.applied_at as created_at,
        j.title as job_title,
        j.location,
        c.name as company_name,
        c.logo_url as company_logo
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC
      LIMIT 5
    `, [userId]);

    // Get recommended jobs (latest jobs)
    const recommendedJobsResult = await query(`
      SELECT 
        j.*,
        cat.name as category_name,
        cat.slug as category_slug,
        comp.name as company_name,
        comp.logo_url as company_logo
      FROM jobs j
      LEFT JOIN categories cat ON j.category_id = cat.id
      LEFT JOIN companies comp ON j.company_id = comp.id
      WHERE j.is_active = true
      ORDER BY j.created_at DESC
      LIMIT 5
    `);

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_premium: user.is_premium,
        premium_expiry: user.premium_expiry,
        is_active: user.is_active,
        created_at: user.created_at
      },
      statistics: {
        applications: applicationsResult.rows[0] || {
          total_applications: 0,
          pending_applications: 0,
          accepted_applications: 0,
          rejected_applications: 0,
          recent_applications: 0
        },
        saved_jobs: savedJobsResult.rows[0]?.saved_jobs_count || 0
      },
      recent_applications: recentApplicationsResult.rows,
      recommended_jobs: recommendedJobsResult.rows
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = await import('../config/database.js');

    const userResult = await query(
      `SELECT id, name, email, phone, city, state, country, postal_code, address,
              bio, website_url, linkedin_url, github_url, experience_years, 
              current_job_title, current_company, industry, education_level, 
              skills, resume_url, portfolio_url, profile_picture, preferred_job_types,
              preferred_locations, preferred_salary_min, preferred_salary_max,
              salary_currency, is_open_to_work, profile_visibility,
              is_premium, premium_expiry, is_active, created_at, updated_at 
       FROM app_users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          state: user.state,
          country: user.country,
          postal_code: user.postal_code,
          address: user.address,
          bio: user.bio,
          website_url: user.website_url,
          linkedin_url: user.linkedin_url,
          github_url: user.github_url,
          experience_years: user.experience_years,
          current_job_title: user.current_job_title,
          current_company: user.current_company,
          industry: user.industry,
          education_level: user.education_level,
          skills: user.skills,
          resume_url: user.resume_url,
          portfolio_url: user.portfolio_url,
          profile_picture: user.profile_picture,
          preferred_job_types: user.preferred_job_types,
          preferred_locations: user.preferred_locations,
          preferred_salary_min: user.preferred_salary_min,
          preferred_salary_max: user.preferred_salary_max,
          salary_currency: user.salary_currency,
          is_open_to_work: user.is_open_to_work,
          profile_visibility: user.profile_visibility,
          is_premium: user.is_premium,
          premium_expiry: user.premium_expiry,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile (JSON)
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, and basic symbols'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('state').optional().trim().isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),
  body('postal_code').optional().trim().isLength({ max: 20 }).withMessage('Postal code cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
  body('website_url').optional().isURL().withMessage('Website URL must be valid'),
  body('linkedin_url').optional().isURL().withMessage('LinkedIn URL must be valid'),
  body('github_url').optional().isURL().withMessage('GitHub URL must be valid'),
  body('experience_years').optional().isInt({ min: 0, max: 50 }).withMessage('Experience years must be between 0 and 50'),
  body('current_job_title').optional().trim().isLength({ max: 200 }).withMessage('Job title cannot exceed 200 characters'),
  body('current_company').optional().trim().isLength({ max: 200 }).withMessage('Company cannot exceed 200 characters'),
  body('industry').optional().trim().isLength({ max: 100 }).withMessage('Industry cannot exceed 100 characters'),
  body('education_level').optional().trim().isLength({ max: 100 }).withMessage('Education level cannot exceed 100 characters'),
  body('skills').optional().trim().isLength({ max: 1000 }).withMessage('Skills cannot exceed 1000 characters'),
  body('portfolio_url').optional().isURL().withMessage('Portfolio URL must be valid'),
  body('profile_picture').optional().isURL().withMessage('Profile picture URL must be valid'),
  body('preferred_job_types').optional().isArray().withMessage('Preferred job types must be an array'),
  body('preferred_locations').optional().isArray().withMessage('Preferred locations must be an array'),
  body('preferred_salary_min').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  body('preferred_salary_max').optional().isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  body('salary_currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('is_open_to_work').optional().isBoolean().withMessage('is_open_to_work must be a boolean'),
  body('profile_visibility').optional().isIn(['public', 'private', 'contacts_only']).withMessage('Invalid profile visibility option')
], validateRequest, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      name, phone, city, state, country, postal_code, address, bio, website_url,
      linkedin_url, github_url, experience_years, current_job_title, current_company,
      industry, education_level, skills, portfolio_url, profile_picture, preferred_job_types,
      preferred_locations, preferred_salary_min, preferred_salary_max, salary_currency,
      is_open_to_work, profile_visibility
    } = req.body;
    const { query } = await import('../config/database.js');

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    const updatableFields = {
      name, phone, city, state, country, postal_code, address, bio, website_url,
      linkedin_url, github_url, experience_years, current_job_title, current_company,
      industry, education_level, skills, portfolio_url, profile_picture, preferred_job_types,
      preferred_locations, preferred_salary_min, preferred_salary_max, salary_currency,
      is_open_to_work, profile_visibility
    };

    // Filter out profile_url as it doesn't exist in database
    if (req.body.profile_url !== undefined) {
      console.log('⚠️ Skipping profile_url field (not in database)');
      delete req.body.profile_url;
    }

    for (const [field, value] of Object.entries(updatableFields)) {
      if (value !== undefined) {
        updateFields.push(`${field} = $${paramCount++}`);
        updateValues.push(Array.isArray(value) ? JSON.stringify(value) : value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Set is_profile_complete flag when profile is updated
    // Only set to true if essential fields are filled
    updateFields.push(`updated_at = NOW()`);
    
    // We'll calculate profile completion in a separate query to avoid circular dependency
    updateValues.push(userId);

    const updateQuery = `
      UPDATE app_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, city, state, country, postal_code, address,
              bio, website_url, linkedin_url, github_url, experience_years, 
              current_job_title, current_company, industry, education_level, 
              skills, resume_url, portfolio_url, preferred_job_types,
              preferred_locations, preferred_salary_min, preferred_salary_max,
              salary_currency, is_open_to_work, profile_visibility, profile_picture,
              is_premium, premium_expiry, is_active, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          city: updatedUser.city,
          state: updatedUser.state,
          country: updatedUser.country,
          postal_code: updatedUser.postal_code,
          address: updatedUser.address,
          bio: updatedUser.bio,
          website_url: updatedUser.website_url,
          linkedin_url: updatedUser.linkedin_url,
          github_url: updatedUser.github_url,
          experience_years: updatedUser.experience_years,
          current_job_title: updatedUser.current_job_title,
          current_company: updatedUser.current_company,
          industry: updatedUser.industry,
          education_level: updatedUser.education_level,
          skills: updatedUser.skills,
          resume_url: updatedUser.resume_url,
          portfolio_url: updatedUser.portfolio_url,
          profile_picture: updatedUser.profile_picture,
          preferred_job_types: updatedUser.preferred_job_types,
          preferred_locations: updatedUser.preferred_locations,
          preferred_salary_min: updatedUser.preferred_salary_min,
          preferred_salary_max: updatedUser.preferred_salary_max,
          salary_currency: updatedUser.salary_currency,
          is_open_to_work: updatedUser.is_open_to_work,
          profile_visibility: updatedUser.profile_visibility,
          is_premium: updatedUser.is_premium,
          premium_expiry: updatedUser.premium_expiry,
          is_active: updatedUser.is_active,
          updated_at: updatedUser.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile (FormData with extended fields) - PUT version
router.put('/profile-form', [
  authenticateToken,
  profileUpload.single('profile_picture')
], async (req, res) => {
  try {
    console.log('📝 Profile form PUT update request received');
    console.log('👤 User from token:', req.user);
    console.log('📤 Request body fields:', Object.keys(req.body));
    console.log('📁 File uploaded:', req.file ? req.file.filename : 'No file');

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const userId = req.user.userId;
    const { query } = await import('../config/database.js');

    // Get the complete user record from database to get the role
    const userRecord = await query(
      'SELECT id, email, role FROM app_users WHERE id = $1',
      [userId]
    );

    if (!userRecord.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userRecord.rows[0];
    console.log('🔍 User record from DB:', user.email, 'Role:', user.role);

    // Check if user has permission to update profile
    if (user.role === 'admin' || user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins should use admin panel for profile updates'
      });
    }

    // Define allowed fields that exist in the database
    const allowedFields = [
      'name', 'phone', 'city', 'state', 'country', 'postal_code', 'address',
      'bio', 'website_url', 'linkedin_url', 'github_url', 'experience_years',
      'current_job_title', 'current_company', 'industry', 'education_level',
      'skills', 'portfolio_url', 'profile_picture', 'preferred_job_types',
      'preferred_locations', 'preferred_salary_min', 'preferred_salary_max',
      'salary_currency', 'is_open_to_work', 'profile_visibility'
    ];

    // Filter and process data
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      // Skip profile_url as it doesn't exist in database
      if (key === 'profile_url') {
        console.log('⚠️ Skipping profile_url field (not in database)');
        return;
      }
      
      if (allowedFields.includes(key)) {
        const value = req.body[key];
        
        // Process different data types
        if (typeof value === 'boolean') {
          updateData[key] = value;
        } else if (value !== null && value !== '') {
          // Convert string 'true'/'false' to boolean if needed
          if (value === 'true') {
            updateData[key] = true;
          } else if (value === 'false') {
            updateData[key] = false;
          } else if (key === 'experience_years' && value !== '') {
            updateData[key] = parseInt(value) || null;
          } else if ((key === 'preferred_salary_min' || key === 'preferred_salary_max') && value !== '') {
            updateData[key] = parseFloat(value) || null;
          } else if (key === 'skills' || key === 'preferred_job_types' || key === 'preferred_locations') {
            // Handle array fields - convert comma-separated to array
            if (typeof value === 'string' && value.includes(',')) {
              updateData[key] = value.split(',').map(item => item.trim()).filter(item => item);
            } else {
              updateData[key] = value ? [value] : null;
            }
          } else {
            updateData[key] = value;
          }
        }
      }
    });

    if (Object.keys(updateData).length === 0 && !req.file) {
      console.log('⚠️ No fields to update');
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const [field, value] of Object.entries(updateData)) {
      updateFields.push(`${field} = $${paramCount++}`);
      updateValues.push(value);
    }

    // Handle file upload
    if (req.file) {
      updateFields.push(`profile_picture = $${paramCount++}`);
      updateValues.push(req.file.path);
      console.log('📷 Profile picture uploaded:', req.file.path);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE app_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, city, state, country, postal_code, address,
              bio, website_url, linkedin_url, github_url, experience_years,
              current_job_title, current_company, industry, education_level,
              skills, resume_url, portfolio_url, preferred_job_types,
              preferred_locations, preferred_salary_min, preferred_salary_max,
              salary_currency, is_open_to_work, profile_visibility, profile_picture,
              updated_at
    `;

    console.log('🔧 Update query:', updateQuery);
    console.log('📊 Update values:', updateValues);

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = result.rows[0];
    console.log('✅ Profile updated successfully for user:', userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile (FormData with extended fields)
router.post('/profile-form', [
  authenticateToken,
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ])
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = await import('../config/database.js');

    console.log('📝 Profile form update request for user:', userId);
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📁 Files:', req.files ? Object.keys(req.files) : 'No files');

    // Define allowed fields that exist in the database
    const allowedFields = [
      'name', 'phone', 'city', 'state', 'country', 'postal_code', 'address',
      'bio', 'website_url', 'linkedin_url', 'github_url', 'experience_years',
      'current_job_title', 'current_company', 'industry', 'education_level',
      'skills', 'resume_url', 'portfolio_url', 'preferred_job_types',
      'preferred_locations', 'preferred_salary_min', 'preferred_salary_max',
      'salary_currency', 'is_open_to_work', 'profile_visibility', 'profile_picture'
    ];

    // Filter and process data
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      // Skip profile_url as it doesn't exist in database
      if (key === 'profile_url') {
        console.log('⚠️ Skipping profile_url field (not in database)');
        return;
      }
      
      if (key !== 'profile_picture' && key !== 'resume' && allowedFields.includes(key)) {
        const value = req.body[key];
        
        // Process different data types
        if (typeof value === 'boolean') {
          updateData[key] = value;
        } else if (value !== null && value !== '') {
          // Convert string 'true'/'false' to boolean if needed
          if (value === 'true') {
            updateData[key] = true;
          } else if (value === 'false') {
            updateData[key] = false;
          } else if (key === 'experience_years' && value !== '') {
            updateData[key] = parseInt(value) || null;
          } else if ((key === 'preferred_salary_min' || key === 'preferred_salary_max') && value !== '') {
            updateData[key] = parseFloat(value) || null;
          } else if (key === 'skills' || key === 'preferred_job_types' || key === 'preferred_locations') {
            // Handle array fields
            try {
              updateData[key] = Array.isArray(value) ? value : (value ? JSON.parse(value) : null);
            } catch (e) {
              updateData[key] = value ? [value] : null;
            }
          } else {
            updateData[key] = value;
          }
        }
      }
    });

    if (Object.keys(updateData).length === 0 && !req.files?.profile_picture && !req.files?.resume) {
      console.log('⚠️ No fields to update');
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const [field, value] of Object.entries(updateData)) {
      updateFields.push(`${field} = $${paramCount++}`);
      updateValues.push(value);
    }

    // Handle file uploads
    if (req.files?.profile_picture) {
      updateFields.push(`profile_picture = $${paramCount++}`);
      updateValues.push(req.files.profile_picture[0].path);
      console.log('📷 Profile picture uploaded:', req.files.profile_picture[0].path);
    }

    if (req.files?.resume) {
      updateFields.push(`resume_url = $${paramCount++}`);
      updateValues.push(req.files.resume[0].path);
      console.log('📄 Resume uploaded:', req.files.resume[0].path);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE app_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, city, state, country, postal_code, address,
              bio, website_url, linkedin_url, github_url, experience_years,
              current_job_title, current_company, industry, education_level,
              skills, resume_url, portfolio_url, preferred_job_types,
              preferred_locations, preferred_salary_min, preferred_salary_max,
              salary_currency, is_open_to_work, profile_visibility, profile_picture,
              updated_at
    `;

    console.log('🔧 Update query:', updateQuery);
    console.log('📊 Update values:', updateValues);

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = result.rows[0];
    console.log('✅ Profile updated successfully for user:', userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload resume
router.post('/upload-resume', [
  authenticateToken,
  upload.single('resume')
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const { query } = await import('../config/database.js');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update user's resume_url
    const result = await query(
      'UPDATE app_users SET resume_url = $1, updated_at = NOW() WHERE id = $2 RETURNING resume_url, updated_at',
      [req.file.path, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume_url: result.rows[0].resume_url,
        updated_at: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply for job
router.post('/apply', [
  authenticateToken,
  upload.single('resume'),
  body('jobId').isUUID().withMessage('Valid job ID is required'),
  body('coverLetter').optional().trim().isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters')
], validateRequest, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId, coverLetter } = req.body;
    const { query } = await import('../config/database.js');

    // Check if job exists and is active
    const jobResult = await query(
      'SELECT id, title, is_active FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = jobResult.rows[0];
    if (!job.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer active'
      });
    }

    // Check if user has already applied for this job
    const existingApplication = await query(
      'SELECT id FROM job_applications WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Handle resume file
    let resumePath = null;
    if (req.file) {
      resumePath = req.file.path;
    }

    // Create application
    const applicationResult = await query(`
      INSERT INTO job_applications (user_id, job_id, resume_path, cover_letter, application_status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, user_id, job_id, resume_path, cover_letter, application_status, applied_at
    `, [userId, jobId, resumePath, coverLetter]);

    const application = applicationResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: application.id,
          user_id: application.user_id,
          job_id: application.job_id,
          resume_path: application.resume_path,
          cover_letter: application.cover_letter,
          status: application.application_status,
          applied_at: application.applied_at
        }
      }
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const { query } = await import('../config/database.js');

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE ja.user_id = $1';
    let queryParams = [userId];
    let paramCount = 2;

    if (status) {
      whereClause += ` AND ja.application_status = $${paramCount++}`;
      queryParams.push(status);
    }

    // Get applications with job details
    const applicationsResult = await query(`
      SELECT 
        ja.id,
        ja.application_status as status,
        ja.applied_at,
        ja.resume_url,
        ja.cover_letter,
        j.title as job_title,
        j.location,
        j.salary_min,
        j.salary_max,
        j.job_type,
        c.name as company_name,
        c.logo_url as company_logo
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY ja.applied_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `, [...queryParams, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM job_applications ja
      ${whereClause}
    `, queryParams);

    res.json({
      success: true,
      data: {
        applications: applicationsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].total / limit),
          total_applications: parseInt(countResult.rows[0].total),
          has_next: offset + applicationsResult.rows.length < countResult.rows[0].total,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Save/unsave job
router.post('/saved-jobs', [
  authenticateToken,
  body('jobId').isUUID().withMessage('Valid job ID is required')
], validateRequest, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;
    const { query } = await import('../config/database.js');

    // Check if job exists
    const jobResult = await query(
      'SELECT id FROM jobs WHERE id = $1 AND is_active = true',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is already saved
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
        data: { saved: false }
      });
    } else {
      // Save the job
      await query(
        'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2)',
        [userId, jobId]
      );

      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { saved: true }
      });
    }
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get saved jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const { query } = await import('../config/database.js');

    const offset = (page - 1) * limit;

    // Get saved jobs with details
    const savedJobsResult = await query(`
      SELECT 
        sj.id as save_id,
        sj.saved_at,
        j.*,
        cat.name as category_name,
        cat.slug as category_slug,
        comp.name as company_name,
        comp.logo_url as company_logo
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      LEFT JOIN companies comp ON j.company_id = comp.id
      WHERE sj.user_id = $1 AND j.is_active = true
      ORDER BY sj.saved_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM saved_jobs WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        saved_jobs: savedJobsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].total / limit),
          total_saved_jobs: parseInt(countResult.rows[0].total),
          has_next: offset + savedJobsResult.rows.length < countResult.rows[0].total,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create user (admin only)
router.post('/', [
  requireAdmin,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, and basic symbols'),
  body('is_premium').optional().isBoolean().withMessage('is_premium must be a boolean'),
  body('premium_expiry').optional().isISO8601().withMessage('premium_expiry must be a valid date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password, phone, is_premium, premium_expiry, is_active } = req.body;
    const { query } = await import('../config/database.js');

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM app_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await query(
      `INSERT INTO app_users (name, email, password_hash, phone, is_premium, premium_expiry, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, is_premium, premium_expiry, is_active, created_at`,
      [name, email, hashedPassword, phone || null, is_premium || false, premium_expiry || null, is_active !== false]
    );

    const user = newUser.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_premium: user.is_premium,
          premium_expiry: user.premium_expiry,
          is_active: user.is_active,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, role } = req.query;
    const { query } = await import('../config/database.js');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND is_active = $${paramCount}`;
      queryParams.push(status === 'active');
      paramCount++;
    }

    if (role) {
      whereClause += ` AND is_premium = $${paramCount}`;
      queryParams.push(role === 'premium');
      paramCount++;
    }

    const usersResult = await query(`
      SELECT 
        id, name, email, phone, is_premium, premium_expiry, 
        is_active, CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END as status,
        created_at, updated_at
      FROM app_users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `, [...queryParams, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM app_users ${whereClause}
    `, queryParams);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.rows[0].total / limit),
          total_users: parseInt(countResult.rows[0].total),
          has_next: offset + usersResult.rows.length < countResult.rows[0].total,
          has_prev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user details (admin only)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = await import('../config/database.js');

    const userResult = await query(`
      SELECT 
        id, name, email, phone, is_premium, premium_expiry, 
        is_active, CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END as status,
        created_at, updated_at
      FROM app_users 
      WHERE id = $1
    `, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Get user statistics
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM job_applications WHERE user_id = $1) as total_applications,
        (SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1) as saved_jobs
    `, [id]);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          statistics: statsResult.rows[0]
        }
      }
    });
  } catch (error) {
    console.error('Get admin user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user (admin only)
router.put('/:id', [
  requireAdmin,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, and basic symbols'),
  body('is_premium').optional().isBoolean().withMessage('is_premium must be a boolean'),
  body('premium_expiry').optional().isISO8601().withMessage('premium_expiry must be a valid date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, is_premium, premium_expiry, is_active } = req.body;
    const { query } = await import('../config/database.js');

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM app_users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      updateValues.push(phone);
    }

    if (is_premium !== undefined) {
      updateFields.push(`is_premium = $${paramCount++}`);
      updateValues.push(is_premium);
    }

    if (premium_expiry !== undefined) {
      updateFields.push(`premium_expiry = $${paramCount++}`);
      updateValues.push(premium_expiry);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE app_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, is_premium, premium_expiry, is_active, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = await import('../config/database.js');

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM app_users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM app_users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Block/Deactivate User
router.put('/:userId/block', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = await import('../config/database.js');
    
    const result = await query(
      'UPDATE app_users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, is_active, CASE WHEN is_active = true THEN \'active\' ELSE \'inactive\' END as status',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User blocked successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unblock/Activate User
router.put('/:userId/unblock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = await import('../config/database.js');
    
    const result = await query(
      'UPDATE app_users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, is_active, CASE WHEN is_active = true THEN \'active\' ELSE \'inactive\' END as status',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User unblocked successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle User Status
router.put('/:userId/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = await import('../config/database.js');
    
    const result = await query(
      'UPDATE app_users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, is_active, CASE WHEN is_active = true THEN \'active\' ELSE \'inactive\' END as status',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];
    
    res.json({
      success: true,
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
