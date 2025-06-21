const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize/index');
// Create models object with both capitalized and lowercase aliases
const models = {
  User,
  user: User
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await models.User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
      // Create new user
    const user = await models.User.create({
      name,
      email,
      password, // Password will be hashed in the model's beforeCreate hook
      role: role || 'staff'
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    console.log('📥 Login request body:', req.body);
    console.log('📥 Available fields:', Object.keys(req.body));
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }    console.log('🔍 About to query User.findOne with email:', email);
    
    // Find user by email
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role', 'isActive']
    });
    
    console.log('✅ User query completed, found user:', !!user);

    if (user && (await user.comparePassword(password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
      if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createItemMaster: user.createItemMaster,
        editItemMaster: user.editItemMaster,
        approveItemMaster: user.approveItemMaster,
        setInventoryLevels: user.setInventoryLevels,
        createReorderRequests: user.createReorderRequests,
        approveReorderRequests: user.approveReorderRequests,
        warehouseTransactions: user.warehouseTransactions
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
