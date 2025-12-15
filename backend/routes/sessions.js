import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { SessionManager } from '../middleware/sessionTracker.js';
import { getPerformanceStats, getSlowEndpoints, getErrorStats } from '../middleware/performanceMonitor.js';
import { query } from '../config/database.js';

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

// Get current user's sessions
router.get('/my-sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await SessionManager.getUserSessions(req.user.userId);
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          ip_address: session.ip_address,
          user_agent: session.user_agent,
          created_at: session.created_at,
          last_activity: session.last_activity,
          expires_at: session.expires_at,
          is_current: session.session_token === req.headers.authorization?.split(' ')[1]
        })),
        total_sessions: sessions.length
      }
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout from a specific session
router.delete('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get the session to verify it belongs to the current user
    const sessionResult = await query(
      'SELECT session_token FROM user_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.userId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const success = await SessionManager.deactivateSession(sessionResult.rows[0].session_token);
    
    if (success) {
      res.json({
        success: true,
        message: 'Session terminated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to terminate session'
      });
    }
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout from all sessions (except current)
router.delete('/all-sessions', authenticateToken, async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1];
    
    // Get all sessions for the user
    const sessions = await SessionManager.getUserSessions(req.user.userId);
    
    // Deactivate all sessions except the current one
    let terminatedCount = 0;
    
    for (const session of sessions) {
      if (session.session_token !== currentToken) {
        const success = await SessionManager.deactivateSession(session.session_token);
        if (success) terminatedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Terminated ${terminatedCount} sessions successfully`,
      data: {
        terminated_sessions: terminatedCount,
        current_session_preserved: true
      }
    });
  } catch (error) {
    console.error('Error terminating all sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system performance stats (admin only)
router.get('/admin/performance', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { timeRange = '24 hours' } = req.query;
    
    const [performanceStats, slowEndpoints, errorStats, sessionStats] = await Promise.all([
      getPerformanceStats(timeRange),
      getSlowEndpoints(10, timeRange),
      getErrorStats(timeRange),
      SessionManager.getSessionStats()
    ]);
    
    res.json({
      success: true,
      data: {
        performance: performanceStats,
        slow_endpoints: slowEndpoints,
        errors: errorStats,
        sessions: sessionStats,
        time_range: timeRange
      }
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get session statistics (admin only)
router.get('/admin/sessions-stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const sessionStats = await SessionManager.getSessionStats();
    
    // Get recent session activity
    const recentActivity = await query(`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as new_sessions,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_sessions 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
      LIMIT 24
    `);
    
    res.json({
      success: true,
      data: {
        session_stats: sessionStats,
        recent_activity: recentActivity.rows,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
