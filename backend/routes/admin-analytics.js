import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Helper to calculate date from days ago
const getPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - parseInt(days));
  return date;
};

// Dashboard analytics endpoint (admin middleware already applied in admin.js)
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    const pastDate = getPastDate(period);

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
      topCategoriesRes,
      topCompaniesRes,
      mostViewedJobsRes,
      mostAppliedJobsRes,
      monthlyStatsRes,
      applicationTrendsRes
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

      // Monthly views trends
      query(`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*)::int as count
        FROM analytics
        WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `),
      
      // Application trends
      query(`
        SELECT DATE_TRUNC('month', applied_at) as month, COUNT(*)::int as count
        FROM job_applications
        WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', applied_at)
        ORDER BY month DESC
      `)
    ]);

    res.json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: {
        overview: {
          totalJobs: parseInt(totalJobsRes.rows[0].count),
          activeJobs: parseInt(activeJobsRes.rows[0].count),
          totalUsers: parseInt(totalUsersRes.rows[0].count),
          premiumUsers: parseInt(premiumUsersRes.rows[0].count),
          totalApplications: parseInt(totalApplicationsRes.rows[0].count),
          totalViews: parseInt(totalViewsRes.rows[0].count)
        },
        periodStats: {
          period: parseInt(period),
          recentJobs: parseInt(recentJobsRes.rows[0].count),
          recentApplications: parseInt(recentApplicationsRes.rows[0].count),
          recentViews: parseInt(recentViewsRes.rows[0].count)
        },
        topCategories: topCategoriesRes.rows,
        topCompanies: topCompaniesRes.rows,
        mostViewedJobs: mostViewedJobsRes.rows,
        mostAppliedJobs: mostAppliedJobsRes.rows,
        monthlyStats: monthlyStatsRes.rows,
        applicationTrends: applicationTrendsRes.rows
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching dashboard analytics'
    });
  }
});

export default router;
