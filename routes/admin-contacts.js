import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all contact submissions with filtering and pagination
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build WHERE conditions for contact_messages table
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filter by status (contact_messages doesn't have status, so we'll use is_read)
    if (status && status !== 'all') {
      if (status === 'pending') {
        whereConditions.push(`is_read = $${paramIndex++}`);
        queryParams.push(false);
      } else if (status === 'replied') {
        whereConditions.push(`is_read = $${paramIndex++}`);
        queryParams.push(true);
      }
    }

    // Search functionality
    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex++} OR 
        email ILIKE $${paramIndex++} OR 
        subject ILIKE $${paramIndex++} OR 
        message ILIKE $${paramIndex++}
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort column
    const validSortColumns = ['created_at', 'name', 'email', 'subject'];
    const validSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get total count
    const countSql = `SELECT COUNT(*) FROM contact_messages ${whereClause}`;
    const countResult = await req.db.query(countSql, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get contacts
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sql = `
      SELECT * FROM contact_messages 
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(parseInt(limit), offset);

    const result = await req.db.query(sql, queryParams);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      contacts: result.rows,
      totalPages: totalPages,
      currentPage: parseInt(page),
      totalItems: total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
});

// Export contacts data (must be before /:id route)
router.get('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    // Get all contacts
    const result = await req.db.query(`
      SELECT 
        id,
        name,
        email,
        subject,
        message,
        is_read,
        created_at
      FROM contact_messages 
      ORDER BY created_at DESC
    `);
    
    const contacts = result.rows;
    
    if (format === 'json') {
      // JSON export
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.json"`);
      return res.json({
        success: true,
        data: contacts,
        exported_at: new Date().toISOString(),
        total: contacts.length
      });
    }
    
    // CSV export (default)
    const csvHeaders = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Created At'];
    const csvRows = contacts.map(contact => [
      contact.id,
      `"${contact.name.replace(/"/g, '""')}"`,
      `"${contact.email.replace(/"/g, '""')}"`,
      `"${contact.subject.replace(/"/g, '""')}"`,
      `"${contact.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      contact.is_read ? 'Replied' : 'Pending',
      contact.created_at
    ]);
    
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export contacts'
    });
  }
});

// Get single contact submission by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await req.db.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    
    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: contact.rows[0]
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission'
    });
  }
});

// Update contact submission status
router.patch('/:id/status', 
  authenticateToken, 
  requireAdmin,
  [
    body('status').isIn(['pending', 'replied', 'resolved', 'spam']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Update is_read status based on status
      let isRead = false;
      if (req.body.status === 'replied' || req.body.status === 'resolved') {
        isRead = true;
      }

      const result = await req.db.query(
        'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
        [isRead, req.params.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact submission not found'
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status'
      });
    }
  }
);

// Reply to contact submission
router.post('/:id/reply',
  authenticateToken,
  requireAdmin,
  [
    body('message').notEmpty().withMessage('Reply message is required'),
    body('to').isEmail().withMessage('Valid email address is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Check if contact exists
      const contact = await req.db.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
      if (contact.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact submission not found'
        });
      }

      // In a real implementation, you would send an email here
      // For now, we'll just log the reply and update the status
      console.log(`Sending reply to ${req.body.to}: ${req.body.message}`);
      
      // Update status to replied
      const result = await req.db.query(
        'UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *',
        [req.params.id]
      );

      res.json({
        success: true,
        message: 'Reply sent successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reply'
      });
    }
  }
);

// Delete contact submission
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await req.db.query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission'
    });
  }
});


// Get contact statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN is_read = false THEN 1 END) as pending_contacts,
        COUNT(CASE WHEN is_read = true THEN 1 END) as replied_contacts,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_contacts
      FROM contact_messages
    `;
    
    const result = await req.db.query(sql);
    const stats = result.rows[0];

    // Transform stats to match frontend expectations
    const transformedStats = {
      total: stats.total_contacts,
      pending: stats.pending_contacts,
      replied: stats.replied_contacts,
      resolved: 0, // This would need to be added to the model
      spam: 0, // This would need to be added to the model
      highPriority: 0, // This would need to be added to the model
      unassigned: 0, // This would need to be added to the model
      thisWeek: stats.this_week_contacts
    };

    res.json({
      success: true,
      data: transformedStats
    });
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});


export default router;
