/**
 * Utility functions for formatting numbers and currencies in a safe way
 * Handles various edge cases like null, undefined, NaN, etc.
 */

/**
 * Safely formats a number with the specified number of decimal places
 * 
 * @param {any} value - The value to format (can be string, number, null, etc.)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted number as string with decimal places
 */
export const formatNumber = (value, decimals = 2) => {
  // Handle null, undefined, or non-numeric values
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  
  // Convert to number if it's a string
  let numValue;
  try {
    numValue = typeof value === 'number' ? value : parseFloat(value);
  } catch (e) {
    return '0.00';
  }
  
  // Check if it's a valid number after conversion
  if (isNaN(numValue)) {
    return '0.00';
  }
  
  // Format the number with specified decimal places
  try {
    return numValue.toFixed(decimals);
  } catch (e) {
    return '0.00';
  }
};

/**
 * Formats a value as currency with the specified symbol and decimal places
 * 
 * @param {any} value - The value to format (can be string, number, null, etc.)
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = '$', decimals = 2) => {
  return `${currency}${formatNumber(value, decimals)}`;
};

/**
 * Formats a quantity with the specified unit of measure
 * 
 * @param {any} value - Quantity value
 * @param {string} uom - Unit of measure (default: '')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted quantity with unit of measure
 */
export const formatQuantity = (value, uom = '', decimals = 2) => {
  return `${formatNumber(value, decimals)}${uom ? ' ' + uom : ''}`;
};

/**
 * Safely adds two values, handling various edge cases
 * 
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {number} - Sum of the two values
 */
export const safeAdd = (a, b) => {
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  return numA + numB;
};

/**
 * Safely multiplies two values, handling various edge cases
 * 
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {number} - Product of the two values
 */
export const safeMultiply = (a, b) => {
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  return numA * numB;
};

export default {
  formatNumber,
  formatCurrency,
  formatQuantity,
  safeAdd,
  safeMultiply
};
