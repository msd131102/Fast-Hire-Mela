import { query } from '../config/database.js';
import crypto from 'crypto';

// Initialize session tracking table
const initializeSessionTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes in a single statement for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
    `);
    
    console.log('✅ User sessions table initialized');
  } catch (error) {
    console.error('❌ Error initializing session table:', error);
  }
};

// Initialize the table
initializeSessionTable();

// Session management class
export class SessionManager {
  // Create a new session for a user
  static async createSession(userId, req, expiresIn = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + expiresIn);
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Deactivate old sessions for this user (optional - uncomment to limit concurrent sessions)
      // await this.deactivateUserSessions(userId);

      const result = await query(
        `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, sessionToken, ipAddress, userAgent, expiresAt]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Update session activity
  static async updateActivity(sessionToken) {
    try {
      await query(
        `UPDATE user_sessions 
         SET last_activity = CURRENT_TIMESTAMP 
         WHERE session_token = $1 AND is_active = true`,
        [sessionToken]
      );
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Get active sessions for a user
  static async getUserSessions(userId) {
    try {
      const result = await query(
        `SELECT id, session_token, ip_address, user_agent, created_at, last_activity, expires_at
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
         ORDER BY last_activity DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Deactivate a specific session
  static async deactivateSession(sessionToken) {
    try {
      await query(
        `UPDATE user_sessions 
         SET is_active = false 
         WHERE session_token = $1`,
        [sessionToken]
      );
      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  // Deactivate all sessions for a user
  static async deactivateUserSessions(userId) {
    try {
      await query(
        `UPDATE user_sessions 
         SET is_active = false 
         WHERE user_id = $1`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('Error deactivating user sessions:', error);
      return false;
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions() {
    try {
      const result = await query(
        `DELETE FROM user_sessions 
         WHERE expires_at < NOW() OR (is_active = false AND last_activity < NOW() - INTERVAL '30 days')`
      );
      if (result.rowCount > 0) {
        console.log(`🧹 Cleaned up ${result.rowCount} expired sessions`);
      }
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  // Get session statistics
  static async getSessionStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
          COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as non_expired_sessions,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_sessions
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }
}

// Middleware to track user sessions
export const sessionTracker = async (req, res, next) => {
  // Skip session tracking for non-authenticated routes
  if (!req.user || !req.headers.authorization) {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1]; // Bearer TOKEN
    
    // Update session activity
    await SessionManager.updateActivity(token);
    
    // Add session info to request
    req.sessionInfo = {
      token,
      lastActivity: new Date()
    };
  } catch (error) {
    console.error('Session tracking error:', error);
  }

  next();
};

// Middleware to limit concurrent sessions per user
export const concurrentSessionLimiter = (maxSessions = 3) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    try {
      const sessions = await SessionManager.getUserSessions(req.user.userId);
      
      if (sessions.length >= maxSessions) {
        return res.status(429).json({
          success: false,
          message: `Maximum concurrent sessions (${maxSessions}) exceeded. Please logout from other devices.`,
          currentSessions: sessions.length,
          maxSessions
        });
      }

      next();
    } catch (error) {
      console.error('Concurrent session limiter error:', error);
      next(); // Allow request to proceed if there's an error
    }
  };
};

// Cleanup expired sessions every hour
setInterval(async () => {
  await SessionManager.cleanupExpiredSessions();
}, 60 * 60 * 1000); // 1 hour

export default {
  SessionManager,
  sessionTracker,
  concurrentSessionLimiter
};
