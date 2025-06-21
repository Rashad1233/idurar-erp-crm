/**
 * Number Generator Utility
 * Provides functions for generating sequential document numbers (e.g., PR-20250607-0001)
 */
const { Op } = require('sequelize');

/**
 * Generates the next sequential number for a document type
 * Format: PREFIX-YYYYMMDD-XXXX
 * 
 * @param {string} prefix - Document type prefix (e.g., 'PR', 'RFQ', 'PO')
 * @param {object} model - Sequelize model to check for existing document numbers
 * @param {string} field - Field name to check for existing numbers (default: based on prefix)
 * @returns {string} The next sequential document number
 */
const generateNextNumber = async (prefix, model, field = null) => {
  // Determine which field to check based on the document type
  const numberField = field || getFieldNameByPrefix(prefix);
  
  // Generate date part of the number (YYYYMMDD)
  const now = new Date();
  const datePart = now.getFullYear() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  
  // Find the latest document with the same prefix and date
  const pattern = `${prefix}-${datePart}-%`;
  
  try {
    // Query the database for the latest number
    const latestDoc = await model.findOne({
      where: {
        [numberField]: {
          [Op.like]: pattern
        }
      },
      order: [[numberField, 'DESC']]
    });
    
    let sequenceNumber = '0001';
    
    if (latestDoc) {
      // Extract sequence number from the latest document
      const lastNumber = latestDoc[numberField];
      const lastSequence = lastNumber.split('-')[2];
      
      // Increment the sequence number
      sequenceNumber = (parseInt(lastSequence, 10) + 1).toString().padStart(4, '0');
    }
    
    return `${prefix}-${datePart}-${sequenceNumber}`;
  } catch (error) {
    console.error(`Error generating sequential number: ${error.message}`);
    // Fallback to a timestamp-based number if there's an error
    return `${prefix}-${datePart}-ERR${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
};

/**
 * Get the database field name based on document type prefix
 * 
 * @param {string} prefix - Document type prefix
 * @returns {string} Database field name
 */
const getFieldNameByPrefix = (prefix) => {
  const fieldMap = {
    'PR': 'prNumber',
    'RFQ': 'rfqNumber',
    'PO': 'poNumber',
    'INV': 'invoiceNumber',
    'CON': 'contractNumber'
  };
  
  return fieldMap[prefix] || 'documentNumber';
};

module.exports = {
  generateNextNumber
};
