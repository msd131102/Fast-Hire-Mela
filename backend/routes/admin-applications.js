import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get all applications with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      job_title = '',
      company_name = '',
      date_from = '',
      date_to = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (a.full_name ILIKE $${paramIndex++} OR a.email ILIKE $${paramIndex++} OR j.title ILIKE $${paramIndex++})`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ` AND a.application_status = $${paramIndex++}`;
      queryParams.push(status);
    }

    if (job_title) {
      whereClause += ` AND j.title ILIKE $${paramIndex++}`;
      queryParams.push(`%${job_title}%`);
    }

    if (company_name) {
      whereClause += ` AND c.name ILIKE $${paramIndex++}`;
      queryParams.push(`%${company_name}%`);
    }

    if (date_from) {
      whereClause += ` AND a.applied_at >= $${paramIndex++}`;
      queryParams.push(date_from);
    }

    if (date_to) {
      whereClause += ` AND a.applied_at <= $${paramIndex++}`;
      queryParams.push(date_to);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN app_users au ON a.user_id = au.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get applications with pagination
    queryParams.push(parseInt(limit), offset);
    
    const applicationsQuery = `
      SELECT a.*,
             j.title as job_title,
             j.location as job_location,
             j.salary_min,
             j.salary_max,
             j.job_type,
             c.name as company_name,
             c.logo_url as company_logo,
             au.name as user_name,
             au.email as user_email,
             au.phone as user_phone,
             CONCAT(au.city, ', ', au.state, ', ', au.country) as user_location
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN app_users au ON a.user_id = au.id
      ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const applicationsResult = await query(applicationsQuery, queryParams);

    res.json({
      success: true,
      data: {
        applications: applicationsResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Get application by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    const applicationQuery = `
      SELECT a.*,
             j.title as job_title,
             j.description as job_description,
             j.location as job_location,
             j.salary_min,
             j.salary_max,
             j.job_type,
             j.experience_level,
             j.application_deadline,
             c.name as company_name,
             c.logo_url as company_logo,
             c.description as company_description,
             au.name as user_name,
             au.email as user_email,
             au.phone as user_phone,
             CONCAT(au.city, ', ', au.state, ', ', au.country) as user_location,
             au.resume_url as user_resume_url,
             au.experience_years as user_experience,
             au.skills as user_skills
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN app_users au ON a.user_id = au.id
      WHERE a.id = $1
    `;

    const result = await query(applicationQuery, [applicationId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details'
    });
  }
});

// Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected', 'shortlisted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await query(
      `UPDATE job_applications 
       SET application_status = $1, 
           admin_notes = $2,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $3
       WHERE id = $4
       RETURNING *`,
      [status, notes || null, req.user?.userId || null, applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Bulk update application status
router.put('/bulk-status', async (req, res) => {
  try {
    const { applicationIds, status, notes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const placeholders = applicationIds.map((_, index) => `$${index + 4}`).join(',');
    
    const result = await query(
      `UPDATE job_applications 
       SET application_status = $1, 
           admin_notes = $2,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $3
       WHERE id IN (${placeholders})
       RETURNING *`,
      [status, notes || null, req.user?.userId || null, ...applicationIds]
    );

    res.json({
      success: true,
      message: `${result.rows.length} applications updated successfully`,
      data: result.rows
    });
  } catch (error) {
    console.error('Error bulk updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    const result = await query(
      'DELETE FROM job_applications WHERE id = $1 RETURNING *',
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
});

// Get application statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    if (date_from) {
      whereClause += ` AND a.applied_at >= $${paramIndex++}`;
      queryParams.push(date_from);
    }

    if (date_to) {
      whereClause += ` AND a.applied_at <= $${paramIndex++}`;
      queryParams.push(date_to);
    }

    const statsQuery = `
      SELECT
        COUNT(*) as total_applications,
        COUNT(CASE WHEN a.application_status = 'pending' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN a.application_status = 'reviewing' THEN 1 END) as reviewing_applications,
        COUNT(CASE WHEN a.application_status = 'accepted' THEN 1 END) as accepted_applications,
        COUNT(CASE WHEN a.application_status = 'rejected' THEN 1 END) as rejected_applications,
        COUNT(CASE WHEN a.application_status = 'shortlisted' THEN 1 END) as shortlisted_applications,
        COUNT(CASE WHEN a.applied_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as applications_last_30_days,
        COUNT(CASE WHEN a.applied_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as applications_last_7_days,
        COUNT(DISTINCT a.job_id) as unique_jobs,
        COUNT(DISTINCT a.user_id) as unique_applicants
      FROM job_applications a
      WHERE 1=1${whereClause}
    `;

    const result = await query(statsQuery, queryParams);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
});

export default router;
