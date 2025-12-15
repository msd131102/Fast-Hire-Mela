import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applications = await Application.getByUser(userId);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Create a new job application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId, coverLetter, resumeUrl } = req.body;

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if user has already applied for this job
    const hasApplied = await Application.hasApplied(parseInt(jobId), userId);
    
    if (hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const application = await Application.create({
      job_id: parseInt(jobId),
      user_id: userId,
      cover_letter: coverLetter,
      resume_url: resumeUrl
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

// Update application status (for employers/admins)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updatedApplication = await Application.updateStatus(parseInt(applicationId), status);

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

export default router;
