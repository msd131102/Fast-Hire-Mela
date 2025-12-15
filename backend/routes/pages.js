import express from 'express';
import { Page } from '../models/Page.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all pages with filtering and pagination (Admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search,
      status: req.query.status,
      author_id: req.query.author_id,
      template: req.query.template,
      sort_by: req.query.sort_by || 'created_at',
      sort_order: req.query.sort_order || 'DESC'
    };

    const result = await Page.findAll(filters);
    
    res.json({
      success: true,
      data: result.pages,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get page statistics (Admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Page.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching page stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get recently updated pages (Admin)
router.get('/admin/recent', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const pages = await Page.getRecentlyUpdated(limit);
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching recent pages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get page by ID (Admin)
router.get('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new page (Admin)
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status,
      is_homepage,
      template,
      featured_image,
      published_at
    } = req.body;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Title and slug are required'
      });
    }

    // Check if slug already exists
    const slugExists = await Page.slugExists(slug);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    const pageData = {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status,
      is_homepage,
      template,
      featured_image,
      author_id: req.user.id,
      published_at
    };

    const page = await Page.create(pageData);
    
    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: page
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update page (Admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status,
      is_homepage,
      template,
      featured_image,
      published_at
    } = req.body;

    // Check if page exists
    const existingPage = await Page.findById(req.params.id);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    // Check if slug already exists (excluding current page)
    if (slug && slug !== existingPage.slug) {
      const slugExists = await Page.slugExists(slug, req.params.id);
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }

    const updateData = {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      status,
      is_homepage,
      template,
      featured_image,
      author_id: req.user.id,
      published_at
    };

    const page = await Page.update(req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Page updated successfully',
      data: page
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete page (Admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = await Page.delete(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Page deleted successfully',
      data: page
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Duplicate page (Admin)
router.post('/admin/:id/duplicate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newTitle, newSlug } = req.body;

    if (!newTitle || !newSlug) {
      return res.status(400).json({
        success: false,
        message: 'New title and slug are required'
      });
    }

    // Check if slug already exists
    const slugExists = await Page.slugExists(newSlug);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    const duplicatedPage = await Page.duplicate(req.params.id, newTitle, newSlug);
    
    res.status(201).json({
      success: true,
      message: 'Page duplicated successfully',
      data: duplicatedPage
    });
  } catch (error) {
    console.error('Error duplicating page:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk update pages (Admin)
router.put('/admin/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Page IDs are required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    const updatedPages = await Page.bulkUpdate(ids, updateData);
    
    res.json({
      success: true,
      message: `${updatedPages.length} pages updated successfully`,
      data: updatedPages
    });
  } catch (error) {
    console.error('Error bulk updating pages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk delete pages (Admin)
router.delete('/admin/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Page IDs are required'
      });
    }

    const deletedPages = await Page.bulkDelete(ids);
    
    res.json({
      success: true,
      message: `${deletedPages.length} pages deleted successfully`,
      data: deletedPages
    });
  } catch (error) {
    console.error('Error bulk deleting pages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Public API endpoints

// Get homepage (Public)
router.get('/homepage', async (req, res) => {
  try {
    const page = await Page.findHomepage();
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Homepage not found'
      });
    }
    
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get page by slug (Public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findBySlug(req.params.slug);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }
    
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get pages by template (Public)
router.get('/template/:template', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pages = await Page.findByTemplate(req.params.template, limit);
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching pages by template:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search pages (Public)
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const limit = parseInt(req.query.limit) || 20;
    const pages = await Page.search(searchTerm, limit);
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error searching pages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
