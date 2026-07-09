import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
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
      totalJobs,
      activeJobs,
      totalUsers,
      premiumUsers,
      totalApplications,
      totalViews,
      recentJobs,
      recentApplications,
      recentViews,
      recentUsers
    ] = await Promise.all([
      prisma.jobs.count(),
      prisma.jobs.count({ where: { is_active: true } }),
      prisma.app_users.count(),
      prisma.premium_subscriptions.count({ where: { is_active: true, expires_at: { gt: new Date() } } }),
      prisma.job_applications.count(),
      prisma.analytics.count({ where: { event_type: 'job_view' } }),
      prisma.jobs.count({ where: { posted_date: { gte: pastDate } } }),
      prisma.job_applications.count({ where: { applied_at: { gte: pastDate } } }),
      prisma.analytics.count({ where: { event_type: 'job_view', created_at: { gte: pastDate } } }),
      prisma.app_users.count({ where: { created_at: { gte: pastDate } } })
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

    // Daily charts (raw grouping query as Prisma lacks date_trunc without raw query)
    const dailyJobsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE(posted_date) as date, COUNT(*)::int as count
      FROM jobs
      WHERE posted_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(posted_date)
      ORDER BY date ASC
    `);
    
    const dailyApplicationsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE(applied_at) as date, COUNT(*)::int as count
      FROM job_applications
      WHERE applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `);

    const dailyViewsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM analytics
      WHERE event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

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
        top_categories: topCategories,
        top_companies: topCompanies,
        most_viewed_jobs: mostViewedJobs,
        most_applied_jobs: mostAppliedJobs,
        charts: {
          daily_jobs: dailyJobsQuery,
          daily_applications: dailyApplicationsQuery,
          daily_views: dailyViewsQuery
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

    await prisma.analytics.create({
      data: {
        event_type: 'job_view',
        job_id: job_id ? parseInt(job_id) : null,
        user_id: user_id ? parseInt(user_id) : null,
        ip_address: ip_address,
        user_agent: user_agent,
        metadata: { referrer }
      }
    });

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

    const job = await prisma.jobs.findFirst({
      where: { id: parseInt(job_id), is_active: true }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    // We track application intent in job_applications temporarily
    await prisma.job_applications.create({
      data: {
        job_id: parseInt(job_id),
        user_id: user_id ? parseInt(user_id) : null,
        ip_address: ip_address,
        user_agent: user_agent,
        referrer: referrer,
        full_name: 'Anonymous',
        email: 'anonymous@example.com'
      }
    });

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

    const job = await prisma.jobs.findUnique({ where: { id: jobId } });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // View analytics
    const viewAnalyticsRaw = await prisma.$queryRawUnsafe(`
      SELECT
        COUNT(*)::int as total_views,
        COUNT(DISTINCT ip_address)::int as unique_views,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::int as registered_user_views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view'
    `, jobId);

    // Application analytics
    const applicationAnalyticsRaw = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*)::int as total_applications,
        COUNT(DISTINCT ip_address)::int as unique_applications,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::int as registered_user_applications
      FROM job_applications
      WHERE job_id = $1
    `, jobId);

    // Daily views
    const dailyViewsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE(created_at) as date, COUNT(*)::int as views
      FROM analytics
      WHERE job_id = $1 AND event_type = 'job_view' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, jobId);

    // Daily applications
    const dailyApplicationsQuery = await prisma.$queryRawUnsafe(`
      SELECT DATE(applied_at) as date, COUNT(*)::int as applications
      FROM job_applications
      WHERE job_id = $1 AND applied_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY DATE(applied_at)
      ORDER BY date ASC
    `, jobId);

    res.json({
      success: true,
      data: {
        job: job,
        view_analytics: viewAnalyticsRaw[0],
        application_analytics: applicationAnalyticsRaw[0],
        daily_views: dailyViewsQuery,
        daily_applications: dailyApplicationsQuery
      }
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
