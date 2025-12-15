import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

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
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user is premium
export const requirePremium = (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.is_premium) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required'
    });
  }
  next();
};

// Middleware to check if user has specific role
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `${role} role required`
      });
    }
    next();
  };
};

// Optional authentication middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get fresh user data from database
      const userResult = await query(
        'SELECT id, email, name, role, is_active FROM app_users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      }
    } catch (error) {
      // Token invalid, but continue without user
    }
  }
  
  next();
};

// Middleware to check if user is active
export const checkUserActive = async (req, res, next) => {
  try {
    // Skip check for non-authenticated routes
    if (!req.user) {
      return next();
    }

    // Get user from database to check current status
    const userResult = await query(
      'SELECT id, is_active FROM app_users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.',
        code: 'USER_INACTIVE'
      });
    }

    // Update req.user with current status
    req.user.is_active = user.is_active;
    next();
  } catch (error) {
    console.error('Error checking user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
