/**
 * ID Generator Utility
 * Provides functions for generating various types of unique identifiers
 */

/**
 * Generates a random alphanumeric ID 
 * @param {number} length - The length of the ID to generate (default: 10)
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} A random alphanumeric ID
 */
const generateRandomId = (length = 10, prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix ? `${prefix}-${result}` : result;
};

/**
 * Generates a time-based ID with an optional prefix
 * Format: prefix-YYYYMMDDHHmmss-randomChars
 * @param {string} prefix - Prefix for the ID (default: 'ID')
 * @param {number} randomLength - Length of random characters to append (default: 4)
 * @returns {string} A time-based ID
 */
const generateTimeBasedId = (prefix = 'ID', randomLength = 4) => {
  const now = new Date();
  const timestamp = now.getFullYear() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  
  const randomChars = generateRandomId(randomLength);
  
  return `${prefix}-${timestamp}-${randomChars}`;
};

/**
 * Generates a sequential ID with a specified prefix and padding
 * @param {string} prefix - Prefix for the ID
 * @param {number} sequence - The sequence number
 * @param {number} padding - Number of digits to pad the sequence to (default: 6)
 * @returns {string} A sequential ID (e.g., 'INV-000001')
 */
const generateSequentialId = (prefix, sequence, padding = 6) => {
  return `${prefix}-${sequence.toString().padStart(padding, '0')}`;
};

module.exports = {
  generateRandomId,
  generateTimeBasedId,
  generateSequentialId
};
