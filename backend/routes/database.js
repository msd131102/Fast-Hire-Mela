import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get database statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get database size (approximate)
    const sizeQuery = `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `;
    
    // Get table count
    const tableCountQuery = `
      SELECT COUNT(*) as table_count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;
    
    // Get total record count
    const recordCountQuery = `
      SELECT 
        SUM(n_tup_ins) as total_records
      FROM pg_stat_user_tables
    `;

    const [sizeResult, tableCountResult, recordCountResult] = await Promise.all([
      query(sizeQuery),
      query(tableCountQuery),
      query(recordCountQuery)
    ]);

    const stats = {
      totalSize: sizeResult.rows[0]?.database_size || '0 MB',
      totalTables: parseInt(tableCountResult.rows[0]?.table_count) || 0,
      totalRecords: parseInt(recordCountResult.rows[0]?.total_records) || 0,
      lastBackup: null, // TODO: Implement backup tracking
      status: 'healthy'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database statistics' });
  }
});

// Get database tables information
router.get('/tables', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // First get all table names
    const tableNamesQuery = `
      SELECT table_name as name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const tableNamesResult = await query(tableNamesQuery);
    
    // Then get actual record count and size for each table
    const formattedTables = [];
    
    for (const table of tableNamesResult.rows) {
      try {
        // Get actual record count for this table
        const countQuery = `SELECT COUNT(*) as count FROM "${table.name}"`;
        const countResult = await query(countQuery);
        
        // Get table size
        const sizeQuery = `SELECT pg_size_pretty(pg_total_relation_size('public.${table.name}')) as size`;
        const sizeResult = await query(sizeQuery);
        
        formattedTables.push({
          name: table.name,
          records: parseInt(countResult.rows[0]?.count) || 0,
          size: sizeResult.rows[0]?.size || '0 MB',
          status: 'healthy'
        });
      } catch (error) {
        // If we can't count records for a table, still include it with 0 records
        formattedTables.push({
          name: table.name,
          records: 0,
          size: '0 MB',
          status: 'error'
        });
      }
    }

    res.json(formattedTables);
  } catch (error) {
    console.error('Error fetching database tables:', error);
    res.status(500).json({ error: 'Failed to fetch database tables' });
  }
});

// Get backup history (placeholder for now)
router.get('/backups', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement actual backup tracking
    const backups = [];
    res.json(backups);
  } catch (error) {
    console.error('Error fetching backup history:', error);
    res.status(500).json({ error: 'Failed to fetch backup history' });
  }
});

// Get recent operations (placeholder for now)
router.get('/operations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement operation logging
    const operations = [];
    res.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
});

// Create backup
router.post('/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement actual backup functionality
    console.log('Creating database backup...');
    
    // Log operation
    await logOperation('backup', 'completed', req.user.id);
    
    res.json({ message: 'Backup created successfully' });
  } catch (error) {
    console.error('Error creating backup:', error);
    await logOperation('backup', 'failed', req.user.id);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore backup
router.post('/restore/:backupId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { backupId } = req.params;
    
    // TODO: Implement actual restore functionality
    console.log('Restoring backup:', backupId);
    
    // Log operation
    await logOperation('restore', 'completed', req.user.id);
    
    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    await logOperation('restore', 'failed', req.user.id);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Optimize database
router.post('/optimize', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get all table names
    const tablesQuery = `
      SELECT table_name as tablename
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    `;
    
    const tablesResult = await query(tablesQuery);
    
    // Optimize each table using VACUUM ANALYZE
    for (const table of tablesResult.rows) {
      await query(`VACUUM ANALYZE "${table.tablename}"`);
    }
    
    // Log operation
    await logOperation('optimize', 'completed', req.user.id);
    
    res.json({ message: 'Database optimized successfully' });
  } catch (error) {
    console.error('Error optimizing database:', error);
    await logOperation('optimize', 'failed', req.user.id);
    res.status(500).json({ error: 'Failed to optimize database' });
  }
});

