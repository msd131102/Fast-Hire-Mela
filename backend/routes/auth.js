import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { query } from '../config/database.js';
import { SessionManager } from '../middleware/sessionTracker.js';

const router = express.Router();

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

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Admin Registration
router.post('/register/admin', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists in admins table
    const existingAdmin = await query(
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
    const result = await query(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, 'admin']
    );

    const admin = result.rows[0];

    // Generate token
    const token = generateToken(admin.id, admin.role);

    // Create session for tracking
    try {
      await SessionManager.createSession(admin.id, req);
    } catch (error) {
      console.error('Error creating admin session:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin Signup (for admin panel)
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists in admins table
    const existingAdmin = await query(
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
    const result = await query(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, 'admin']
    );

    const admin = result.rows[0];

    // Generate token
    const token = generateToken(admin.id, admin.role);

    // Create session for tracking
    try {
      await SessionManager.createSession(admin.id, req);
    } catch (error) {
      console.error('Error creating admin session:', error);
    }

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

// User Registration with OTP Verification (separate endpoint for frontend)
router.post('/register-with-otp', [
  body('userData').isObject().withMessage('User data is required'),
  body('userData.name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('userData.email').isEmail().withMessage('Please provide a valid email'),
  body('userData.password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userData.phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('otp').notEmpty().withMessage('OTP is required for registration')
], validateRequest, async (req, res) => {
  try {
    const { userData, otp } = req.body;
    const { name, email, password, phone } = userData;

    // Check if user already exists using User model
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify OTP
    const otpRecord = await Otp.findByEmailAndOtp(email, otp, 'registration');
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is expired
    if (Otp.isExpired(otpRecord)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used'
      });
    }

    // Mark OTP as used
    await Otp.markAsUsed(otpRecord.id);

    // Create user using User model
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Auto-verify email since OTP was verified
    await User.verifyEmail(user.id);

    // Generate token
    const token = generateToken(user.id, 'user');

    // Create session for tracking
    try {
      await SessionManager.createSession(user.id, req);
    } catch (error) {
      console.error('Error creating user session:', error);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'user': user.
          profile_completed: user.profile_completed
        },
        token
      }
    });
  } catch (error) {
    console.error('User registration with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User Registration with OTP Verification (legacy endpoint)
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('otp').notEmpty().withMessage('OTP is required for registration')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    // Check if user already exists using User model
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify OTP
    const otpRecord = await Otp.findByEmailAndOtp(email, otp, 'registration');
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is expired
    if (Otp.isExpired(otpRecord)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return res.status(400).json({
        success: false,
        message: 'OTP has already been used'
      });
    }

    // Mark OTP as used
    await Otp.markAsUsed(otpRecord.id);

    // Create user using User model
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Auto-verify email since OTP was verified
    await User.verifyEmail(user.id);

    // Generate token
    const token = generateToken(user.id, 'user');

    // Create session for tracking
    try {
      await SessionManager.createSession(user.id, req);
    } catch (error) {
      console.error('Error creating user session:', error);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'user': user.
          profile_completed: user.profile_completed
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

// Pre-registration validation (check if email is available)
router.post('/register/validate', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists using User model
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.json({
      success: true,
      message: 'Email is available for registration'
    });
  } catch (error) {
    console.error('Email validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login (for both admin and users)
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // First try to find user using User model
    let user = await User.findByEmail(email);
    let role = 'user';

    if (!user) {
      // If not found in app_users, try admins table
      const result = await query(
        'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
        [email]
      );
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'admin';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password is provided (for social login users)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Please set a password for your account'
      });
    }

    // Compare password
    const isPasswordValid = await User.validatePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if premium is still valid (only for regular users)
    let isPremiumActive = false;
    if (role === 'user') {
      isPremiumActive = user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();
    }

    // Generate token
    const token = generateToken(user.id, role);

    // Create session for tracking
    try {
      await SessionManager.createSession(user.id, req);
    } catch (error) {
      console.error('Error creating login session:', error);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role, is_premium: isPremiumActive,
          profile_completed: role === 'user' ? user.profile_completed : null
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Social Login (Google, etc.)
router.post('/social-login', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { name, email, provider } = req.body;

    // Find user by email using User model
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user for social login (password_hash is required but can be empty for social login)
      const result = await query(
        `INSERT INTO app_users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email,  created_at`,
        [name, email, '']
      );
      user = result.rows[0];
    }

    // Check if premium is still valid
    const isPremiumActive = user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();

    // Generate token
    const token = generateToken(user.id, 'user');

    // Create session for tracking
    try {
      await SessionManager.createSession(user.id, req);
    } catch (error) {
      console.error('Error creating social login session:', error);
    }

    res.json({
      success: true,
      message: 'Social login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user': isPremiumActive,
          profile_completed: user.profile_completed
        },
        token
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'admin') {
      // Get admin profile
      const result = await query(
        `SELECT id, name, email, role, created_at 
         FROM admins WHERE id = $1`,
        [req.user.userId]
      );
      user = result.rows[0];
    } else {
      // Get user profile using User model
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if premium is still valid (only for regular users)
    let isPremiumActive = false;
    if (req.user.role === 'user') {
      isPremiumActive = user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: req.user.role: isPremiumActive,
          premium_expiry: user.premium_expiry || null,
          created_at: user.created_at
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

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], validateRequest, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin profile update not supported through this endpoint'
      });
    }

    const { name, phone } = req.body;
    const user = await User.updateProfile(req.user.userId, { name, phone });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone: user.
          updated_at: user.updated_at
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

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin password change not supported through this endpoint'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await User.validatePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await User.updatePassword(req.user.userId, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token (for both users and admins)
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'admin') {
      // Get admin profile
      const result = await query(
        `SELECT id, name, email, role, created_at 
         FROM admins WHERE id = $1`,
        [req.user.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      user = result.rows[0];
    } else {
      // Get user profile using User model
      user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Check if premium is still valid (only for regular users)
    let isPremiumActive = false;
    if (req.user.role === 'user') {
      isPremiumActive = user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          role: req.user.role: isPremiumActive,
          premium_expiry: user.premium_expiry || null,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email (check both app_users and admins tables)
    let user = await User.findByEmail(email);
    let userType = 'user';
    
    if (!user) {
      // Check admins table
      const adminResult = await query(
        'SELECT id, email FROM admins WHERE email = $1',
        [email]
      );
      if (adminResult.rows.length > 0) {
        user = adminResult.rows[0];
        userType = 'admin';
      }
    }

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store reset token in database
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         token_hash = $2,
         expires_at = $3,
         used = FALSE`,
      [user.id, resetToken, resetTokenExpiry]
    );

    // In a real application, you would send an email here
    // For now, we'll return the reset token in the response for testing
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: http://localhost:5174/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && {
        resetToken,
        resetLink: `http://localhost:5174/reset-password?token=${resetToken}`
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const tokenResult = await query(
      `SELECT user_id, expires_at 
       FROM password_reset_tokens 
       WHERE token_hash = $1 AND used = FALSE`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const { user_id, expires_at } = tokenResult.rows[0];

    // Check if token has expired
    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Try to update password in app_users first
    const userUpdateResult = await query(
      'UPDATE app_users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, user_id]
    );

    // If no rows were updated, try admins table
    if (userUpdateResult.rowCount === 0) {
      await query(
        'UPDATE admins SET password_hash = $1 WHERE id = $2',
        [hashedPassword, user_id]
      );
    }

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = $1',
      [token]
    );

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify admin token (for admin panel - separate endpoint)
router.get('/verify-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, created_at 
       FROM admins WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = result.rows[0];

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          created_at: admin.created_at
        }
      }
    });
  } catch (error) {
    console.error('Verify admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
