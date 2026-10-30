import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and common document types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Get all media files
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM media_uploads ORDER BY upload_date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

// Upload a new file
router.post('/upload', authenticateToken, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const uploadedBy = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO media_uploads (filename, original_name, mime_type, file_size, uploaded_by, upload_date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [filename, originalname, mimetype, size, uploadedBy]
    );

    res.status(201).json({
      id: result.insertId,
      filename,
      original_name: originalname,
      mime_type: mimetype,
      file_size: size,
      uploaded_by: uploadedBy,
      upload_date: new Date()
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Delete the file if database insertion failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete a media file
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get file info before deleting
    const [rows] = await pool.execute(
      'SELECT filename FROM media_uploads WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filename = rows[0].filename;

    // Delete from database
    await pool.execute('DELETE FROM media_uploads WHERE id = ?', [id]);

    // Delete file from filesystem
    try {
      await fs.unlink(path.join('uploads', filename));
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
      // Continue even if file deletion fails
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info by ID
router.get('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM media_uploads WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching file info:', error);
    res.status(500).json({ error: 'Failed to fetch file info' });
  }
});

export default router;