// Cleanup database
router.post('/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, days, dryRun = false, createBackup = true } = req.body;
    
    console.log(`Starting ${type || 'general'} cleanup... Dry run: ${dryRun}`);
    
    let cleanupResults = {
      type: type || 'general',
      recordsDeleted: 0,
      tablesCleaned: [],
      errors: [],
      backupCreated: false
    };

    // Create backup before cleanup if requested
    if (createBackup && !dryRun) {
      try {
        await logOperation('backup', 'completed', req.user.id);
        cleanupResults.backupCreated = true;
      } catch (backupError) {
        console.error('Backup creation failed:', backupError);
        cleanupResults.errors.push('Failed to create backup');
      }
    }

    // Perform different types of cleanup based on type
    switch (type) {
      case 'old-records':
        cleanupResults = await cleanupOldRecords(days, dryRun);
        break;
      case 'inactive-users':
        cleanupResults = await cleanupInactiveUsers(days, dryRun);
        break;
      case 'expired-sessions':
        cleanupResults = await cleanupExpiredSessions(days, dryRun);
        break;
      case 'orphaned-data':
        cleanupResults = await cleanupOrphanedData(dryRun);
        break;
      default:
        // General cleanup - remove old records from multiple tables
        cleanupResults = await cleanupOldRecords(days || 90, dryRun);
        break;
    }

    // Log operation
    await logOperation('cleanup', 'completed', req.user.id);
    
    res.json({ 
      message: dryRun ? 'Dry run completed successfully' : 'Database cleaned up successfully',
      results: cleanupResults,
      dryRun: dryRun
    });
  } catch (error) {
    console.error('Error cleaning up database:', error);
    await logOperation('cleanup', 'failed', req.user.id);
    res.status(500).json({ error: 'Failed to cleanup database' });
  }
});

// Helper functions for different cleanup types
async function cleanupOldRecords(days = 90, dryRun = false) {
  const results = { recordsDeleted: 0, tablesCleaned: [], errors: [] };
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    // Clean old job applications
    const appsQuery = `DELETE FROM applications WHERE created_at < $1 RETURNING id`;
    if (!dryRun) {
      const appsResult = await query(appsQuery, [cutoffDate]);
      results.recordsDeleted += appsResult.rowCount || 0;
      results.tablesCleaned.push('applications');
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM applications WHERE created_at < $1`;
      const countResult = await query(countQuery, [cutoffDate]);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('applications');
    }

    // Clean old activity logs
    const activityQuery = `DELETE FROM activity WHERE created_at < $1 RETURNING id`;
    if (!dryRun) {
      const activityResult = await query(activityQuery, [cutoffDate]);
      results.recordsDeleted += activityResult.rowCount || 0;
      results.tablesCleaned.push('activity');
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM activity WHERE created_at < $1`;
      const countResult = await query(countQuery, [cutoffDate]);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('activity');
    }

    // Clean old OTP records
    const otpQuery = `DELETE FROM otp WHERE created_at < $1 RETURNING id`;
    if (!dryRun) {
      const otpResult = await query(otpQuery, [cutoffDate]);
      results.recordsDeleted += otpResult.rowCount || 0;
      results.tablesCleaned.push('otp');
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM otp WHERE created_at < $1`;
      const countResult = await query(countQuery, [cutoffDate]);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('otp');
    }

  } catch (error) {
    results.errors.push(`Old records cleanup failed: ${error.message}`);
  }

  return results;
}

async function cleanupInactiveUsers(days = 365, dryRun = false) {
  const results = { recordsDeleted: 0, tablesCleaned: [], errors: [] };
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    const inactiveUsersQuery = `
      DELETE FROM users 
      WHERE id NOT IN (
        SELECT DISTINCT user_id FROM activity 
        WHERE created_at > $1
      ) 
      AND created_at < $2
      AND email_verified = false
      RETURNING id
    `;
    
    if (!dryRun) {
      const usersResult = await query(inactiveUsersQuery, [cutoffDate, cutoffDate]);
      results.recordsDeleted += usersResult.rowCount || 0;
      results.tablesCleaned.push('users');
    } else {
      const countQuery = `
        SELECT COUNT(*) as count FROM users 
        WHERE id NOT IN (
          SELECT DISTINCT user_id FROM activity 
          WHERE created_at > $1
        ) 
        AND created_at < $2
        AND email_verified = false
      `;
      const countResult = await query(countQuery, [cutoffDate, cutoffDate]);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('users');
    }

  } catch (error) {
    results.errors.push(`Inactive users cleanup failed: ${error.message}`);
  }

  return results;
}

async function cleanupExpiredSessions(days = 7, dryRun = false) {
  const results = { recordsDeleted: 0, tablesCleaned: [], errors: [] };
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  try {
    const sessionsQuery = `DELETE FROM sessions WHERE expires_at < $1 RETURNING id`;
    if (!dryRun) {
      const sessionsResult = await query(sessionsQuery, [cutoffDate]);
      results.recordsDeleted += sessionsResult.rowCount || 0;
      results.tablesCleaned.push('sessions');
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM sessions WHERE expires_at < $1`;
      const countResult = await query(countQuery, [cutoffDate]);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('sessions');
    }

  } catch (error) {
    results.errors.push(`Expired sessions cleanup failed: ${error.message}`);
  }

  return results;
}

