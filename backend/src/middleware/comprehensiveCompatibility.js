/**
 * Comprehensive Compatibility Middleware
 * 
 * This middleware ensures compatibility between different naming conventions
 * (camelCase, snake_case) and handles capitalized table names.
 */

const middleware = (req, res, next) => {
  // Clone original send methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to handle compatibility
  res.send = function(data) {
    // If data is an object, process it
    if (typeof data === 'object' && data !== null && !Buffer.isBuffer(data)) {
      data = processCompatibility(data);
    }
    return originalSend.call(this, data);
  };

  // Override res.json to handle compatibility
  res.json = function(data) {
    // Process the data for compatibility
    data = processCompatibility(data);
    return originalJson.call(this, data);
  };

  // Process request body for compatibility
  if (req.body && typeof req.body === 'object') {
    req.body = processRequestCompatibility(req.body);
  }

  // Continue to the next middleware or route handler
  next();
};

// Process response data for compatibility
function processCompatibility(data) {
  // If data is an array, process each item
  if (Array.isArray(data)) {
    return data.map(item => processCompatibility(item));
  }
  
  // If data is not an object or is null, return as is
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  // For API response objects with data property that's an array
  if (data.data && Array.isArray(data.data)) {
    data.data = data.data.map(item => processCompatibility(item));
    return data;
  }

  // Clone the data to avoid modifying the original
  const processed = { ...data };
  
  // Add snake_case versions of all camelCase properties
  for (const key in processed) {
    if (Object.prototype.hasOwnProperty.call(processed, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Only add if the key doesn't already exist
      if (snakeKey !== key && !Object.prototype.hasOwnProperty.call(processed, snakeKey)) {
        processed[snakeKey] = processed[key];
      }
      
      // Process nested objects recursively
      if (typeof processed[key] === 'object' && processed[key] !== null) {
        if (Array.isArray(processed[key])) {
          processed[key] = processed[key].map(item => processCompatibility(item));
        } else {
          processed[key] = processCompatibility(processed[key]);
        }
      }
    }
  }
  
  return processed;
}

// Process request data for compatibility
function processRequestCompatibility(data) {
  // If data is an array, process each item
  if (Array.isArray(data)) {
    return data.map(item => processRequestCompatibility(item));
  }
  
  // If data is not an object or is null, return as is
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Clone the data to avoid modifying the original
  const processed = { ...data };
  
  // Convert snake_case properties to camelCase
  const camelCaseProps = {};
  
  for (const key in processed) {
    if (Object.prototype.hasOwnProperty.call(processed, key)) {
      // Convert snake_case to camelCase
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelCaseProps[camelKey] = processed[key];
      }
      
      // Process nested objects recursively
      if (typeof processed[key] === 'object' && processed[key] !== null) {
        if (Array.isArray(processed[key])) {
          processed[key] = processed[key].map(item => processRequestCompatibility(item));
        } else {
          processed[key] = processRequestCompatibility(processed[key]);
        }
      }
    }
  }
  
  // Add all camelCase properties
  return { ...processed, ...camelCaseProps };
}

module.exports = middleware;