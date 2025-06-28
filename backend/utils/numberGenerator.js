const { RequestForQuotation, PurchaseRequisition, PurchaseOrder } = require('../models/sequelize');

/**
 * Generate automatic RFQ number
 * Format: RFQ-YYYYMMDD-NNNN
 */
async function generateRFQNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Find the highest number for today
  const todayRFQs = await RequestForQuotation.findAll({
    where: {
      rfqNumber: {
        [require('sequelize').Op.like]: `RFQ-${dateStr}-%`
      }
    },
    order: [['rfqNumber', 'DESC']],
    limit: 1
  });

  let nextNumber = 1;
  if (todayRFQs.length > 0) {
    const lastNumber = todayRFQs[0].rfqNumber.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `RFQ-${dateStr}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Generate automatic PR number
 * Format: PR-YYYYMMDD-NNNN
 */
async function generatePRNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const todayPRs = await PurchaseRequisition.findAll({
    where: {
      prNumber: {
        [require('sequelize').Op.like]: `PR-${dateStr}-%`
      }
    },
    order: [['prNumber', 'DESC']],
    limit: 1
  });

  let nextNumber = 1;
  if (todayPRs.length > 0) {
    const lastNumber = todayPRs[0].prNumber.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `PR-${dateStr}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Generate automatic PO number
 * Format: PO-YYYYMMDD-NNNN
 */
async function generatePONumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const todayPOs = await PurchaseOrder.findAll({
    where: {
      poNumber: {
        [require('sequelize').Op.like]: `PO-${dateStr}-%`
      }
    },
    order: [['poNumber', 'DESC']],
    limit: 1
  });

  let nextNumber = 1;
  if (todayPOs.length > 0) {
    const lastNumber = todayPOs[0].poNumber.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `PO-${dateStr}-${nextNumber.toString().padStart(4, '0')}`;
}

module.exports = {
  generateRFQNumber,
  generatePRNumber,
  generatePONumber
};