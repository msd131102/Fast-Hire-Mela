import db from '../config/database.js';

class Media {
  static async create(mediaData) {
    const {
      filename,
      original_name,
      mime_type,
      file_size,
      upload_path,
      uploaded_by
    } = mediaData;

    const query = `
      INSERT INTO media (
        filename, original_name, mime_type, file_size, 
        upload_path, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
      const [result] = await db.execute(query, [
        filename,
        original_name,
        mime_type,
        file_size,
        upload_path,
        uploaded_by
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating media record:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT m.*, u.username as uploaded_by_username
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.id = ?
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding media by ID:', error);
      throw error;
    }
  }

  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT m.*, u.username as uploaded_by_username
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await db.execute(query, [limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error finding all media:', error);
      throw error;
    }
  }

  static async findByUploadedBy(userId, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, u.username as uploaded_by_username
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.uploaded_by = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await db.execute(query, [userId, limit, offset]);
      return rows;
    } catch (error) {
      console.error('Error finding media by uploader:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, u.username as uploaded_by_username
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.original_name LIKE ? OR m.filename LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    try {
      const [rows] = await db.execute(query, [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
        offset
      ]);
      return rows;
    } catch (error) {
      console.error('Error searching media:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE media SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM media WHERE id = ?';

    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }

  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM media',
      totalSize: 'SELECT SUM(file_size) as total_size FROM media',
      byType: 'SELECT mime_type, COUNT(*) as count FROM media GROUP BY mime_type',
      recent: 'SELECT COUNT(*) as count FROM media WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    };

    try {
      const stats = {};
      for (const [key, query] of Object.entries(queries)) {
        const [rows] = await db.execute(query);
        if (key === 'byType') {
          stats[key] = rows;
        } else {
          stats[key] = rows[0];
        }
      }
      return stats;
    } catch (error) {
      console.error('Error getting media stats:', error);
      throw error;
    }
  }

  static async getUsageByUser(limit = 10) {
    const query = `
      SELECT 
        u.id,
        u.username,
        COUNT(m.id) as file_count,
        COALESCE(SUM(m.file_size), 0) as total_size
      FROM users u
      LEFT JOIN media m ON u.id = m.uploaded_by
      GROUP BY u.id, u.username
      ORDER BY total_size DESC
      LIMIT ?
    `;

    try {
      const [rows] = await db.execute(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting usage by user:', error);
      throw error;
    }
  }
}

export default Media;
