import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

// Import existing routes to reuse with admin middleware
import jobsRoutes from './admin-jobs.js';
import categoriesRoutes from './categories.js';
import companiesRoutes from './companies.js';
import usersRoutes from './users.js';
import settingsRoutes from './settings.js';
import paymentsRoutes from './payments.js';
import locationsRoutes from './locations.js';
import rolesRoutes from './roles.js';
import applicationsRoutes from './admin-applications.js';
import analyticsRoutes from './admin-analytics.js';

const router = express.Router();

// Admin auth routes (no authentication required for login/signup)
router.post('/auth/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await req.db.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await req.db.query(
      `INSERT INTO admins (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, 'admin']
    );

    const admin = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/auth/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find admin by email
    const result = await req.db.query(
      'SELECT id, name, email, password_hash, role FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify admin token endpoint
router.get('/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Token is already verified by authenticateToken middleware
    // Get admin details from database
    const result = await req.db.query(
      'SELECT id, name, email, role FROM admins WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = result.rows[0];

    res.json({
      success: true,
      message: 'Token verified successfully',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply authentication and admin middleware to protected routes
router.use(authenticateToken, requireAdmin);

// Mount existing routes with admin protection
router.use('/jobs', jobsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/companies', companiesRoutes);
router.use('/users', usersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/locations', locationsRoutes);
router.use('/roles', rolesRoutes);
router.use('/applications', applicationsRoutes);

// Admin-specific routes
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard endpoint working',
    data: {
      user: req.user,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
