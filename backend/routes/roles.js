import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all roles
router.get('/', async (req, res) => {
  try {
    // For now, return basic system roles since we don't have a roles table
    const roles = [
      {
        id: 1,
        name: 'Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
        userCount: 1
      },
      {
        id: 2,
        name: 'User',
        description: 'Basic user access for job seekers',
        isSystem: true,
        userCount: 0
      },
      {
        id: 3,
        name: 'Employer',
        description: 'Company access to post and manage jobs',
        isSystem: true,
        userCount: 0
      }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific role
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, return mock data since we don't have a roles table
    const roles = {
      1: {
        id: 1,
        name: 'Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
        userCount: 1,
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings']
      },
      2: {
        id: 2,
        name: 'User',
        description: 'Basic user access for job seekers',
        isSystem: true,
        userCount: 0,
        permissions: ['read', 'apply_jobs', 'save_jobs']
      },
      3: {
        id: 3,
        name: 'Employer',
        description: 'Company access to post and manage jobs',
        isSystem: true,
        userCount: 0,
        permissions: ['read', 'write', 'manage_jobs', 'view_applications']
      }
    };

    const role = roles[id];
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create a new role
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    // For now, just return success since we don't have a roles table
    // In a real implementation, you would insert into the database
    const newRole = {
      id: Date.now(), // Mock ID
      name,
      description,
      isSystem: false,
      userCount: 0,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a role
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Role name must be at least 2 characters'),
  body('description').optional().trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // For now, just return success since we don't have a roles table
    // In a real implementation, you would update the database
    const updatedRole = {
      id: parseInt(id),
      name: name || 'Updated Role',
      description: description || 'Updated description',
      isSystem: false,
      userCount: 0,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // For now, just return success since we don't have a roles table
    // In a real implementation, you would delete from the database
    // and check if there are users assigned to this role

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