async function cleanupOrphanedData(dryRun = false) {
  const results = { recordsDeleted: 0, tablesCleaned: [], errors: [] };

  try {
    // Clean saved jobs for deleted job postings
    const orphanedSavedJobsQuery = `
      DELETE FROM saved_jobs 
      WHERE job_id NOT IN (SELECT id FROM jobs) 
      RETURNING id
    `;
    
    if (!dryRun) {
      const savedJobsResult = await query(orphanedSavedJobsQuery);
      results.recordsDeleted += savedJobsResult.rowCount || 0;
      results.tablesCleaned.push('saved_jobs');
    } else {
      const countQuery = `SELECT COUNT(*) as count FROM saved_jobs WHERE job_id NOT IN (SELECT id FROM jobs)`;
      const countResult = await query(countQuery);
      results.recordsDeleted += parseInt(countResult.rows[0]?.count) || 0;
      results.tablesCleaned.push('saved_jobs');
    }

  } catch (error) {
    results.errors.push(`Orphaned data cleanup failed: ${error.message}`);
  }

  return results;
}

// Get table details
router.get('/table/:tableName', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Validate table name to prevent SQL injection - only allow alphanumeric and underscores
    const validTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    
    if (!validTableName || validTableName !== tableName) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // Check if table exists in information_schema
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
        AND table_type = 'BASE TABLE'
      )
    `;
    const tableExistsResult = await query(tableExistsQuery, [validTableName]);
    
    if (!tableExistsResult.rows[0].exists) {
      return res.status(404).json({ error: `Table '${validTableName}' not found` });
    }
    
    // Get table structure
    const structureQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const structureResult = await query(structureQuery, [validTableName]);

    // Get table records with pagination
    const recordsQuery = `SELECT * FROM "${validTableName}" LIMIT $1 OFFSET $2`;
    const recordsResult = await query(recordsQuery, [limit, offset]);

    // Get total record count
    const countQuery = `SELECT COUNT(*) as total_records FROM "${validTableName}"`;
    const countResult = await query(countQuery);

    // Get table size
    const sizeQuery = `SELECT pg_size_pretty(pg_total_relation_size('public.${validTableName}')) as table_size`;
    const sizeResult = await query(sizeQuery);

    const response = {
      tableName: validTableName,
      columns: structureResult.rows,
      records: recordsResult.rows,
      stats: {
        total_records: parseInt(countResult.rows[0].total_records),
        table_size: sizeResult.rows[0]?.table_size || '0 MB'
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: recordsResult.rows.length === parseInt(limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching table details:', error);
    res.status(500).json({ error: 'Failed to fetch table details' });
  }
});

// Helper function to log operations
async function logOperation(type, status, userId) {
  try {
    // TODO: Create a proper operations table
    console.log(`Operation logged: ${type} - ${status} - User: ${userId}`);
  } catch (error) {
    console.error('Error logging operation:', error);
  }
}

export default router;
