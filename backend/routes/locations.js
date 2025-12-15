import express from 'express';
const router = express.Router();
import Location from '../models/Location.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

// Create new location (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location, city, state, country, is_active } = req.body;

    if (!location || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Location, city, and state are required'
      });
    }

    // Check if location already exists
    const existingLocation = await Location.findByName(location);
    if (existingLocation) {
      return res.status(409).json({
        success: false,
        message: 'Location already exists'
      });
    }

    // Create the location
    const newLocation = await Location.create({
      location,
      city,
      state,
      country: country || 'India',
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: newLocation
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all locations with pagination and search (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await Location.getPaginated(page, limit, search);
    
    res.json({
      success: true,
      data: result.locations,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get location statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Location.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get location details (admin only)
router.get('/:location', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location } = req.params;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const details = await Location.getDetails(location);
    
    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error fetching location details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get jobs by location (admin only)
router.get('/:location/jobs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const activeOnly = req.query.active !== 'false';

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const result = await Location.getJobs(location, page, limit, activeOnly);
    
    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching jobs by location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs by location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get location trends (admin only)
router.get('/:location/trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location } = req.params;
    const days = parseInt(req.query.days) || 30;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const trends = await Location.getTrends(location, days);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching location trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location trends',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update location name (admin only)
router.put('/:location', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location } = req.params;
    const { newLocation } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Current location name is required'
      });
    }

    if (!newLocation || newLocation.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'New location name is required'
      });
    }

    const updatedJobs = await Location.updateLocation(location, newLocation.trim());
    
    if (updatedJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No jobs found with this location'
      });
    }

    res.json({
      success: true,
      message: `Location updated successfully. ${updatedJobs.length} jobs affected.`,
      data: {
        oldLocation: location,
        newLocation: newLocation.trim(),
        affectedJobs: updatedJobs.length
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete location (admin only)
router.delete('/:location', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const updatedJobs = await Location.deleteLocation(location);
    
    if (updatedJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No jobs found with this location'
      });
    }

    res.json({
      success: true,
      message: `Location deleted successfully. ${updatedJobs.length} jobs affected.`,
      data: {
        deletedLocation: location,
        affectedJobs: updatedJobs.length,
        updatedJobs: updatedJobs
      }
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Public routes for frontend

// Get top locations (public)
router.get('/public/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topLocations = await Location.getTopLocations(limit);
    
    res.json({
      success: true,
      data: topLocations
    });
  } catch (error) {
    console.error('Error fetching top locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top locations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all locations for dropdown/autocomplete (public)
router.get('/public/all', async (req, res) => {
  try {
    const locations = await Location.getAll();
    
    res.json({
      success: true,
      data: locations.map(loc => ({
        name: loc.location,
        jobCount: parseInt(loc.job_count),
        activeJobCount: parseInt(loc.active_job_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching all locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get public jobs by location
router.get('/public/:location/jobs', async (req, res) => {
  try {
    const { location } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const result = await Location.getJobs(location, page, limit, true);
    
    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching public jobs by location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs by location',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
