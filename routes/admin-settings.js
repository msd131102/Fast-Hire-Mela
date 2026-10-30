import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all admin settings in the nested structure expected by frontend
router.get('/', async (req, res) => {
  try {
    console.log('🔧 ADMIN SETTINGS ROUTE HIT!');
    const result = await query(
      'SELECT * FROM settings ORDER BY key'
    );

    // Transform flat settings to nested structure expected by frontend
    const settings = {
      site: {
        name: 'Fast Hire Mela',
        description: 'Find your dream job instantly',
        logo: '',
        favicon: '',
        contactEmail: 'admin@fasthiremela.com',
        supportPhone: '+1-555-0123',
        address: '123 Business St, City, State 12345'
      },
      features: {
        jobApplications: true,
        jobAlerts: true,
        premiumFeatures: true,
        socialLogin: true,
        whatsappNotifications: true,
        emailNotifications: true
      },
      limits: {
        freeJobPosts: 3,
        premiumJobPosts: 50,
        maxFileSize: 5,
        sessionTimeout: 24
      },
      payment: {
        currency: 'USD',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        trialDays: 7
      },
      seo: {
        metaTitle: 'Fast Hire Mela - Find Jobs Instantly',
        metaDescription: 'Discover thousands of job opportunities and advance your career',
        keywords: 'jobs, careers, employment, hiring, recruitment',
        ogImage: ''
      }
    };

    // Override defaults with values from database
    result.rows.forEach(row => {
      const value = row.value;
      
      // Parse JSON values if they're stored as JSON strings
      let parsedValue = value;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // Keep as string if not valid JSON
      }

      // Map database keys to nested structure
      if (row.key.startsWith('site_')) {
        const key = row.key.replace('site_', '');
        if (key === 'name') settings.site.name = value;
        else if (key === 'description') settings.site.description = value;
        else if (key === 'logo') settings.site.logo = value;
        else if (key === 'favicon') settings.site.favicon = value;
        else if (key === 'contact_email') settings.site.contactEmail = value;
        else if (key === 'support_phone') settings.site.supportPhone = value;
        else if (key === 'address') settings.site.address = value;
      } else if (row.key.startsWith('features_')) {
        const key = row.key.replace('features_', '');
        if (key === 'job_applications') settings.features.jobApplications = value === 'true';
        else if (key === 'job_alerts') settings.features.jobAlerts = value === 'true';
        else if (key === 'premium_features') settings.features.premiumFeatures = value === 'true';
        else if (key === 'social_login') settings.features.socialLogin = value === 'true';
        else if (key === 'whatsapp_notifications') settings.features.whatsappNotifications = value === 'true';
        else if (key === 'email_notifications') settings.features.emailNotifications = value === 'true';
      } else if (row.key.startsWith('limits_')) {
        const key = row.key.replace('limits_', '');
        if (key === 'free_job_posts') settings.limits.freeJobPosts = parseInt(value) || 3;
        else if (key === 'premium_job_posts') settings.limits.premiumJobPosts = parseInt(value) || 50;
        else if (key === 'max_file_size') settings.limits.maxFileSize = parseInt(value) || 5;
        else if (key === 'session_timeout') settings.limits.sessionTimeout = parseInt(value) || 24;
      } else if (row.key.startsWith('payment_')) {
        const key = row.key.replace('payment_', '');
        if (key === 'currency') settings.payment.currency = value;
        else if (key === 'monthly_price') settings.payment.monthlyPrice = parseFloat(value) || 9.99;
        else if (key === 'yearly_price') settings.payment.yearlyPrice = parseFloat(value) || 99.99;
        else if (key === 'trial_days') settings.payment.trialDays = parseInt(value) || 7;
      } else if (row.key.startsWith('seo_')) {
        const key = row.key.replace('seo_', '');
        if (key === 'meta_title') settings.seo.metaTitle = value;
        else if (key === 'meta_description') settings.seo.metaDescription = value;
        else if (key === 'keywords') settings.seo.keywords = value;
        else if (key === 'og_image') settings.seo.ogImage = value;
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update all admin settings (PUT request with nested structure)
router.put('/', async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    const updates = [];

    // Process site settings
    if (settings.site) {
      for (const [key, value] of Object.entries(settings.site)) {
        const dbKey = `site_${key}`;
        updates.push({
          key: dbKey,
          value: String(value),
          description: `Site ${key} setting`,
          is_public: ['name', 'description'].includes(key)
        });
      }
    }

    // Process features settings
    if (settings.features) {
      for (const [key, value] of Object.entries(settings.features)) {
        const dbKey = `features_${key}`;
        updates.push({
          key: dbKey,
          value: String(value),
          description: `Feature toggle for ${key}`,
          is_public: false
        });
      }
    }

    // Process limits settings
    if (settings.limits) {
      for (const [key, value] of Object.entries(settings.limits)) {
        const dbKey = `limits_${key}`;
        updates.push({
          key: dbKey,
          value: String(value),
          description: `Limit setting for ${key}`,
          is_public: false
        });
      }
    }

    // Process payment settings
    if (settings.payment) {
      for (const [key, value] of Object.entries(settings.payment)) {
        const dbKey = `payment_${key}`;
        updates.push({
          key: dbKey,
          value: String(value),
          description: `Payment setting for ${key}`,
          is_public: false
        });
      }
    }

    // Process SEO settings
    if (settings.seo) {
      for (const [key, value] of Object.entries(settings.seo)) {
        const dbKey = `seo_${key}`;
        updates.push({
          key: dbKey,
          value: String(value),
          description: `SEO setting for ${key}`,
          is_public: true
        });
      }
    }

    // Update each setting in the database
    for (const update of updates) {
      // Check if setting exists
      const existingResult = await query(
        'SELECT id FROM settings WHERE key = $1',
        [update.key]
      );

      if (existingResult.rows.length > 0) {
        // Update existing setting
        await query(
          'UPDATE settings SET value = $1, description = $2, is_public = $3, updated_at = CURRENT_TIMESTAMP WHERE key = $4',
          [update.value, update.description, update.is_public, update.key]
        );
      } else {
        // Create new setting
        await query(
          'INSERT INTO settings (key, value, description, is_public) VALUES ($1, $2, $3, $4)',
          [update.key, update.value, update.description, update.is_public]
        );
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
