const express = require('express');
const router = express.Router();
const { getUsers, getUserById, getCurrentUser } = require('../controllers/userController');

// Routes for user management
router.get('/', getUsers);                    // GET /user - get users with optional filtering
router.get('/me', getCurrentUser);           // GET /user/me - get current user profile
router.get('/:id', getUserById);             // GET /user/:id - get user by ID

module.exports = router;
