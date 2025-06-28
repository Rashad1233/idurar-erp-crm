const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractItems,
  addItemToContract,
  removeItemFromContract,
  submitContract,
  getContractsForDofaApproval,
  approveContract,
  rejectContract,
  getPendingContractApprovals,
  sendContractApprovalEmail
} = require('../controllers/contractController');

// Get all contracts
router.get('/', protect, getAllContracts);
router.get('/list', protect, getAllContracts);

// Create contract
router.post('/', protect, createContract);

// Get pending contract approvals
router.get('/pending-approvals', protect, getPendingContractApprovals);

// List contracts pending DOFA approval (legacy)
router.get('/dofa/pending', protect, getContractsForDofaApproval);

// Get contract by ID
router.get('/:id', protect, getContractById);

// Update contract
router.put('/:id', protect, updateContract);

// Delete contract
router.delete('/:id', protect, deleteContract);

// Get contract items
router.get('/:id/items', protect, getContractItems);

// Add item to contract
router.post('/:id/items', protect, addItemToContract);

// Remove item from contract
router.delete('/item/:itemId', protect, removeItemFromContract);

// Submit contract for approval
router.post('/:id/submit', protect, submitContract);

// Approve or reject contract
router.put('/:id/approve', protect, approveContract);

// Send contract approval email to supplier
router.post('/:id/send-approval-email', protect, sendContractApprovalEmail);

// Legacy approve/reject routes
router.post('/:id/approve', protect, approveContract);
router.post('/:id/reject', protect, rejectContract);

module.exports = router;
