const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendContractEmail, sendRFQEmail, sendPOApprovalEmail } = require('../controllers/aiEmailController');

// Send contract approval email to supplier
router.post('/send-contract-email', protect, sendContractEmail);

// Send RFQ invitation email to supplier
router.post('/send-rfq-email', protect, sendRFQEmail);

// Send PO approval email to approver
router.post('/send-po-approval-email', protect, sendPOApprovalEmail);

module.exports = router;
