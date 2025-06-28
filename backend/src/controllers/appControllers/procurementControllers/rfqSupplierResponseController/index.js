const express = require('express');
const router = express.Router();

// Import RFQ supplier response controller methods
const list = require('./list');

// RFQ supplier response routes
router.route('/')
  .get(list);

module.exports = router;