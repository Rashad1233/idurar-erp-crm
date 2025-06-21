/**
 * Utility functions for handling client IDs and other entity references
 * in a consistent way throughout the application.
 */

/**
 * Extracts a UUID from various formats (object, string, JSON string)
 * This helps prevent "invalid input syntax for type uuid" errors
 * when sending data to the backend.
 * 
 * @param {*} value - The value to extract a UUID from
 * @returns {string|null} - The extracted UUID or null if not found
 */
export const extractUUID = (value) => {
  if (!value) return null;
  
  try {
    // If it's already a UUID string, return it
    if (typeof value === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return value;
    }
    
    // If it's an object, extract the ID
    if (typeof value === 'object' && value !== null) {
      return value.id || value._id;
    }
    
    // If it's a string that might be JSON
    if (typeof value === 'string' && 
        (value.startsWith('{') || value.includes('"id":'))) {
      try {
        const parsed = JSON.parse(value);
        return parsed.id || parsed._id;
      } catch (e) {
        // Not valid JSON, try regex extraction
      }
    }
    
    // Try to extract UUID with regex as last resort
    if (typeof value === 'string') {
      const match = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (match) return match[0];
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting UUID:', e);
    return null;
  }
};

/**
 * Ensures that all entity references in the data are converted to UUID strings
 * This helps prevent "invalid input syntax for type uuid" errors when submitting forms
 * 
 * @param {object} data - The data to process
 * @param {array} idFields - Array of field names that should be UUIDs
 * @returns {object} - The processed data with proper UUID strings
 */
export const ensureEntityIds = (data, idFields = ['client', 'invoice', 'quote', 'order']) => {
  if (!data || typeof data !== 'object') return data;
  
  const result = { ...data };
  
  idFields.forEach(field => {
    if (result[field] !== undefined) {
      const uuid = extractUUID(result[field]);
      if (uuid) {
        result[field] = uuid;
      }
    }
  });
  
  return result;
};

export default {
  extractUUID,
  ensureEntityIds
};
