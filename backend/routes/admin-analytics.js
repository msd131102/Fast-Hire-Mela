import express from 'express';
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;

const prisma = new PrismaClient();
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
      totalJobs,
      activeJobs,
      totalUsers,
      premiumUsers,
      totalApplications,
      totalViews,
      recentJobs,
      recentApplications,
      recentViews
    ] = await Promise.all([
      prisma.jobs.count(),
      prisma.jobs.count({ where: { is_active: true } }),
      prisma.app_users.count(),
      prisma.premium_subscriptions.count({ where: { is_active: true, expires_at: { gt: new Date() } } }),
      prisma.job_applications.count(),
      prisma.analytics.count({ where: { event_type: 'job_view' } }),
      prisma.jobs.count({ where: { posted_date: { gte: pastDate } } }),
      prisma.job_applications.count({ where: { applied_at: { gte: pastDate } } }),
      prisma.analytics.count({ where: { event_type: 'job_view', created_at: { gte: pastDate } } })
    ]);

    // Top categories
    const categories = await prisma.categories.findMany({
      include: { _count: { select: { jobs: { where: { is_active: true } } } } }
    });
    const topCategories = categories.sort((a, b) => b._count.jobs - a._count.jobs).slice(0, 10).map(c => ({
      name: c.name, job_count: c._count.jobs
    }));

    // Top companies
    const companies = await prisma.companies.findMany({
      include: { _count: { select: { jobs: { where: { is_active: true } } } } }
    });
    const topCompanies = companies.sort((a, b) => b._count.jobs - a._count.jobs).slice(0, 10).map(c => ({
      company_name: c.name, job_count: c._count.jobs
    }));

    // Most viewed jobs
    const jobsWithViews = await prisma.jobs.findMany({
      where: { is_active: true },
      include: { companies: true, _count: { select: { analytics: { where: { event_type: 'job_view' } } } } }
    });
    const mostViewedJobs = jobsWithViews.sort((a, b) => b._count.analytics - a._count.analytics).slice(0, 10).map(j => ({
      id: j.id, title: j.title, company_name: j.companies?.name, view_count: j._count.analytics
    }));

    // Most applied jobs
    const jobsWithApps = await prisma.jobs.findMany({
      where: { is_active: true },
      include: { companies: true, _count: { select: { job_applications: true } } }
    });
    const mostAppliedJobs = jobsWithApps.sort((a, b) => b._count.job_applications - a._count.job_applications).slice(0, 10).map(j => ({
      id: j.id, title: j.title, company_name: j.companies?.name, application_count: j._count.job_applications
    }));

    // Monthly views trends
    const monthlyStatsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*)::int as count
      FROM analytics
      WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);
    
    // Application trends
    const applicationTrendsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE_TRUNC('month', applied_at) as month, COUNT(*)::int as count
      FROM job_applications
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', applied_at)
      ORDER BY month DESC
    `);

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
        topCategories: topCategories,
        topCompanies: topCompanies,
        mostViewedJobs: mostViewedJobs,
        mostAppliedJobs: mostAppliedJobs,
        monthlyStats: monthlyStatsQuery,
        applicationTrends: applicationTrendsQuery
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
