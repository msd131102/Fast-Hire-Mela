import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category = 'all', 
      status = 'active',
      search = '',
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (category !== 'all') {
      whereConditions.push(`category = $${paramIndex++}`);
      queryParams.push(category);
    }

    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex++}`);
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push(`(question ILIKE $${paramIndex++} OR answer ILIKE $${paramIndex++})`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM faqs 
      ${whereClause}
    `;
    const countResult = await req.db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get FAQs with pagination
    const faqsQuery = `
      SELECT 
        id, question, answer, category, status, order_index, 
        created_at, updated_at, views, helpful, not_helpful
      FROM faqs 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));
    const faqsResult = await req.db.query(faqsQuery, queryParams);

    res.json({
      success: true,
      data: {
        faqs: faqsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: error.message
    });
  }
});

// Get FAQ by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.query(
      'SELECT * FROM faqs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Increment view count
    await req.db.query(
      'UPDATE faqs SET views = views + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQ',
      error: error.message
    });
  }
});

// Create new FAQ (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, category, order_index, status } = req.body;

    // Validate required fields
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    // Get the highest order index if not provided
    let finalOrderIndex = order_index || 0;
    if (!order_index) {
      const maxOrderResult = await req.db.query(
        'SELECT COALESCE(MAX(order_index), 0) as max_order FROM faqs'
      );
      finalOrderIndex = maxOrderResult.rows[0].max_order + 1;
    }

    const result = await req.db.query(
      `INSERT INTO faqs (question, answer, category, order_index, status, views, helpful, not_helpful)
       VALUES ($1, $2, $3, $4, $5, 0, 0, 0)
       RETURNING *`,
      [question, answer, category || 'general', finalOrderIndex, status || 'active']
    );

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create FAQ',
      error: error.message
    });
  }
});

// Update FAQ (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order_index, status } = req.body;

    // Check if FAQ exists
    const existingResult = await req.db.query(
      'SELECT * FROM faqs WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    const result = await req.db.query(
      `UPDATE faqs 
       SET question = COALESCE($1, question),
           answer = COALESCE($2, answer),
           category = COALESCE($3, category),
           order_index = COALESCE($4, order_index),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [question, answer, category, order_index, status, id]
    );

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FAQ',
      error: error.message
    });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if FAQ exists
    const existingResult = await req.db.query(
      'SELECT * FROM faqs WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await req.db.query('DELETE FROM faqs WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete FAQ',
      error: error.message
    });
  }
});

// Toggle FAQ status (admin only)
router.patch('/:id/toggle-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await req.db.query(
      `UPDATE faqs 
       SET status = CASE 
         WHEN status = 'active' THEN 'inactive' 
         ELSE 'active' 
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'FAQ status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle FAQ status',
      error: error.message
    });
  }
});

// Mark FAQ as helpful/not helpful
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Helpful must be a boolean value'
      });
    }

    const result = await req.db.query(
      `UPDATE faqs 
       SET ${helpful ? 'helpful' : 'not_helpful'} = ${helpful ? 'helpful' : 'not_helpful'} + 1
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

// Reorder FAQs (admin only)
router.patch('/reorder', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { faqOrders } = req.body; // Array of { id, order_index }

    if (!Array.isArray(faqOrders)) {
      return res.status(400).json({
        success: false,
        message: 'FAQ orders must be an array'
      });
    }

    // Update order for each FAQ
    for (const { id, order_index } of faqOrders) {
      await req.db.query(
        'UPDATE faqs SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [order_index, id]
      );
    }

    res.json({
      success: true,
      message: 'FAQs reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder FAQs',
      error: error.message
    });
  }
});

export default router;
