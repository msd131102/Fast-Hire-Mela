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
  
  // High concurrency settings
  max: 100, // Increased max connections for 2000+ users
  min: 10, // Minimum connections to maintain
  idleTimeoutMillis: 10000, // Shorter idle timeout for better resource management
  
  // Connection management
  connectionTimeoutMillis: 5000, // Faster connection timeout
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

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database (High Concurrency Mode)');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Only log slow queries in production for performance monitoring
    if (process.env.NODE_ENV === 'production' && duration > 100) {
      console.log('📊 Slow query detected', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
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

// Test database connection and initialize tables
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
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
