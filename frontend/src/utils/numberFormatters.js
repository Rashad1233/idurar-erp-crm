/**
 * Utility functions for safely formatting numeric values throughout the application
 */

/**
 * Safely formats a numeric value with specified decimal places
 * Handles null, undefined, non-numeric strings, and other invalid inputs
 * 
 * @param {*} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted number as string with decimal places
 */
export const formatNumber = (value, decimals = 2) => {
  // Handle null, undefined, or non-numeric values
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  
  // Check if it's a valid number after conversion
  if (isNaN(numValue)) {
    return '0.00';
  }
  
  // Format the number with specified decimal places
  return numValue.toFixed(decimals);
};

/**
 * Formats a value as currency with symbol and decimal places
 * 
 * @param {*} value - The value to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = '$', decimals = 2) => {
  return `${currency}${formatNumber(value, decimals)}`;
};

/**
 * Safely calculates a value with a multiplier
 * Useful for calculating line totals (price * quantity)
 * 
 * @param {*} value - Base value
 * @param {*} multiplier - Multiplier
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted number as string with decimal places
 */
export const calculateAndFormat = (value, multiplier, decimals = 2) => {
  const val = parseFloat(value) || 0;
  const mult = parseFloat(multiplier) || 0;
  return formatNumber(val * mult, decimals);
};

/**
 * Format a file size in bytes to a human-readable string
 * 
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted size with units (e.g., "2.50 MB")
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export default {
  formatNumber,
  formatCurrency,
  calculateAndFormat,
  formatFileSize
};
