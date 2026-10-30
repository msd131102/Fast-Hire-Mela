import { query } from '../config/database.js';

/**
 * OTP Model - Handles all OTP-related database operations
 */
export class Otp {
  /**
   * Create new OTP
   * @param {Object} otpData - OTP data
   * @param {string} otpData.email - User email
   * @param {string} otpData.otp - OTP code
   * @param {string} otpData.type - OTP type (registration, password_reset, email_verification)
   * @param {string} otpData.ipAddress - IP address (optional)
   * @returns {Promise<Object>} Created OTP object
   */
  static async create(otpData) {
    try {
      const { email, otp, type = 'registration', ipAddress } = otpData;
      
      // Clean up existing OTPs for this email and type first
      await this.cleanupExpired(email, type);
      
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours (1 day)
      
      const result = await query(
        `INSERT INTO otps (email, otp, type, expires_at, ip_address) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [email, otp, type, expiresAt, ipAddress]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw new Error('Failed to create OTP');
    }
  }

  /**
   * Find valid OTP by email and code
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   * @returns {Promise<Object|null>} OTP object or null
   */
  static async findValidOtp(email, otp, type = 'registration') {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE email = $1 AND otp = $2 AND type = $3 
           AND is_used = false AND expires_at > NOW()`,
        [email, otp, type]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding valid OTP:', error);
      throw new Error('Failed to find valid OTP');
    }
  }

  /**
   * Find OTP by email and OTP code (alias for findValidOtp)
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   * @returns {Promise<Object|null>} OTP object or null
   */
  static async findByEmailAndOtp(email, otp, type = 'registration') {
    return await this.findValidOtp(email, otp, type);
  }

  /**
   * Find active OTP by email and type
   * @param {string} email - User email
   * @param {string} type - OTP type
   * @returns {Promise<Object|null>} OTP object or null
   */
  static async findActiveByEmail(email, type = 'registration') {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE email = $1 AND type = $2 
           AND is_used = false AND expires_at > NOW()
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, type]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding active OTP by email:', error);
      throw new Error('Failed to find active OTP by email');
    }
  }

  /**
   * Find OTP by email (latest one)
   * @param {string} email - User email
   * @param {string} type - OTP type
   * @returns {Promise<Object|null>} OTP object or null
   */
  static async findByEmail(email, type = 'registration') {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE email = $1 AND type = $2 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, type]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding OTP by email:', error);
      throw new Error('Failed to find OTP by email');
    }
  }

  /**
   * Mark OTP as used
   * @param {number} id - OTP ID
   * @returns {Promise<Object>} Updated OTP object
   */
  static async markAsUsed(id) {
    try {
      const result = await query(
        `UPDATE otps 
         SET is_used = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      throw new Error('Failed to mark OTP as used');
    }
  }

  /**
   * Increment OTP attempts
   * @param {number} id - OTP ID
   * @returns {Promise<Object>} Updated OTP object
   */
  static async incrementAttempts(id) {
    try {
      const result = await query(
        `UPDATE otps 
         SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error incrementing OTP attempts:', error);
      throw new Error('Failed to increment OTP attempts');
    }
  }

  /**
   * Check if OTP is expired
   * @param {Object} otp - OTP object
   * @returns {boolean} Whether OTP is expired
   */
  static isExpired(otp) {
    return new Date() > new Date(otp.expires_at);
  }

  /**
   * Check if OTP is valid
   * @param {Object} otp - OTP object
   * @returns {boolean} Whether OTP is valid
   */
  static isValid(otp) {
    return !otp.is_used && !this.isExpired(otp) && otp.attempts < 3;
  }

  /**
   * Clean up expired OTPs for specific email and type
   * @param {string} email - User email
   * @param {string} type - OTP type
   * @returns {Promise<number>} Number of deleted records
   */
  static async cleanupExpired(email, type) {
    try {
      const result = await query(
        `DELETE FROM otps 
         WHERE email = $1 AND type = $2 
           AND (is_used = true OR expires_at <= NOW())`,
        [email, type]
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      throw new Error('Failed to clean up expired OTPs');
    }
  }

  /**
   * Clean up all expired OTPs
   * @returns {Promise<number>} Number of deleted records
   */
  static async cleanupAllExpired() {
    try {
      const result = await query(
        `DELETE FROM otps 
         WHERE is_used = true OR expires_at <= NOW()`
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up all expired OTPs:', error);
      throw new Error('Failed to clean up all expired OTPs');
    }
  }

  /**
   * Get OTP statistics
   * @returns {Promise<Object>} OTP statistics
   */
  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_otps,
          COUNT(CASE WHEN is_used = false AND expires_at > NOW() THEN 1 END) as active_otps,
          COUNT(CASE WHEN is_used = true THEN 1 END) as used_otps,
          COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired_otps,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as otps_last_24h
        FROM otps
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting OTP stats:', error);
      throw new Error('Failed to get OTP statistics');
    }
  }

  /**
   * Get all OTPs with pagination
   * @param {number} limit - Number of OTPs to return
   * @param {number} offset - Number of OTPs to skip
   * @returns {Promise<Array>} Array of OTP objects
   */
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM otps 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all OTPs:', error);
      throw new Error('Failed to get all OTPs');
    }
  }

  /**
   * Search OTPs by email
   * @param {string} searchTerm - Search term (email)
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of matching OTPs
   */
  static async search(searchTerm, limit = 20) {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE email ILIKE $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error searching OTPs:', error);
      throw new Error('Failed to search OTPs');
    }
  }

  /**
   * Delete OTP by ID
   * @param {number} id - OTP ID
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  static async delete(id) {
    try {
      const result = await query(
        `DELETE FROM otps WHERE id = $1`,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting OTP:', error);
      throw new Error('Failed to delete OTP');
    }
  }

  /**
   * Get OTPs by type
   * @param {string} type - OTP type
   * @param {number} limit - Number of OTPs to return
   * @param {number} offset - Number of OTPs to skip
   * @returns {Promise<Array>} Array of OTP objects
   */
  static async getByType(type, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE type = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [type, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting OTPs by type:', error);
      throw new Error('Failed to get OTPs by type');
    }
  }

  /**
   * Get recent OTPs
   * @param {number} hours - Number of hours to look back
   * @param {number} limit - Number of OTPs to return
   * @returns {Promise<Array>} Array of recent OTPs
   */
  static async getRecent(hours = 24, limit = 20) {
    try {
      const result = await query(
        `SELECT * FROM otps 
         WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '${hours} hours' 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting recent OTPs:', error);
      throw new Error('Failed to get recent OTPs');
    }
  }
}

// Default export for compatibility with existing imports
export default Otp;
