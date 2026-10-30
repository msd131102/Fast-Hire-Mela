import { query } from '../config/database.js';

// Initialize performance monitoring table
const initializePerformanceTable = async () => {
  try {
    // Create table without UUID extension dependency
    await query(`
      CREATE TABLE IF NOT EXISTS performance_logs (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        url VARCHAR(500) NOT NULL,
        status_code INTEGER NOT NULL,
        response_time INTEGER NOT NULL, -- in milliseconds
        user_id INTEGER,
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT
      )
    `);
    
    // Create indexes in a single statement for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON performance_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_performance_logs_url ON performance_logs(url);
      CREATE INDEX IF NOT EXISTS idx_performance_logs_user_id ON performance_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_performance_logs_response_time ON performance_logs(response_time);
    `);
    
    console.log('✅ Performance monitoring table initialized');
  } catch (error) {
    console.error('❌ Error initializing performance table:', error);
  }
};

// Initialize the table
initializePerformanceTable();

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  // Capture response data
  let responseData = null;
  res.send = function(data) {
    responseData = data;
    return originalSend.call(this, data);
  };
  
  // Log when response finishes
  res.on('finish', async () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Only log if not in development or if response time is high
    const shouldLog = process.env.NODE_ENV === 'production' || responseTime > 1000;
    
    if (shouldLog) {
      try {
        await query(
          `INSERT INTO performance_logs 
           (method, url, status_code, response_time, user_id, ip_address, user_agent, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.method,
            req.originalUrl,
            res.statusCode,
            responseTime,
            req.user?.userId || null,
            req.ip || req.connection.remoteAddress,
            req.get('User-Agent') || null,
            res.statusCode >= 400 ? (responseData ? JSON.parse(responseData).message : 'Unknown error') : null
          ]
        );
        
        // Log slow requests to console
        if (responseTime > 2000) {
          console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
        }
      } catch (error) {
        console.error('Error logging performance data:', error);
      }
    }
  });
  
  next();
};

// Get performance statistics
export const getPerformanceStats = async (timeRange = '24 hours') => {
  try {
    let timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
    
    switch (timeRange) {
      case '1 hour':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'1 hour\'';
        break;
      case '6 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'6 hours\'';
        break;
      case '24 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
        break;
      case '7 days':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'7 days\'';
        break;
      case '30 days':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'30 days\'';
        break;
    }
    
    const result = await query(`
      SELECT 
        COUNT(*) as total_requests,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        COUNT(CASE WHEN response_time > 1000 THEN 1 END) as slow_requests,
        COUNT(DISTINCT user_id) as unique_users
      FROM performance_logs 
      WHERE ${timeCondition}
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return null;
  }
};

// Get slow endpoints
export const getSlowEndpoints = async (limit = 10, timeRange = '24 hours') => {
  try {
    let timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
    
    switch (timeRange) {
      case '1 hour':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'1 hour\'';
        break;
      case '6 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'6 hours\'';
        break;
      case '24 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
        break;
      case '7 days':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'7 days\'';
        break;
    }
    
    const result = await query(`
      SELECT 
        url,
        method,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time,
        MAX(response_time) as max_response_time,
        COUNT(CASE WHEN response_time > 1000 THEN 1 END) as slow_count
      FROM performance_logs 
      WHERE ${timeCondition}
      GROUP BY url, method
      ORDER BY avg_response_time DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting slow endpoints:', error);
    return [];
  }
};

// Get error statistics
export const getErrorStats = async (timeRange = '24 hours') => {
  try {
    let timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
    
    switch (timeRange) {
      case '1 hour':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'1 hour\'';
        break;
      case '6 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'6 hours\'';
        break;
      case '24 hours':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'24 hours\'';
        break;
      case '7 days':
        timeCondition = 'timestamp >= NOW() - INTERVAL \'7 days\'';
        break;
    }
    
    const result = await query(`
      SELECT 
        status_code,
        COUNT(*) as count,
        COUNT(DISTINCT url) as affected_endpoints,
        MAX(timestamp) as last_occurrence
      FROM performance_logs 
      WHERE ${timeCondition} AND status_code >= 400
      GROUP BY status_code
      ORDER BY count DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting error stats:', error);
    return [];
  }
};

// Clean up old performance logs
export const cleanupPerformanceLogs = async (daysToKeep = 30) => {
  try {
    const result = await query(
      `DELETE FROM performance_logs 
       WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'`
    );
    
    if (result.rowCount > 0) {
      console.log(`🧹 Cleaned up ${result.rowCount} old performance logs`);
    }
    
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up performance logs:', error);
    return 0;
  }
};

// Cleanup old logs daily
setInterval(async () => {
  await cleanupPerformanceLogs(30);
}, 24 * 60 * 60 * 1000); // 24 hours

export default {
  performanceMonitor,
  getPerformanceStats,
  getSlowEndpoints,
  getErrorStats,
  cleanupPerformanceLogs
};
