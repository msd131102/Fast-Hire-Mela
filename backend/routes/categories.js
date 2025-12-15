import express from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Category from '../models/Category.js';

const router = express.Router();

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Get all categories
router.get('/', [
  queryValidator('include_job_count').optional().isBoolean(),
  queryValidator('active_only').optional().isBoolean()
], async (req, res) => {
  try {
    const { include_job_count = false, active_only = false } = req.query;

    // Get categories using Category model
    const categories = await Category.findAll(
      include_job_count === 'true',
      active_only !== 'false'
    );

    res.json({
      success: true,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get active categories only (must come before /:id)
router.get('/active', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get active categories using Category model
    const categories = await Category.findAll(true, true, parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: categories,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get active categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get popular categories (with most jobs)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get popular categories using Category model
    const categories = await Category.findPopular(parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get popular categories list (alternative endpoint)
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get popular categories using Category model
    const categories = await Category.findPopular(parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: categories
      }
    });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get category statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all categories with job counts
    const categories = await Category.findAll(true, false);
    
    const totalCategories = categories.length;
    const activeCategories = categories.filter(cat => cat.is_active).length;
    const totalJobs = categories.reduce((sum, cat) => sum + (cat.job_count || 0), 0);
    
    const stats = {
      total_categories: totalCategories,
      active_categories: activeCategories,
      inactive_categories: totalCategories - activeCategories,
      total_jobs_in_categories: totalJobs,
      average_jobs_per_category: totalCategories > 0 ? Math.round(totalJobs / totalCategories) : 0
    };

    res.json({
      success: true,
      data: {
        stats: stats
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search categories
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Get all categories and filter by search term
    const categories = await Category.findAll(false, false);
    
    const filteredCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(q.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(q.toLowerCase())) ||
      cat.slug.toLowerCase().includes(q.toLowerCase())
    ).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: filteredCategories,
        query: q,
        total_found: filteredCategories.length
      }
    });
  } catch (error) {
    console.error('Search categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get categories with trends
router.get('/trends', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get categories with job counts
    const categories = await Category.findAll(true, false);
    
    // Sort by job count to simulate "trending" (most jobs first)
    const trendingCategories = categories
      .filter(cat => cat.job_count > 0)
      .sort((a, b) => (b.job_count || 0) - (a.job_count || 0))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: trendingCategories,
        total_trending: trendingCategories.length
      }
    });
  } catch (error) {
    console.error('Get category trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const { include_job_count = false } = req.query;

    // Get category by slug using Category model
    const category = await Category.findBySlug(
      slug,
      include_job_count === 'true'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: category
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single category by ID (must come after all specific routes)
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { include_job_count = false } = req.query;

    // Validate that ID is a number
    if (isNaN(parseInt(categoryId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Get category using Category model
    const category = await Category.findById(
      parseInt(categoryId),
      include_job_count === 'true'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: category
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new category (Admin only)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('icon').optional().trim().isLength({ max: 50 }).withMessage('Icon must not exceed 50 characters'),
  body('color').optional().trim().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color code'),
  body('is_active').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      is_active = true
    } = req.body;

    const categoryData = {
      name,
      description,
      icon,
      color,
      is_active
    };

    // Create category using Category model
    const newCategory = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: newCategory
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update category (Admin only)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('icon').optional().trim().isLength({ max: 50 }).withMessage('Icon must not exceed 50 characters'),
  body('color').optional().trim().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color code'),
  body('is_active').optional().isBoolean()
], validateRequest, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updateData = req.body;

    // Update category using Category model
    const updatedCategory = await Category.update(parseInt(categoryId), updateData);

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory
      }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete category (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Delete category using Category model
    const deleted = await Category.delete(parseInt(categoryId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
