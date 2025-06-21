const jwt = require('jsonwebtoken');
const db = require('../models/sequelize/index');
const { User } = db;

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    // DEVELOPMENT MODE - bypass authentication for development
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
      console.log('⚠️ BYPASSING AUTHENTICATION FOR DEVELOPMENT');
      // For development only - find any admin user to use or skip authentication
      const adminUser = await User.findOne({ where: { role: 'admin' } });
      if (adminUser) {
        req.user = adminUser;
        console.log('🔑 Using admin user for auth bypass:', adminUser.id);
        return next();
      }
      
      // If no admin user found, continue without user context
      console.log('⚠️ No admin user found, continuing without user context');
      return next();
    }
    
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }// Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'isActive']
      });
      
      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ 
          message: 'Not authorized, user not found',
          details: 'User ID from token does not exist in database'
        });
      }
      
      console.log('User authenticated:', req.user.id);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ 
        message: 'Not authorized, token failed',
        details: error.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
