import rateLimit from 'express-rate-limit';
import { query } from '../config/database.js';

// Factory function to create rate limit store instances with unique prefixes
const createRateLimitStore = (prefix = '') => {
  return {
    async increment(key) {
      try {
        const prefixedKey = prefix ? `${prefix}:${key}` : key;
        const result = await query(
          `INSERT INTO rate_limits (key, count, reset_time) 
           VALUES ($1, 1, NOW() + INTERVAL '15 minutes')
           ON CONFLICT (key) 
           DO UPDATE SET 
             count = rate_limits.count + 1,
             reset_time = CASE 
               WHEN rate_limits.reset_time < NOW() THEN NOW() + INTERVAL '15 minutes'
               ELSE rate_limits.reset_time
             END
           RETURNING count, reset_time`,
          [prefixedKey]
        );
        return {
          totalHits: result.rows[0].count,
          resetTime: new Date(result.rows[0].reset_time)
        };
      } catch (error) {
        console.error('Rate limit store error:', error);
        // Fallback to memory-based counting
        return { totalHits: 1, resetTime: new Date(Date.now() + 15 * 60 * 1000) };
      }
    },

    async decrement(key) {
      try {
        const prefixedKey = prefix ? `${prefix}:${key}` : key;
        await query(
          'UPDATE rate_limits SET count = GREATEST(count - 1, 0) WHERE key = $1',
          [prefixedKey]
        );
      } catch (error) {
        console.error('Rate limit decrement error:', error);
      }
    },

    async resetKey(key) {
      try {
        const prefixedKey = prefix ? `${prefix}:${key}` : key;
        await query('DELETE FROM rate_limits WHERE key = $1', [prefixedKey]);
      } catch (error) {
        console.error('Rate limit reset error:', error);
      }
    }
  };
};

// Create rate limit table if it doesn't exist
const initializeRateLimitTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key VARCHAR(255) PRIMARY KEY,
        count INTEGER DEFAULT 1,
        reset_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time)
    `);
    
    console.log('✅ Rate limit table initialized');
  } catch (error) {
    console.error('❌ Error initializing rate limit table:', error);
  }
};

// Initialize the table
initializeRateLimitTable();

// General API rate limiter
export const apiLimiter = rateLimit({
  store: createRateLimitStore('api'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: '15 minutes',
      limit: 100,
      windowMs: 15 * 60 * 1000
    });
  }
});

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
  store: createRateLimitStore('strict'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// User-specific rate limiter (based on user ID, not IP)
export const createUserLimiter = (maxRequests = 50, windowMs = 15 * 60 * 1000, prefix = 'user') => {
  return rateLimit({
    store: createRateLimitStore(prefix),
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user ? `user:${req.user.userId}` : `ip:${req.ip}`;
    },
    message: {
      success: false,
      message: `User rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes.`,
      retryAfter: `${windowMs / 60000} minutes`
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes.`,
        retryAfter: `${windowMs / 60000} minutes`,
        userType: req.user ? 'authenticated' : 'anonymous'
      });
    }
  });
};

// Premium user rate limiter (more generous limits)
export const premiumUserLimiter = createUserLimiter(200, 15 * 60 * 1000, 'premium');

// Free user rate limiter (standard limits)
export const freeUserLimiter = createUserLimiter(50, 15 * 60 * 1000, 'free');

// Admin rate limiter (higher limits for admin operations)
export const adminLimiter = createUserLimiter(300, 15 * 60 * 1000, 'admin');

export default {
  apiLimiter,
  strictLimiter,
  createUserLimiter,
  premiumUserLimiter,
  freeUserLimiter,
  adminLimiter
};
