const express = require('express');
const router = express.Router();

// Import RFQ controller methods
const list = require('./list');
const read = require('./read');
const create = require('./create');
const filter = require('./filter');
const search = require('./search');
const listByPurchaseRequisition = require('./listByPurchaseRequisition');

// RFQ CRUD routes
router.route('/')
  .get(list)
  .post(create);

router.route('/read/:id')
  .get(read);

router.route('/filter')
  .get(filter);

router.route('/search')
  .get(search);

// New route to list RFQs by purchase requisition ID
router.route('/by-purchase-requisition/:prId')
  .get(listByPurchaseRequisition);

module.exports = router;
