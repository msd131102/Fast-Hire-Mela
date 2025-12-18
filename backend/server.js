import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import PostgreSQL database
import pool, { query, initializeDatabase } from './config/database.js';

// Import custom middleware
import { apiLimiter, strictLimiter, premiumUserLimiter, freeUserLimiter, adminLimiter } from './middleware/rateLimiter.js';
import { sessionTracker, concurrentSessionLimiter } from './middleware/sessionTracker.js';
import { performanceMonitor } from './middleware/performanceMonitor.js';

// Import routes
import authRoutes from './routes/auth.js';
import oauthCallbackRoutes from './routes/oauth-callback.js';
import jobsRoutes from './routes/jobs.js';
import categoriesRoutes from './routes/categories.js';
import companiesRoutes from './routes/companies.js';
import usersRoutes from './routes/users.js';
import applicationsRoutes from './routes/applications.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import locationsRoutes from './routes/locations.js';
import pagesRoutes from './routes/pages.js';
import seoRoutes from './routes/seo.js';
import mediaRoutes from './routes/media.js';
import faqsRoutes from './routes/faqs.js';
import contactsRoutes from './routes/contacts.js';
import adminJobsRoutes from './routes/admin-jobs.js';
import adminApplicationsRoutes from './routes/admin-applications.js';
import adminPaymentsRoutes from './routes/admin-payments.js';
import adminCategoriesRoutes from './routes/admin-categories.js';
import adminContactsRoutes from './routes/admin-contacts.js';
import adminSettingsRoutes from './routes/admin-settings.js';
import databaseRoutes from './routes/database.js';
import otpRoutes from './routes/otp.js';
import sessionsRoutes from './routes/sessions.js';
import referralRoutes from './routes/referrals.js';
import errorRoutes from './routes/errors.js';
import oauthBridgeRoutes from './routes/oauth-bridge.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure for high concurrency
app.set('trust proxy', 1); // Trust first proxy for load balancers
app.set('etag', 'strong'); // Enable strong ETags for caching

// Increase connection limits for high concurrency
process.env.UV_THREADPOOL_SIZE = 128; // Increase Node.js thread pool

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'https://fasthiremelafrontend.netlify.app', 
    'https://empirical-lucinda-shiva1311-40c75dd1.koyeb.app/api',
    'https://www.fasthiremela.online',
    'https://fasthiremeladmin.netlify.app',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL2,
    process.env.ADMIN_URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'cache-control']
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware
app.use(performanceMonitor);

// Session tracking middleware
app.use(sessionTracker);

// Rate limiting disabled for unlimited access
console.log('🚀 Rate limiting disabled - running without limits');


// Serve static files with proper headers for images
app.use('/uploads', (req, res, next) => {
  express.static(join(__dirname, 'uploads'))(req, res, next);
});

// Database middleware - make database available to all routes
app.use((req, res, next) => {
  req.db = { query, pool };
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    concurrency: {
      maxConnections: 100,
      threadPoolSize: process.env.UV_THREADPOOL_SIZE || 128
    }
  });
});


// Performance monitoring endpoint for 2000+ users
app.get('/api/stats', async (req, res) => {
  try {
    const { getPoolStats } = await import('./config/database.js');
    const poolStats = getPoolStats();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: poolStats,
      concurrency: {
        maxConnections: 100,
        minConnections: 10,
        threadPoolSize: process.env.UV_THREADPOOL_SIZE || 128
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthCallbackRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/jobs', adminJobsRoutes);
app.use('/api/admin/applications', adminApplicationsRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/contact', adminContactsRoutes);
app.use('/api/admin/database', databaseRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/contact', contactsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/errors', errorRoutes);
app.use('/api/oauth-bridge', oauthBridgeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 FastHireMela Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Helper function to check if user is premium
async function checkUserPremium(userId) {
  try {
    const result = await query(
      'SELECT is_premium, premium_expiry FROM app_users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      return user.is_premium && user.premium_expiry && new Date(user.premium_expiry) > new Date();
    }
    return false;
  } catch (error) {
    console.error('Error checking user premium status:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

export default app;
