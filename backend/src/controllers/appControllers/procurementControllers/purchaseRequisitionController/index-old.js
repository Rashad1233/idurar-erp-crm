const express = require('express');
const router = express.Router();

const createController = require('./create');
const readController = require('./read');
const listController = require('./listForDropdown'); // Use simplified list for dropdown
const fullListController = require('./list'); // Full list with pagination
const searchController = require('./search');
const updateController = require('./update');
const removeController = require('./remove');
const filterController = require('./filter');
const summaryController = require('./summary');

// Define routes for purchase requisition

// Root path - use simplified list for dropdown compatibility
router.get('/', listController);

// List all purchase requisitions - simplified for dropdown
router.get('/list', listController);

// Full list with pagination
router.get('/list-full', fullListController);

// Search purchase requisitions
router.get('/search', searchController);

// Filter purchase requisitions
router.get('/filter', filterController);

// Get summary
router.get('/summary', summaryController);

// GET /purchase-requisition/:id to get purchase requisition by id
router.get('/:id', readController.readPurchaseRequisitions);

// Create new purchase requisition
router.post('/create', createController);

// Update purchase requisition
router.patch('/update/:id', updateController);

// Delete purchase requisition
router.delete('/delete/:id', removeController);

module.exports = router;
