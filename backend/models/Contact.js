import { query } from '../config/database.js';

export class Contact {
  // Create a new contact submission
  static async create(contactData) {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      status = 'pending',
      priority = 'medium'
    } = contactData;

    const sql = `
      INSERT INTO contacts (
        name, email, phone, company, subject, message, status, priority, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    try {
      const result = await query(sql, [
        name, email, phone, company, subject, message, status, priority
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Get all contacts with pagination and filtering
  static async findAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      queryParams.push(status);
    }

    if (priority) {
      whereConditions.push(`priority = $${paramIndex++}`);
      queryParams.push(priority);
    }

    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex++} OR 
        email ILIKE $${paramIndex++} OR 
        subject ILIKE $${paramIndex++} OR 
        company ILIKE $${paramIndex++}
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort column
    const validSortColumns = ['created_at', 'updated_at', 'name', 'email', 'status', 'priority'];
    const validSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get total count
    const countSql = `SELECT COUNT(*) FROM contacts ${whereClause}`;
    const countResult = await query(countSql, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get contacts
    const sql = `
      SELECT * FROM contacts 
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);

    try {
      const result = await query(sql, queryParams);
      return {
        contacts: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  // Get contact by ID
  static async findById(id) {
    const sql = 'SELECT * FROM contacts WHERE id = $1';
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding contact by ID:', error);
      throw error;
    }
  }

  // Update contact
  static async update(id, updateData) {
    const allowedFields = ['status', 'priority', 'notes'];
    const updateFields = [];
    const queryParams = [id];
    let paramIndex = 2;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex++}`);
        queryParams.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);

    const sql = `
      UPDATE contacts 
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await query(sql, queryParams);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Delete contact
  static async delete(id) {
    const sql = 'DELETE FROM contacts WHERE id = $1 RETURNING *';
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  // Get contact statistics
  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_contacts,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_contacts,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_contacts,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_contacts,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_contacts,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_contacts,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_contacts,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_contacts,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month_contacts
      FROM contacts
    `;

    try {
      const result = await query(sql);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching contact statistics:', error);
      throw error;
    }
  }

  // Get recent contacts
  static async getRecent(limit = 5) {
    const sql = `
      SELECT * FROM contacts 
      ORDER BY created_at DESC 
      LIMIT $1
    `;

    try {
      const result = await query(sql, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
      throw error;
    }
  }

  // Update contact status
  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const sql = `
      UPDATE contacts 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await query(sql, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  }

  // Mark contact as read/unread
  static async updateReadStatus(id, isRead) {
    const sql = `
      UPDATE contacts 
      SET is_read = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await query(sql, [isRead, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating contact read status:', error);
      throw error;
    }
  }

  // Get unread contacts count
  static async getUnreadCount() {
    const sql = 'SELECT COUNT(*) as unread_count FROM contacts WHERE is_read = false';
    
    try {
      const result = await query(sql);
      return parseInt(result.rows[0].unread_count);
    } catch (error) {
      console.error('Error fetching unread contacts count:', error);
      throw error;
    }
  }
}

export default Contact;
