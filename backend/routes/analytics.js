import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days

    // Get total jobs count
    const totalJobsQuery = 'SELECT COUNT(*) as count FROM jobs';
    const totalJobsResult = await query(totalJobsQuery);
    const totalJobs = parseInt(totalJobsResult.rows[0].count);

    // Get active jobs count
    const activeJobsQuery = 'SELECT COUNT(*) as count FROM jobs WHERE is_active = true';
    const activeJobsResult = await query(activeJobsQuery);
    const activeJobs = parseInt(activeJobsResult.rows[0].count);

    // Get total users count
    const totalUsersQuery = 'SELECT COUNT(*) as count FROM app_users';
    const totalUsersResult = await query(totalUsersQuery);
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get premium users count
    const premiumUsersQuery = 'SELECT COUNT(*) as count FROM app_users WHERE is_premium = true AND premium_expiry > CURRENT_TIMESTAMP';
    const premiumUsersResult = await query(premiumUsersQuery);
    const premiumUsers = parseInt(premiumUsersResult.rows[0].count);

    // Get total applications (clicks on apply)
    const totalApplicationsQuery = 'SELECT COUNT(*) as count FROM job_applications';
    const totalApplicationsResult = await query(totalApplicationsQuery);
    const totalApplications = parseInt(totalApplicationsResult.rows[0].count);

    // Get total job views (using analytics table)
    const totalViewsQuery = "SELECT COUNT(*) as count FROM analytics WHERE event_type = 'job_view'";
    const totalViewsResult = await query(totalViewsQuery);
    const totalViews = parseInt(totalViewsResult.rows[0].count);

    // Get jobs posted in the period
    const recentJobsQuery = `
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE posted_date >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentJobsResult = await query(recentJobsQuery);
    const recentJobs = parseInt(recentJobsResult.rows[0].count);

    // Get applications in the period
    const recentApplicationsQuery = `
      SELECT COUNT(*) as count 
      FROM job_applications 
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentApplicationsResult = await query(recentApplicationsQuery);
    const recentApplications = parseInt(recentApplicationsResult.rows[0].count);

    // Get views in the period (using analytics table)
    const recentViewsQuery = `
      SELECT COUNT(*) as count
      FROM analytics
      WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentViewsResult = await query(recentViewsQuery);
    const recentViews = parseInt(recentViewsResult.rows[0].count);

    // Get users registered in the period
    const recentUsersQuery = `
      SELECT COUNT(*) as count 
      FROM app_users 
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentUsersResult = await query(recentUsersQuery);
    const recentUsers = parseInt(recentUsersResult.rows[0].count);

    // Get top categories by job count
    const topCategoriesQuery = `
      SELECT c.name, COUNT(j.id) as job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
      GROUP BY c.id, c.name
      ORDER BY job_count DESC
      LIMIT 10
    `;
    const topCategoriesResult = await query(topCategoriesQuery);

    // Get top companies by job count
    const topCompaniesQuery = `
      SELECT c.name as company_name, COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
      GROUP BY c.id, c.name
      ORDER BY job_count DESC
      LIMIT 10
    `;
    const topCompaniesResult = await query(topCompaniesQuery);

    // Get most viewed jobs (using analytics table)
    const mostViewedJobsQuery = `
      SELECT j.id, j.title, c.name as company_name, COUNT(a.id) as view_count
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN analytics a ON j.id = a.job_id AND a.event_type = 'job_view'
      WHERE j.is_active = true
      GROUP BY j.id, j.title, c.name
      ORDER BY view_count DESC
      LIMIT 10
    `;
    const mostViewedJobsResult = await query(mostViewedJobsQuery);

    // Get most applied jobs
    const mostAppliedJobsQuery = `
      SELECT j.id, j.title, c.name as company_name, COUNT(ja.id) as application_count
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      WHERE j.is_active = true
      GROUP BY j.id, j.title, c.name
      ORDER BY application_count DESC
      LIMIT 10
    `;
    const mostAppliedJobsResult = await query(mostAppliedJobsQuery);

    // Get daily job postings for the last 30 days
    const dailyJobsQuery = `
      SELECT 
        DATE(posted_date) as date,
        COUNT(*) as count
      FROM jobs
      WHERE posted_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(posted_date)
      ORDER BY date ASC
    `;
    const dailyJobsResult = await query(dailyJobsQuery);

    // Get daily applications for the last 30 days
    const dailyApplicationsQuery = `
      SELECT
        DATE(applied_at) as date,
        COUNT(*) as count
      FROM job_applications
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `;
    const dailyApplicationsResult = await query(dailyApplicationsQuery);

    // Get daily views for the last 30 days
    const dailyViewsQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM analytics
      WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const dailyViewsResult = await query(dailyViewsQuery);

    res.json({
      success: true,
      data: {
        overview: {
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          total_users: totalUsers,
          premium_users: premiumUsers,
          total_applications: totalApplications,
          total_views: totalViews
        },
        recent_activity: {
          recent_jobs: recentJobs,
          recent_applications: recentApplications,
          recent_views: recentViews,
          recent_users: recentUsers
        },
        top_categories: topCategoriesResult.rows,
        top_companies: topCompaniesResult.rows,
        most_viewed_jobs: mostViewedJobsResult.rows,
        most_applied_jobs: mostAppliedJobsResult.rows,
        charts: {
          daily_jobs: dailyJobsResult.rows,
          daily_applications: dailyApplicationsResult.rows,
          daily_views: dailyViewsResult.rows
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Track job view (public endpoint)
router.post('/track-view', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    // Insert view tracking into analytics table
    await query(
      'INSERT INTO analytics (event_type, job_id, user_id, ip_address, user_agent, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
      ['job_view', job_id, user_id || null, ip_address, user_agent, JSON.stringify({ referrer })]
    );

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Track job application (public endpoint)
router.post('/track-application', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    // Check if job exists and is active
    const jobResult = await query(
      'SELECT id FROM jobs WHERE id = $1 AND is_active = true',
      [job_id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or inactive'
      });
    }

    // Insert application tracking with minimal required fields
    await query(
      'INSERT INTO job_applications (job_id, user_id, ip_address, user_agent, referrer, full_name, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [job_id, user_id || null, ip_address, user_agent, referrer, 'Anonymous', 'anonymous@example.com']
    );

    res.json({
      success: true,
      message: 'Application tracked successfully'
    });
  } catch (error) {
    console.error('Track application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get job analytics (admin only)
router.get('/jobs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const jobId = req.params.id;

    // Get job details
    const jobResult = await query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get view analytics
    const viewAnalyticsQuery = `
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_views,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_user_views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view'
    `;
    const viewAnalyticsResult = await query(viewAnalyticsQuery, [jobId]);

    // Get application analytics
    const applicationAnalyticsQuery = `
      SELECT 
        COUNT(*) as total_applications,
        COUNT(DISTINCT ip_address) as unique_applications,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_user_applications
      FROM job_applications
      WHERE job_id = $1
    `;
    const applicationAnalyticsResult = await query(applicationAnalyticsQuery, [jobId]);

    // Get daily views for last 30 days
    const dailyViewsQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const dailyViewsResult = await query(dailyViewsQuery, [jobId]);

    // Get daily applications for last 30 days
    const dailyApplicationsQuery = `
      SELECT
        DATE(applied_at) as date,
        COUNT(*) as applications
      FROM job_applications
      WHERE job_id = $1 AND applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `;
    const dailyApplicationsResult = await query(dailyApplicationsQuery, [jobId]);

    res.json({
      success: true,
      data: {
        job: jobResult.rows[0],
        view_analytics: viewAnalyticsResult.rows[0],
        application_analytics: applicationAnalyticsResult.rows[0],
        daily_views: dailyViewsResult.rows,
        daily_applications: dailyApplicationsResult.rows
      }
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
