import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate date from days ago
const getPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - parseInt(days));
  return date;
};

// Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    const pastDate = getPastDate(period);

    // Run aggregate queries concurrently
    const [
      totalJobsRes,
      activeJobsRes,
      totalUsersRes,
      premiumUsersRes,
      totalApplicationsRes,
      totalViewsRes,
      recentJobsRes,
      recentApplicationsRes,
      recentViewsRes,
      recentUsersRes,
      topCategoriesRes,
      topCompaniesRes,
      mostViewedJobsRes,
      mostAppliedJobsRes,
      dailyJobsRes,
      dailyApplicationsRes,
      dailyViewsRes
    ] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM jobs`),
      query(`SELECT COUNT(*) as count FROM jobs WHERE is_active = true`),
      query(`SELECT COUNT(*) as count FROM app_users`),
      query(`SELECT COUNT(*) as count FROM premium_subscriptions WHERE is_active = true AND expires_at > CURRENT_TIMESTAMP`),
      query(`SELECT COUNT(*) as count FROM job_applications`),
      query(`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'job_view'`),
      query(`SELECT COUNT(*) as count FROM jobs WHERE posted_date >= $1`, [pastDate]),
      query(`SELECT COUNT(*) as count FROM job_applications WHERE applied_at >= $1`, [pastDate]),
      query(`SELECT COUNT(*) as count FROM analytics WHERE event_type = 'job_view' AND created_at >= $1`, [pastDate]),
      query(`SELECT COUNT(*) as count FROM app_users WHERE created_at >= $1`, [pastDate]),

      // Top categories
      query(`
        SELECT c.name, COUNT(j.id) as job_count
        FROM categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
        GROUP BY c.id
        ORDER BY job_count DESC
        LIMIT 10
      `),

      // Top companies
      query(`
        SELECT comp.name as company_name, COUNT(j.id) as job_count
        FROM companies comp
        LEFT JOIN jobs j ON comp.id = j.company_id AND j.is_active = true
        GROUP BY comp.id
        ORDER BY job_count DESC
        LIMIT 10
      `),

      // Most viewed jobs
      query(`
        SELECT j.id, j.title, comp.name as company_name, COUNT(a.id) as view_count
        FROM jobs j
        LEFT JOIN companies comp ON j.company_id = comp.id
        LEFT JOIN analytics a ON j.id = a.job_id AND a.event_type = 'job_view'
        WHERE j.is_active = true
        GROUP BY j.id, comp.name
        ORDER BY view_count DESC
        LIMIT 10
      `),

      // Most applied jobs
      query(`
        SELECT j.id, j.title, comp.name as company_name, COUNT(ja.id) as application_count
        FROM jobs j
        LEFT JOIN companies comp ON j.company_id = comp.id
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        WHERE j.is_active = true
        GROUP BY j.id, comp.name
        ORDER BY application_count DESC
        LIMIT 10
      `),

      // Daily charts
      query(`
        SELECT DATE(posted_date) as date, COUNT(*)::int as count
        FROM jobs
        WHERE posted_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY DATE(posted_date)
        ORDER BY date ASC
      `),
      
      query(`
        SELECT DATE(applied_at) as date, COUNT(*)::int as count
        FROM job_applications
        WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY DATE(applied_at)
        ORDER BY date ASC
      `),

      query(`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM analytics
        WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_jobs: parseInt(totalJobsRes.rows[0].count),
          active_jobs: parseInt(activeJobsRes.rows[0].count),
          total_users: parseInt(totalUsersRes.rows[0].count),
          premium_users: parseInt(premiumUsersRes.rows[0].count),
          total_applications: parseInt(totalApplicationsRes.rows[0].count),
          total_views: parseInt(totalViewsRes.rows[0].count)
        },
        recent_activity: {
          recent_jobs: parseInt(recentJobsRes.rows[0].count),
          recent_applications: parseInt(recentApplicationsRes.rows[0].count),
          recent_views: parseInt(recentViewsRes.rows[0].count),
          recent_users: parseInt(recentUsersRes.rows[0].count)
        },
        top_categories: topCategoriesRes.rows,
        top_companies: topCompaniesRes.rows,
        most_viewed_jobs: mostViewedJobsRes.rows,
        most_applied_jobs: mostAppliedJobsRes.rows,
        charts: {
          daily_jobs: dailyJobsRes.rows,
          daily_applications: dailyApplicationsRes.rows,
          daily_views: dailyViewsRes.rows
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track job view (public endpoint)
router.post('/track-view', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    await query(
      `INSERT INTO analytics 
       (event_type, job_id, user_id, ip_address, user_agent, metadata) 
       VALUES ('job_view', $1, $2, $3, $4, $5)`,
      [
        job_id ? parseInt(job_id) : null,
        user_id ? parseInt(user_id) : null,
        ip_address,
        user_agent,
        JSON.stringify({ referrer })
      ]
    );

    res.json({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track job application click (public endpoint)
router.post('/track-application', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    const jobRes = await query(`SELECT id FROM jobs WHERE id = $1 AND is_active = true`, [parseInt(job_id)]);

    if (jobRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    // We track application intent in job_applications temporarily
    await query(
      `INSERT INTO job_applications 
       (job_id, user_id, ip_address, user_agent, referrer, full_name, email) 
       VALUES ($1, $2, $3, $4, $5, 'Anonymous', 'anonymous@example.com')`,
      [
        parseInt(job_id),
        user_id ? parseInt(user_id) : null,
        ip_address,
        user_agent,
        referrer
      ]
    );

    res.json({ success: true, message: 'Application tracked successfully' });
  } catch (error) {
    console.error('Track application error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get job analytics (admin only)
router.get('/jobs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);

    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);

    if (jobRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const job = jobRes.rows[0];

    // View analytics
    const viewAnalyticsRes = await query(`
      SELECT
        COUNT(*)::int as total_views,
        COUNT(DISTINCT ip_address)::int as unique_views,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::int as registered_user_views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view'
    `, [jobId]);

    // Application analytics
    const applicationAnalyticsRes = await query(`
      SELECT 
        COUNT(*)::int as total_applications,
        COUNT(DISTINCT ip_address)::int as unique_applications,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::int as registered_user_applications
      FROM job_applications
      WHERE job_id = $1
    `, [jobId]);

    // Daily views
    const dailyViewsRes = await query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [jobId]);

    // Daily applications
    const dailyApplicationsRes = await query(`
      SELECT DATE(applied_at) as date, COUNT(*)::int as applications
      FROM job_applications
      WHERE job_id = $1 AND applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `, [jobId]);

    res.json({
      success: true,
      data: {
        job: job,
        view_analytics: viewAnalyticsRes.rows[0],
        application_analytics: applicationAnalyticsRes.rows[0],
        daily_views: dailyViewsRes.rows,
        daily_applications: dailyApplicationsRes.rows
      }
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
