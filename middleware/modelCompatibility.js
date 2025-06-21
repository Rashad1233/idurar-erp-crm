
// middleware/modelCompatibility.js
module.exports = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to add compatibility between camelCase and snake_case
  res.json = function(data) {
    // Skip null, undefined or non-objects
    if (!data || typeof data !== 'object') {
      return originalJson.call(this, data);
    }
    
    // Process arrays
    if (Array.isArray(data)) {
      data = data.map(item => processItem(item));
      return originalJson.call(this, data);
    }
    
    // Process single object
    return originalJson.call(this, processItem(data));
  };
  
  next();
};

// Helper function to process each item
function processItem(item) {
  if (!item || typeof item !== 'object') return item;
  
  const camelToSnakeMap = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    isActive: 'is_active',
    isDeleted: 'is_deleted',
    firstName: 'first_name',
    lastName: 'last_name',
    lastLogin: 'last_login'
  };
  
  const processed = { ...item };
  
  // For each camelCase attribute, check if we need to add its snake_case equivalent
  Object.entries(camelToSnakeMap).forEach(([camel, snake]) => {
    if (processed[camel] !== undefined && processed[snake] === undefined) {
      processed[snake] = processed[camel];
    } else if (processed[snake] !== undefined && processed[camel] === undefined) {
      processed[camel] = processed[snake];
    }
  });
  
  return processed;
}
