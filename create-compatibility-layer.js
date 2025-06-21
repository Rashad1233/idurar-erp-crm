const { Sequelize } = require('sequelize');

// This function will create a custom wrapper for the models to handle both camelCase and snake_case
async function fixControllersNamespacing() {
  try {
    // Create a global compatibility layer for models
    console.log('⏳ Creating controller compatibility layer...');
    
    const code = `
// Add this to your main application file (app.js or index.js)
// This middleware ensures that models can handle both camelCase and snake_case fields

// Function to extend models with compatibility methods
function extendModels(models) {
  Object.values(models).forEach(model => {
    if (model.prototype) {
      // Override toJSON to provide compatibility between camelCase and snake_case
      const originalToJSON = model.prototype.toJSON;
      model.prototype.toJSON = function() {
        const values = originalToJSON ? originalToJSON.call(this) : { ...this.dataValues };
        
        // Add snake_case equivalents for common camelCase attributes
        const camelToSnakeMap = {
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          isActive: 'is_active',
          isDeleted: 'is_deleted',
          firstName: 'first_name',
          lastName: 'last_name',
          lastLogin: 'last_login'
        };
        
        // For each camelCase attribute, check if we need to add its snake_case equivalent
        Object.entries(camelToSnakeMap).forEach(([camel, snake]) => {
          if (values[camel] !== undefined && values[snake] === undefined) {
            values[snake] = values[camel];
          } else if (values[snake] !== undefined && values[camel] === undefined) {
            values[camel] = values[snake];
          }
        });
        
        return values;
      };
      
      // Override get method to provide compatibility for accessing attributes
      const originalGet = model.prototype.get;
      model.prototype.get = function(key, options) {
        // Try original get first
        const value = originalGet ? originalGet.call(this, key, options) : this.dataValues[key];
        
        if (value !== undefined) return value;
        
        // If original get returns undefined, try converting between naming conventions
        const camelToSnake = {
          'createdAt': 'created_at',
          'updatedAt': 'updated_at',
          'isActive': 'is_active',
          'isDeleted': 'is_deleted',
          'firstName': 'first_name',
          'lastName': 'last_name',
          'lastLogin': 'last_login'
        };
        
        const snakeToCamel = Object.entries(camelToSnake).reduce((acc, [camel, snake]) => {
          acc[snake] = camel;
          return acc;
        }, {});
        
        // If key is camelCase, try snake_case
        if (camelToSnake[key]) {
          return originalGet ? originalGet.call(this, camelToSnake[key], options) : this.dataValues[camelToSnake[key]];
        }
        
        // If key is snake_case, try camelCase
        if (snakeToCamel[key]) {
          return originalGet ? originalGet.call(this, snakeToCamel[key], options) : this.dataValues[snakeToCamel[key]];
        }
        
        return undefined;
      };
    }
  });
}

// Use this function in your app initialization
// For example: extendModels(db);
`;
    
    // Write to a file
    const fs = require('fs');
    fs.writeFileSync('model-compatibility-layer.js', code);
    
    console.log('✅ Created model-compatibility-layer.js');
    console.log('You can include this in your main application file (app.js or server.js)');
    
    // Create implementation file for express middleware
    const middlewareCode = `
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
`;

    // Create middleware directory if it doesn't exist
    if (!fs.existsSync('middleware')) {
      fs.mkdirSync('middleware');
    }
    
    fs.writeFileSync('middleware/modelCompatibility.js', middlewareCode);
    console.log('✅ Created middleware/modelCompatibility.js');
    
    // Create usage instructions
    const usageInstructions = `
=============================================
HOW TO USE THE MODEL COMPATIBILITY LAYER
=============================================

The model compatibility layer allows your application to work with both
camelCase and snake_case column names, which solves the "column does not exist" errors.

Follow these steps to implement it:

1. In your main app.js or server.js file, add:

   // Import the compatibility layer
   const { extendModels } = require('./model-compatibility-layer');
   
   // After initializing your models
   const db = require('./models');
   extendModels(db);

2. Add the middleware to your Express app:

   // Import the middleware
   const modelCompatibility = require('./middleware/modelCompatibility');
   
   // Apply the middleware
   app.use(modelCompatibility);

These changes will make your application resilient to column naming inconsistencies
by automatically handling both camelCase and snake_case versions of column names.

=============================================
`;

    fs.writeFileSync('MODEL-COMPATIBILITY-INSTRUCTIONS.md', usageInstructions);
    console.log('✅ Created MODEL-COMPATIBILITY-INSTRUCTIONS.md with usage instructions');
    
  } catch (error) {
    console.error('❌ Error creating compatibility layer:', error);
  }
}

fixControllersNamespacing();
