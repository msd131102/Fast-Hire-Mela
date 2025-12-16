import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Database connection pool optimized for 2000+ concurrent users
const pool = new Pool({
  // Use DATABASE_URL if provided (for Supabase), otherwise use individual variables
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  
  // Force IPv4 connection to prevent ENETUNREACH errors
  family: 4, // Force IPv4 instead of IPv6
  
  // High concurrency settings
  max: 100, // Increased max connections for 2000+ users
  min: 10, // Minimum connections to maintain
  idleTimeoutMillis: 10000, // Shorter idle timeout for better resource management
  
  // Connection management
  connectionTimeoutMillis: 10000, // Increased timeout for better reliability
  query_timeout: 15000, // Shorter query timeout for better responsiveness
  
  // Performance optimizations
  statement_timeout: 30000, // Prevent long-running queries
  allowExitOnIdle: false, // Keep connections alive
  
  // Connection retry settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  
  // Application name for monitoring
  application_name: 'fasthiremela_high_concurrency'
});

// Enhanced connection event handlers with better diagnostics
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database (High Concurrency Mode - IPv4 Forced)');
  console.log('🔗 Connection details:', {
    host: client.host,
    port: client.port,
    database: client.database,
    user: client.user
  });
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', {
    message: err.message,
    code: err.code,
    severity: err.severity,
    detail: err.detail,
    hint: err.hint,
    where: err.where,
    timestamp: new Date().toISOString()
  });
  
  // Don't exit immediately on network errors, allow retry mechanism
  if (err.code === 'ENETUNREACH' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    console.warn('⚠️ Network-related error detected, retry mechanism will handle this');
  } else {
    // For critical database errors, exit after a delay
    console.error('💥 Critical database error, shutting down in 5 seconds...');
    setTimeout(() => process.exit(-1), 5000);
  }
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});

pool.on('acquire', () => {
  console.log('🤝 Database connection acquired from pool');
});

// Helper function to execute queries with retry logic
export const query = async (text, params, maxRetries = 3) => {
  const start = Date.now();
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Only log slow queries in production for performance monitoring
      if (process.env.NODE_ENV === 'production' && duration > 100) {
        console.log('📊 Slow query detected', { text, duration, rows: res.rowCount });
      }
      
      // Log successful retry if applicable
      if (attempt > 1) {
        console.log(`✅ Query succeeded on attempt ${attempt}`);
      }
      
      return res;
    } catch (error) {
      lastError = error;
      
      // Log retry attempt with error details
      console.error(`❌ Query attempt ${attempt} failed:`, {
        error: error.message,
        code: error.code,
        severity: error.severity,
        detail: error.detail
      });
      
      // Check if error is retryable (network-related)
      const isRetryable = error.code === 'ENETUNREACH' || 
                         error.code === 'ECONNRESET' || 
                         error.code === 'ETIMEDOUT' ||
                         error.code === 'ECONNREFUSED' ||
                         error.severity === '08' || // Connection exceptions
                         error.severity === '53';   // Insufficient resources
      
      // Don't retry on non-retryable errors
      if (!isRetryable || attempt === maxRetries) {
        console.error('❌ Query failed permanently:', error);
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s between retries
      const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`🔄 Retrying query in ${backoffDelay}ms... (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
};

// Helper function to execute transactions
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database tables - using comprehensive schema
export const initializeDatabase = async () => {
  try {
    // Enable required extensions
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // Check if database is already initialized by checking for key tables
    const tablesCheck = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('app_users', 'companies', 'categories', 'jobs')
    `);
    
    if (parseInt(tablesCheck.rows[0].count) >= 3) {
      console.log('✅ Database already initialized, skipping schema creation');
      return;
    }

    // Import and execute the complete schema
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const schemaFilename = fileURLToPath(import.meta.url);
    const schemaDirname = path.dirname(schemaFilename);
    const schemaPath = path.join(schemaDirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await query(schemaSQL);
      console.log('✅ Complete database schema initialized successfully');
    } else {
      console.warn('⚠️ Schema file not found, using basic initialization');
      await initializeBasicTables();
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Fallback basic initialization for backward compatibility
const initializeBasicTables = async () => {
  // Basic table creation as fallback
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      color VARCHAR(7) DEFAULT '#3B82F6',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add other basic tables as needed...
  console.log('✅ Basic database tables initialized');
};

// Enhanced test database connection and initialize tables
export const testConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connectivity with detailed error handling
    const result = await query('SELECT NOW() as current_time, version() as version, current_database() as database');
    console.log('✅ Database connection test successful:', result.rows[0]);
    
    // Test pool stats
    const stats = getPoolStats();
    console.log('📊 Connection pool statistics:', stats);
    
    // Initialize database schema
    await initializeDatabase();
    
    console.log('🎉 Database is fully operational!');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', {
      message: error.message,
      code: error.code,
      severity: error.severity,
      timestamp: new Date().toISOString(),
      connectionString: process.env.DATABASE_URL ? 'CONFIGURED' : 'MISSING',
      host: process.env.DB_HOST || 'NOT_SET',
      port: process.env.DB_PORT || 'NOT_SET',
      database: process.env.DB_NAME || 'NOT_SET'
    });
    
    // Provide troubleshooting suggestions
    if (error.code === 'ENETUNREACH') {
      console.error('🔧 Troubleshooting ENETUNREACH:');
      console.error('   1. Check internet connection');
      console.error('   2. Verify Supabase is accessible');
      console.error('   3. Check firewall settings');
      console.error('   4. Try using a different network');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Troubleshooting ECONNREFUSED:');
      console.error('   1. Verify database credentials');
      console.error('   2. Check if Supabase is running');
      console.error('   3. Verify port 5432 is accessible');
    }
    
    return false;
  }
};

// Close all connections
export const closePool = async () => {
  await pool.end();
  console.log('🔒 Database connection pool closed');
};

// Get pool stats for monitoring
export const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
};

export default pool;
