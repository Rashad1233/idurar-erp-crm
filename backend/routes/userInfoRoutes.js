// API endpoint to get user information for approval displays
const express = require('express');
const router = express.Router();
const { User } = require('../models/sequelize');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get user by ID - minimal info endpoint
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
      // Find user by ID
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
    });
    
    if (!user) {
      return res.status(200).json({
        success: false,
        message: 'User not found',
        data: { id: userId, name: `${userId.substr(0, 4)}-User` }
      });
    }
    
    // Return minimal user info
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name || `User-${user.id.substr(0, 4)}`,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user info',
      error: error.message
    });
  }
});

module.exports = router;
