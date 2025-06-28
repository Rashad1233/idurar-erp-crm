const { User } = require('../models/sequelize');
const { Op } = require('sequelize');

// Get users with optional filtering
const getUsers = async (req, res) => {
  try {
    const { role, status, department, page = 1, limit = 100 } = req.query;
    
    // Build where clause based on query parameters
    const where = {};
      if (role) {
      // Support multiple roles separated by comma - filter to valid enum values
      const roles = role.split(',').map(r => r.trim());
      const validRoles = roles.filter(r => 
        ['admin', 'staff', 'manager', 'inventory_manager', 'warehouse_manager', 'procurement_manager'].includes(r)
      );
      if (validRoles.length > 0) {
        where.role = { [Op.in]: validRoles };
      }
    }
    
    if (status) {
      // Map status to isActive field
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }
    
    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Query users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset,
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt'
      ]
    });
    
    // Transform the data to match expected frontend format
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
      department: '', // Not available in current model
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.json({
      success: true,
      data: transformedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Transform the data to match expected frontend format
    const transformedUser = {
      id: user.id,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
      department: '', // Not available in current model
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      data: transformedUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Get current user profile (from auth token)
const getCurrentUser = async (req, res) => {
  try {
    // Assuming user ID is available from auth middleware in req.user
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'createdAt',
        'updatedAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Transform the data to match expected frontend format
    const transformedUser = {
      id: user.id,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
      department: '', // Not available in current model
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      data: transformedUser
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getCurrentUser
};
