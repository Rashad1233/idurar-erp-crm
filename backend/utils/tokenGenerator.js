const crypto = require('crypto');

/**
 * Generate a secure random token for approval links
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} - Secure random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate RFQ response token
 * @param {string} rfqId - RFQ ID
 * @param {string} supplierId - Supplier ID
 * @returns {string} - RFQ response token
 */
function generateRFQResponseToken(rfqId, supplierId) {
  const timestamp = Date.now();
  const data = `rfq_${rfqId}_supplier_${supplierId}_${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 32);
}

/**
 * Generate Purchase Order approval token
 * @param {string} poId - Purchase Order ID
 * @param {string} approverEmail - Approver email
 * @returns {string} - PO approval token
 */
function generatePOApprovalToken(poId, approverEmail) {
  const timestamp = Date.now();
  const data = `po_${poId}_approver_${approverEmail}_${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 32);
}

/**
 * Generate Contract acceptance token
 * @param {string} contractId - Contract ID
 * @param {string} supplierId - Supplier ID
 * @returns {string} - Contract acceptance token
 */
function generateContractAcceptanceToken(contractId, supplierId) {
  const timestamp = Date.now();
  const data = `contract_${contractId}_supplier_${supplierId}_${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 32);
}

/**
 * Generate Supplier acceptance token
 * @param {string} supplierId - Supplier ID
 * @returns {string} - Supplier acceptance token
 */
function generateSupplierAcceptanceToken(supplierId) {
  const timestamp = Date.now();
  const data = `supplier_${supplierId}_acceptance_${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 32);
}

/**
 * Validate token format
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token format is valid
 */
function validateTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token is hexadecimal and has appropriate length
  const hexRegex = /^[a-f0-9]+$/i;
  return hexRegex.test(token) && token.length >= 16 && token.length <= 64;
}

/**
 * Check if token is expired (tokens expire after 30 days by default)
 * @param {Date} createdAt - Token creation date
 * @param {number} expiryDays - Days until token expires (default: 30)
 * @returns {boolean} - True if token is expired
 */
function isTokenExpired(createdAt, expiryDays = 30) {
  if (!createdAt) {
    return true;
  }
  
  const now = new Date();
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  return now > expiryDate;
}

/**
 * Generate approval workflow tokens for multi-level approvals
 * @param {string} entityType - Type of entity (purchase_order, contract, rfq)
 * @param {string} entityId - Entity ID
 * @param {Array} approvers - Array of approver objects {email, level}
 * @returns {Array} - Array of tokens with metadata
 */
function generateApprovalWorkflowTokens(entityType, entityId, approvers) {
  const tokens = [];
  
  for (const approver of approvers) {
    const timestamp = Date.now();
    const data = `${entityType}_${entityId}_level_${approver.level}_${approver.email}_${timestamp}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const token = hash.substring(0, 32);
    
    tokens.push({
      token: token,
      level: approver.level,
      email: approver.email,
      name: approver.name || '',
      title: approver.title || '',
      status: 'pending'
    });
  }
  
  return tokens;
}

module.exports = {
  generateSecureToken,
  generateRFQResponseToken,
  generatePOApprovalToken,
  generateContractAcceptanceToken,
  generateSupplierAcceptanceToken,
  validateTokenFormat,
  isTokenExpired,
  generateApprovalWorkflowTokens
};