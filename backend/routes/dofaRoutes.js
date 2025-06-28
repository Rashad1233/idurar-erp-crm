const express = require('express');
const router = express.Router();
const dofaController = require('../controllers/dofaController');
const authMiddleware = require('../middleware/authMiddleware');
const contractController = require('../controllers/contractController');


// All routes are protected
router.use(authMiddleware.protect);

// Route to get all DoFA records (admin only)
router.get('/', authMiddleware.admin, dofaController.getAllDoFAs);

// Route to get DoFA records by type
router.get('/type/:type', dofaController.getDoFAsByType);

// Route to create a new DoFA record (admin only)
router.post('/', authMiddleware.admin, dofaController.createDoFA);

// Route to update a DoFA record (admin only)
router.put('/:id', authMiddleware.admin, dofaController.updateDoFA);

// Route to delete a DoFA record (admin only)
router.delete('/:id', authMiddleware.admin, dofaController.deleteDoFA);

// Route to get next approvers based on amount and type
router.get('/next-approvers', dofaController.getNextApprovers);

// Route to get contracts pending DOFA approval (by status)
router.get('/contracts/pending', contractController.getContractsForDofaApproval);

// Route to get contracts pending approval (new unified approach)
router.get('/contracts/review', contractController.getPendingContractApprovals);

// Route to approve a contract (DOFA)
router.post('/contracts/:id/approve', contractController.approveContract);

// Route to reject a contract (DOFA)
router.post('/contracts/:id/reject', contractController.rejectContract);

// Route to send contract approval email to supplier
router.post('/contracts/:id/send-approval-email', contractController.sendContractApprovalEmail);

module.exports = router;
