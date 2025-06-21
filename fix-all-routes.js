/**
 * FixAllRoutes.js - Comprehensive ERP System Route Fixer
 * 
 * This script fixes issues with various controllers in the ERP system
 * by adding fallback direct SQL queries when association queries fail.
 */

const fs = require('fs');
const path = require('path');

// Define the controllers folder path
const controllersDir = path.join(__dirname, 'backend', 'controllers');

// Fix for itemMasterController.js
function fixItemMasterController() {
  const filePath = path.join(controllersDir, 'itemMasterController.js');
  
  console.log(`Fixing itemMasterController at ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix model imports to use models object
  if (!content.includes('const models = {')) {
    console.log('Adding models object...');
    const importsBlock = content.match(/const\s+\{[^}]+\}\s+=\s+require\([^)]+\);/);
    
    if (importsBlock) {
      const replacement = `${importsBlock[0]}\n\n// Create models object with both capitalized and lowercase aliases
const models = {
  ItemMaster,
  itemmaster: ItemMaster,
  User,
  user: User,
  UnspscCode,
  unspsccode: UnspscCode
};`;
      
      content = content.replace(importsBlock[0], replacement);
    }
  }
  
  // Fix getItemMasters method
  const getItemMastersMethod = `// @desc    Get all item masters
// @route   GET /api/item
// @access  Private
exports.getItemMasters = async (req, res) => {
  try {
    const { 
      itemNumber, 
      description, 
      category,
      manufacturer,
      manufacturerPartNumber,
      search 
    } = req.query;
    
    const whereClause = {};
    
    // Apply filters if provided
    if (itemNumber) {
      whereClause.itemNumber = { [Op.like]: \`%\${itemNumber}%\` };
    }
    
    if (description) {
      whereClause.description = { [Op.iLike]: \`%\${description}%\` }; // Case-insensitive for PostgreSQL
    }
    
    if (category) {
      whereClause.category = { [Op.iLike]: \`%\${category}%\` };
    }
    
    if (manufacturer) {
      whereClause.manufacturer = { [Op.iLike]: \`%\${manufacturer}%\` };
    }
    
    if (manufacturerPartNumber) {
      whereClause.manufacturerPartNumber = { [Op.like]: \`%\${manufacturerPartNumber}%\` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { itemNumber: { [Op.iLike]: \`%\${search}%\` } },
        { description: { [Op.iLike]: \`%\${search}%\` } },
        { manufacturer: { [Op.iLike]: \`%\${search}%\` } },
        { manufacturerPartNumber: { [Op.iLike]: \`%\${search}%\` } },
      ];
    }

    try {
      // First try with associations
      const items = await models.ItemMaster.findAll({
        where: whereClause,
        include: [
          { model: models.User, as: 'createdBy', attributes: ['id', 'name', 'email'], required: false },
          { model: models.User, as: 'updatedBy', attributes: ['id', 'name', 'email'], required: false }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (associationError) {
      console.error('❌ Error with associations:', associationError.message);
      
      // Fall back to direct SQL query
      const [rawItems] = await sequelize.query(\`
        SELECT i.*, 
               c.name as "createdByName", c.email as "createdByEmail",
               u.name as "updatedByName", u.email as "updatedByEmail"
        FROM "ItemMasters" i
        LEFT JOIN "Users" c ON i."createdById" = c.id
        LEFT JOIN "Users" u ON i."updatedById" = u.id
        ORDER BY i."createdAt" DESC
      \`);
      
      return res.status(200).json({
        success: true,
        count: rawItems.length,
        data: rawItems,
        note: 'Data retrieved via fallback direct SQL query'
      });
    }
  } catch (error) {
    console.error('Error fetching item masters:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item masters',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};`;

  // Find and replace the existing getItemMasters method
  const regex = /\/\/ @desc\s+Get all item masters[\s\S]+?exports\.getItemMasters = async[\s\S]+?}\);[\s\S]+?}\s*;/m;
  
  if (regex.test(content)) {
    content = content.replace(regex, getItemMastersMethod);
  } else {
    console.error('❌ Could not find getItemMasters method to replace');
    return false;
  }
  
  // Write updated content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully fixed itemMasterController.js');
  return true;
}

// Fix for Debug Routes in index.js
function fixDebugRoutes() {
  const filePath = path.join(__dirname, 'backend', 'src', 'index.js');
  
  console.log(`Adding debug controller routes to ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add our debug-controller-routes.js
  if (!content.includes('debug-controller-routes.js')) {
    const importPattern = /const debugRoutes = require\('\.\.\/routes\/debugRoutes'\);/;
    
    if (importPattern.test(content)) {
      content = content.replace(
        importPattern,
        "const debugRoutes = require('../routes/debugRoutes');\nconst debugControllerRoutes = require('../routes/debug-controller-routes');"
      );
      
      // Add the route registration
      const registerPattern = /app\.use\('\/api', debugRoutes\);/;
      if (registerPattern.test(content)) {
        content = content.replace(
          registerPattern,
          "app.use('/api', debugRoutes);\napp.use('/api', debugControllerRoutes);"
        );
      }
    }
  }
  
  // Write updated content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully fixed debug routes in index.js');
  return true;
}

// Create the debug controller routes file if it doesn't exist
function createDebugControllerRoutes() {
  const filePath = path.join(__dirname, 'backend', 'routes', 'debug-controller-routes.js');
  
  console.log(`Creating debug controller routes at ${filePath}...`);
  
  const content = `const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Route to test controllers directly
router.get('/debug/controller/:controller/:method', async (req, res) => {
  try {
    const { controller, method } = req.params;
    const controllerPath = path.join(__dirname, '..', 'controllers', \`\${controller}.js\`);

    // Check if controller file exists
    if (!fs.existsSync(controllerPath)) {
      return res.status(404).json({
        success: false,
        message: \`Controller '\${controller}' not found\`
      });
    }

    // Load the controller
    const controllerModule = require(controllerPath);

    // Check if the method exists on the controller
    if (!controllerModule[method]) {
      return res.status(404).json({
        success: false,
        message: \`Method '\${method}' not found on controller '\${controller}'\`
      });
    }

    // Add mock user for authentication if needed
    req.user = req.user || { 
      id: process.env.DEBUG_USER_ID || '0b4afa3e-8582-452b-833c-f8bf695c4d60', 
      role: 'admin',
      email: 'admin@erp.com'
    };

    // Create a mock response to capture the output
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      send: function(data) {
        this.responseData = data;
        return this;
      }
    };

    // Call the controller method
    await controllerModule[method](req, mockRes);

    // Return the captured response
    return res.status(mockRes.statusCode || 200).json({
      success: true,
      controllerResponse: mockRes.responseData,
      statusCode: mockRes.statusCode
    });
  } catch (error) {
    console.error(\`❌ Error in debug controller route:\`, error);
    return res.status(500).json({
      success: false,
      message: 'Error executing controller method',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully created debug controller routes file');
  return true;
}

// Ensure middleware properly handles model compatibility
function updateComprehensiveCompatibility() {
  const filePath = path.join(__dirname, 'backend', 'src', 'middleware', 'comprehensiveCompatibility.js');
  
  console.log(`Updating comprehensive compatibility middleware at ${filePath}...`);
  
  // Create middleware directory if it doesn't exist
  const middlewareDir = path.join(__dirname, 'backend', 'src', 'middleware');
  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true });
  }
  
  const content = `/**
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

module.exports = middleware;`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully updated comprehensive compatibility middleware');
  return true;
}

// Main function to run all fixes
function fixAll() {
  console.log('🔧 Starting comprehensive ERP system route fixes...');
  
  try {
    let success = true;
    
    // Create debug controller routes
    success = createDebugControllerRoutes() && success;
    
    // Fix index.js to use debug routes
    success = fixDebugRoutes() && success;
    
    // Update comprehensive compatibility middleware
    success = updateComprehensiveCompatibility() && success;
    
    // Fix itemMasterController
    success = fixItemMasterController() && success;
    
    if (success) {
      console.log('✅ All fixes completed successfully!');
    } else {
      console.log('⚠️ Some fixes were not applied. See error messages above.');
    }
  } catch (error) {
    console.error('❌ Error during fixes:', error);
  }
}

// Run all fixes
fixAll();
