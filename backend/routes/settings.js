import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get public settings (accessible to everyone)
router.get('/public', async (req, res) => {
  try {
    const result = await query(
      'SELECT key, value FROM settings WHERE is_public = true'
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all settings (admin only)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM settings ORDER BY key'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get setting by key (admin only)
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const result = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create or update setting (admin only)
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, is_public } = req.body;

    // Validate required fields
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    // Check if setting exists
    const existingResult = await query(
      'SELECT id FROM settings WHERE key = $1',
      [key]
    );

    if (existingResult.rows.length > 0) {
      // Update existing setting
      await query(
        'UPDATE settings SET value = $1, description = COALESCE($2, description), is_public = COALESCE($3, is_public), updated_at = CURRENT_TIMESTAMP WHERE key = $4',
        [value, description, is_public, key]
      );
    } else {
      // Create new setting
      await query(
        'INSERT INTO settings (key, value, description, is_public) VALUES ($1, $2, $3, $4)',
        [key, value, description || '', is_public || false]
      );
    }

    // Get updated setting
    const result = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    res.json({
      success: true,
      message: 'Setting saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Save setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete setting (admin only)
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const result = await query(
      'DELETE FROM settings WHERE key = $1 RETURNING *',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


export default router;
