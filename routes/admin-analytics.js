import express from 'express';

const router = express.Router();

// Dashboard analytics endpoint (admin middleware already applied in admin.js)
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days

    // Get total jobs count
    const totalJobsQuery = 'SELECT COUNT(*) as count FROM jobs';
    const totalJobsResult = await req.db.query(totalJobsQuery);
    const totalJobs = parseInt(totalJobsResult.rows[0].count);

    // Get active jobs count
    const activeJobsQuery = 'SELECT COUNT(*) as count FROM jobs WHERE is_active = true';
    const activeJobsResult = await req.db.query(activeJobsQuery);
    const activeJobs = parseInt(activeJobsResult.rows[0].count);

    // Get total users count
    const totalUsersQuery = 'SELECT COUNT(*) as count FROM app_users';
    const totalUsersResult = await req.db.query(totalUsersQuery);
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get premium users count
    const premiumUsersQuery = 'SELECT COUNT(*) as count FROM app_users WHERE is_premium = true AND premium_expiry > CURRENT_TIMESTAMP';
    const premiumUsersResult = await req.db.query(premiumUsersQuery);
    const premiumUsers = parseInt(premiumUsersResult.rows[0].count);

    // Get total applications (clicks on apply)
    const totalApplicationsQuery = 'SELECT COUNT(*) as count FROM job_applications';
    const totalApplicationsResult = await req.db.query(totalApplicationsQuery);
    const totalApplications = parseInt(totalApplicationsResult.rows[0].count);

    // Get total job views (using analytics table)
    const totalViewsQuery = "SELECT COUNT(*) as count FROM analytics WHERE event_type = 'job_view'";
    const totalViewsResult = await req.db.query(totalViewsQuery);
    const totalViews = parseInt(totalViewsResult.rows[0].count);

    // Get jobs posted in the period
    const recentJobsQuery = `
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE posted_date >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentJobsResult = await req.db.query(recentJobsQuery);
    const recentJobs = parseInt(recentJobsResult.rows[0].count);

    // Get applications in the period
    const recentApplicationsQuery = `
      SELECT COUNT(*) as count 
      FROM job_applications 
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentApplicationsResult = await req.db.query(recentApplicationsQuery);
    const recentApplications = parseInt(recentApplicationsResult.rows[0].count);

    // Get views in the period (using analytics table)
    const recentViewsQuery = `
      SELECT COUNT(*) as count
      FROM analytics
      WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days'
    `;
    const recentViewsResult = await req.db.query(recentViewsQuery);
    const recentViews = parseInt(recentViewsResult.rows[0].count);

    // Get top categories by job count
    const topCategoriesQuery = `
      SELECT c.name, COUNT(j.id) as job_count
      FROM categories c
      LEFT JOIN jobs j ON c.id = j.category_id AND j.is_active = true
      GROUP BY c.id, c.name
      ORDER BY job_count DESC
      LIMIT 10
    `;
    const topCategoriesResult = await req.db.query(topCategoriesQuery);

    // Get top companies by job count
    const topCompaniesQuery = `
      SELECT c.name as company_name, COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = true
      GROUP BY c.id, c.name
      ORDER BY job_count DESC
      LIMIT 10
    `;
    const topCompaniesResult = await req.db.query(topCompaniesQuery);

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
    const mostViewedJobsResult = await req.db.query(mostViewedJobsQuery);

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
    const mostAppliedJobsResult = await req.db.query(mostAppliedJobsQuery);

    // Get monthly statistics for the last 12 months
    const monthlyStatsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM analytics
      WHERE event_type = 'job_view' 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    const monthlyStatsResult = await req.db.query(monthlyStatsQuery);

    // Get application trends
    const applicationTrendsQuery = `
      SELECT 
        DATE_TRUNC('month', applied_at) as month,
        COUNT(*) as count
      FROM job_applications
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', applied_at)
      ORDER BY month DESC
    `;
    const applicationTrendsResult = await req.db.query(applicationTrendsQuery);

    res.json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: {
        overview: {
          totalJobs,
          activeJobs,
          totalUsers,
          premiumUsers,
          totalApplications,
          totalViews
        },
        periodStats: {
          period: parseInt(period),
          recentJobs,
          recentApplications,
          recentViews
        },
        topCategories: topCategoriesResult.rows,
        topCompanies: topCompaniesResult.rows,
        mostViewedJobs: mostViewedJobsResult.rows,
        mostAppliedJobs: mostAppliedJobsResult.rows,
        monthlyStats: monthlyStatsResult.rows,
        applicationTrends: applicationTrendsResult.rows
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
