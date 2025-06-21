const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configure Sequelize
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'idurar',
  username: 'postgres',
  password: 'postgres',
  dialect: 'postgres',
  logging: false
});

// Function to check all tables for naming convention issues
async function checkAllTablesNaming() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(`📋 Found ${tables.length} tables in database.`);
    
    const tableNames = tables.map(t => t.table_name);
    
    for (const tableName of tableNames) {
      // Get all columns in the table
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
      `);
      
      console.log(`\n🔍 Table: ${tableName}`);
      
      // Check for naming convention issues
      const camelCaseColumns = columns.filter(col => 
        col.column_name.includes(/[A-Z]/) && !col.column_name.includes('_')
      );
      
      const snakeCaseColumns = columns.filter(col => 
        col.column_name.includes('_')
      );
      
      const timestampColumns = columns.filter(col => 
        ['created_at', 'updated_at', 'deleted_at', 'createdAt', 'updatedAt', 'deletedAt'].includes(col.column_name)
      );
      
      // Check for critical columns that might be missing
      const hasCreatedAt = columns.some(col => col.column_name === 'created_at');
      const hasUpdatedAt = columns.some(col => col.column_name === 'updated_at');
      const hasCreatedAtCamel = columns.some(col => col.column_name === 'createdAt');
      const hasUpdatedAtCamel = columns.some(col => col.column_name === 'updatedAt');
      
      console.log(`  - Total columns: ${columns.length}`);
      console.log(`  - Snake_case columns: ${snakeCaseColumns.length}`);
      console.log(`  - CamelCase columns: ${camelCaseColumns.length}`);
      
      if (timestampColumns.length > 0) {
        console.log('  - Timestamp columns: ' + timestampColumns.map(c => c.column_name).join(', '));
      } else {
        console.log('  - ⚠️ No timestamp columns found');
      }
      
      // Report missing timestamp columns
      if (!hasCreatedAt && !hasCreatedAtCamel) {
        console.log('  - ❌ Missing created_at/createdAt column');
      }
      
      if (!hasUpdatedAt && !hasUpdatedAtCamel) {
        console.log('  - ❌ Missing updated_at/updatedAt column');
      }
      
      // Check for id column naming
      const idColumns = columns.filter(col => 
        col.column_name === 'id' || col.column_name.endsWith('_id')
      );
      
      if (idColumns.length > 0) {
        console.log('  - ID columns: ' + idColumns.map(c => c.column_name).join(', '));
      }
      
      // Look for status columns with different naming conventions
      const statusColumns = columns.filter(col => 
        col.column_name === 'status' || col.column_name === 'is_active' || 
        col.column_name === 'isActive' || col.column_name === 'is_deleted' ||
        col.column_name === 'isDeleted'
      );
      
      if (statusColumns.length > 0) {
        console.log('  - Status columns: ' + statusColumns.map(c => c.column_name).join(', '));
      }
    }
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

// Function to examine all models for naming issues
async function examineAllModels() {
  const modelsDir = path.join(__dirname, 'backend', 'models');
  
  if (!fs.existsSync(modelsDir)) {
    console.error('❌ Models directory not found');
    return;
  }
  
  // Get all model files
  const files = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js' && file !== 'sequelize.js');
  
  console.log(`\n🔍 Examining ${files.length} model files:`);
  
  const modelIssues = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(modelsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const issues = [];
      
      // Check for tableName definition
      const tableNameMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
      if (!tableNameMatch) {
        issues.push('No explicit tableName defined');
      }
      
      // Check for timestamp settings
      const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
      if (!timestampsMatch) {
        issues.push('No timestamps setting');
      }
      
      // Check for underscored setting
      const underscoredMatch = content.match(/underscored:\s*(true|false)/);
      if (!underscoredMatch) {
        issues.push('No underscored setting');
      }
      
      // Check for camelCase and snake_case mix in field definitions
      const fieldMatches = content.match(/([a-zA-Z0-9_]+):\s*{[^}]+}/g) || [];
      const fields = fieldMatches.map(m => m.split(':')[0].trim());
      
      const camelCaseFields = fields.filter(field => /[a-z][A-Z]/.test(field));
      const snakeCaseFields = fields.filter(field => field.includes('_'));
      
      if (camelCaseFields.length > 0 && snakeCaseFields.length > 0) {
        issues.push('Mixed camelCase and snake_case field naming');
      }
      
      // Check for compatibility layer usage
      const usesCompatibilityLayer = content.includes('model-compatibility-layer') || 
                                    content.includes('modelCompatibility');
      
      if (!usesCompatibilityLayer) {
        issues.push('Not using compatibility layer');
      }
      
      // Output findings
      console.log(`\n📄 ${file}:`);
      console.log(`  - Fields: ${fields.length}`);
      
      if (tableNameMatch) {
        console.log(`  - Table name: ${tableNameMatch[1]}`);
      }
      
      if (timestampsMatch) {
        console.log(`  - Timestamps: ${timestampsMatch[1]}`);
      }
      
      if (underscoredMatch) {
        console.log(`  - Underscored: ${underscoredMatch[1]}`);
      }
      
      if (issues.length > 0) {
        console.log(`  - ⚠️ Issues: ${issues.join(', ')}`);
        modelIssues.push({ file, issues });
      } else {
        console.log('  - ✅ No issues detected');
      }
    } catch (error) {
      console.error(`❌ Error examining ${file}:`, error.message);
    }
  }
  
  // Summary of models with issues
  if (modelIssues.length > 0) {
    console.log('\n⚠️ Models with issues:');
    modelIssues.forEach(({ file, issues }) => {
      console.log(`  - ${file}: ${issues.join(', ')}`);
    });
  }
}

// Function to examine all controllers for naming issues
async function examineAllControllers() {
  const controllersDir = path.join(__dirname, 'backend', 'controllers');
  
  if (!fs.existsSync(controllersDir)) {
    console.error('❌ Controllers directory not found');
    return;
  }
  
  // Get all controller files
  const files = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.js'));
  
  console.log(`\n🔍 Examining ${files.length} controller files:`);
  
  const controllerIssues = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(controllersDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const issues = [];
      
      // Check for error handling
      if (!content.includes('try {')) {
        issues.push('No try/catch blocks');
      }
      
      // Check for mixed naming conventions
      const camelCaseProperties = (content.match(/\.[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g) || [])
        .filter(match => !match.includes('.hasOwnProperty'));
      
      const snakeCaseProperties = content.match(/\.[a-z][a-zA-Z0-9]*_[a-zA-Z0-9]*/g) || [];
      
      if (camelCaseProperties.length > 0 && snakeCaseProperties.length > 0) {
        issues.push('Mixed camelCase and snake_case property access');
      }
      
      // Check for model usage
      const modelMatches = content.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/g) || [];
      const models = modelMatches.map(m => m.match(/\/([^'"]+)['"]\)/)[1]);
      
      // Check for direct database access that might bypass the compatibility layer
      const directDbAccess = content.includes('sequelize.query(');
      
      if (directDbAccess) {
        issues.push('Using direct sequelize.query()');
      }
      
      // Output findings
      console.log(`\n📄 ${file}:`);
      
      if (models.length > 0) {
        console.log(`  - Models used: ${models.join(', ')}`);
      } else {
        console.log('  - No models imported');
      }
      
      // Check for handler methods
      const handlerMatches = content.match(/exports\.([a-zA-Z0-9_]+)\s*=\s*async/g) || [];
      const handlers = handlerMatches.map(m => m.replace(/exports\.|=\s*async/g, '').trim());
      
      console.log(`  - Handler methods: ${handlers.length > 0 ? handlers.join(', ') : 'None'}`);
      
      if (issues.length > 0) {
        console.log(`  - ⚠️ Issues: ${issues.join(', ')}`);
        controllerIssues.push({ file, issues });
      } else {
        console.log('  - ✅ No issues detected');
      }
    } catch (error) {
      console.error(`❌ Error examining ${file}:`, error.message);
    }
  }
  
  // Summary of controllers with issues
  if (controllerIssues.length > 0) {
    console.log('\n⚠️ Controllers with issues:');
    controllerIssues.forEach(({ file, issues }) => {
      console.log(`  - ${file}: ${issues.join(', ')}`);
    });
  }
}

// Check if compatibility layer is properly implemented
async function checkCompatibilityLayer() {
  console.log('\n🔍 Checking compatibility layer implementation:');
  
  // Check if model compatibility layer exists
  const modelCompatibilityPath = path.join(__dirname, 'backend', 'src', 'model-compatibility-layer.js');
  const middlewarePath = path.join(__dirname, 'backend', 'src', 'middleware', 'modelCompatibility.js');
  
  let modelCompatibilityExists = false;
  let middlewareExists = false;
  
  if (fs.existsSync(modelCompatibilityPath)) {
    console.log('✅ model-compatibility-layer.js exists');
    modelCompatibilityExists = true;
    
    // Check content
    const content = fs.readFileSync(modelCompatibilityPath, 'utf8');
    
    console.log('📄 Analyzing model compatibility layer:');
    
    // Check for essential features
    if (content.includes('camelToSnake') || content.includes('camel_to_snake')) {
      console.log('  - ✅ Has camelCase to snake_case conversion');
    } else {
      console.log('  - ❌ Missing camelCase to snake_case conversion');
    }
    
    if (content.includes('snakeToCamel') || content.includes('snake_to_camel')) {
      console.log('  - ✅ Has snake_case to camelCase conversion');
    } else {
      console.log('  - ❌ Missing snake_case to camelCase conversion');
    }
  } else {
    console.log('❌ model-compatibility-layer.js not found');
  }
  
  if (fs.existsSync(middlewarePath)) {
    console.log('✅ modelCompatibility middleware exists');
    middlewareExists = true;
    
    // Check content
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    console.log('📄 Analyzing model compatibility middleware:');
    
    // Check for request/response handling
    if (content.includes('req.body')) {
      console.log('  - ✅ Processes request body');
    } else {
      console.log('  - ❌ Does not process request body');
    }
    
    if (content.includes('res.json') || content.includes('res.send')) {
      console.log('  - ✅ Processes response data');
    } else {
      console.log('  - ❌ Does not process response data');
    }
  } else {
    console.log('❌ modelCompatibility middleware not found');
  }
  
  // Check if app.js includes the middleware
  const appPath = path.join(__dirname, 'backend', 'src', 'app.js');
  
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    if (content.includes('modelCompatibility') || content.includes('model-compatibility')) {
      console.log('✅ App.js includes compatibility middleware');
    } else {
      console.log('❌ App.js does not include compatibility middleware');
    }
  } else {
    console.log('❌ App.js not found');
  }
  
  return { modelCompatibilityExists, middlewareExists };
}

// Create a comprehensive fix
async function createComprehensiveFix() {
  console.log('\n🔧 Creating comprehensive model compatibility fix:');
  
  const { modelCompatibilityExists, middlewareExists } = await checkCompatibilityLayer();
  
  // Create model compatibility layer if it doesn't exist
  if (!modelCompatibilityExists) {
    const modelCompatibilityPath = path.join(__dirname, 'backend', 'src', 'model-compatibility-layer.js');
    const modelCompatibilityContent = `/**
 * Model Compatibility Layer
 * 
 * This module provides utilities to handle both camelCase and snake_case
 * naming conventions in the database and models.
 */

/**
 * Convert camelCase string to snake_case
 * @param {string} str - The camelCase string to convert
 * @returns {string} The snake_case result
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => \`_\${letter.toLowerCase()}\`);
}

/**
 * Convert snake_case string to camelCase
 * @param {string} str - The snake_case string to convert
 * @returns {string} The camelCase result
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert an object's keys from camelCase to snake_case
 * @param {Object} obj - The object with camelCase keys
 * @returns {Object} New object with snake_case keys
 */
function convertKeysToSnakeCase(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  
  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = convertKeysToSnakeCase(obj[key]);
    return result;
  }, {});
}

/**
 * Convert an object's keys from snake_case to camelCase
 * @param {Object} obj - The object with snake_case keys
 * @returns {Object} New object with camelCase keys
 */
function convertKeysToCamelCase(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  
  return Object.keys(obj).reduce((result, key) => {
    if (key.includes('_')) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = convertKeysToCamelCase(obj[key]);
    } else {
      result[key] = convertKeysToCamelCase(obj[key]);
    }
    return result;
  }, {});
}

/**
 * Make sure an object has both camelCase and snake_case versions of each property
 * @param {Object} obj - The object to process
 * @returns {Object} Object with both naming conventions for each property
 */
function ensureBothCases(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(ensureBothCases);
  }
  
  const result = { ...obj };
  
  // Process all keys to ensure both cases exist
  Object.keys(obj).forEach(key => {
    // Skip if already processed or special Sequelize properties
    if (key.startsWith('_') || key === 'isNewRecord' || key === 'sequelize') {
      return;
    }
    
    const value = obj[key];
    
    // Handle nested objects/arrays
    if (value && typeof value === 'object') {
      result[key] = ensureBothCases(value);
    }
    
    // Add snake_case version if key is camelCase
    if (/[a-z][A-Z]/.test(key) && !key.includes('_')) {
      const snakeKey = camelToSnake(key);
      if (!(snakeKey in result)) {
        result[snakeKey] = value;
      }
    }
    
    // Add camelCase version if key is snake_case
    if (key.includes('_')) {
      const camelKey = snakeToCamel(key);
      if (!(camelKey in result)) {
        result[camelKey] = value;
      }
    }
  });
  
  return result;
}

/**
 * Patch Sequelize model instances to handle both naming conventions
 * @param {Object} modelInstance - Sequelize model instance
 * @returns {Object} Patched model instance
 */
function patchModelInstance(modelInstance) {
  if (!modelInstance || typeof modelInstance !== 'object') {
    return modelInstance;
  }
  
  // Skip if not a Sequelize instance
  if (!modelInstance.dataValues) {
    return modelInstance;
  }
  
  // Create a proxy that will handle both naming conventions
  return new Proxy(modelInstance, {
    get(target, prop) {
      if (typeof prop === 'string') {
        // Check if the property exists
        if (prop in target) {
          return target[prop];
        }
        
        // Try snake_case version
        if (/[a-z][A-Z]/.test(prop)) {
          const snakeCase = camelToSnake(prop);
          if (snakeCase in target) {
            return target[snakeCase];
          }
        }
        
        // Try camelCase version
        if (prop.includes('_')) {
          const camelCase = snakeToCamel(prop);
          if (camelCase in target) {
            return target[camelCase];
          }
        }
      }
      
      return target[prop];
    },
    
    set(target, prop, value) {
      if (typeof prop === 'string') {
        // Set both versions
        target[prop] = value;
        
        // Also set snake_case version if camelCase
        if (/[a-z][A-Z]/.test(prop)) {
          const snakeCase = camelToSnake(prop);
          target[snakeCase] = value;
        }
        
        // Also set camelCase version if snake_case
        if (prop.includes('_')) {
          const camelCase = snakeToCamel(prop);
          target[camelCase] = value;
        }
      } else {
        target[prop] = value;
      }
      
      return true;
    }
  });
}

module.exports = {
  camelToSnake,
  snakeToCamel,
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  ensureBothCases,
  patchModelInstance
};`;

    fs.writeFileSync(modelCompatibilityPath, modelCompatibilityContent);
    console.log('✅ Created model-compatibility-layer.js');
  }
  
  // Create middleware if it doesn't exist
  if (!middlewareExists) {
    const middlewareDir = path.join(__dirname, 'backend', 'src', 'middleware');
    
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    const middlewarePath = path.join(middlewareDir, 'modelCompatibility.js');
    const middlewareContent = `/**
 * Model Compatibility Middleware
 * 
 * This middleware ensures request and response data works with both
 * camelCase and snake_case naming conventions.
 */

const { convertKeysToCamelCase, convertKeysToSnakeCase, ensureBothCases } = require('../model-compatibility-layer');

/**
 * Middleware to handle model naming compatibility
 */
function modelCompatibility(req, res, next) {
  // Store the original json method
  const originalJson = res.json;
  
  // Process request body if it exists
  if (req.body && typeof req.body === 'object') {
    // Ensure body has both camelCase and snake_case properties
    req.body = ensureBothCases(req.body);
  }
  
  // Override json method to process response data
  res.json = function(data) {
    // Apply both naming conventions to response data
    const processedData = ensureBothCases(data);
    
    // Call the original json method with processed data
    return originalJson.call(this, processedData);
  };
  
  next();
}

module.exports = modelCompatibility;`;

    fs.writeFileSync(middlewarePath, middlewareContent);
    console.log('✅ Created modelCompatibility.js middleware');
  }
  
  // Update app.js to include the middleware if needed
  const appPath = path.join(__dirname, 'backend', 'src', 'app.js');
  
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    if (!appContent.includes('modelCompatibility')) {
      // Find a good spot to add the middleware (after other middleware, before routes)
      const expressLines = appContent.split('\n');
      let middlewareIndex = -1;
      
      // Find where other middleware is being used
      for (let i = 0; i < expressLines.length; i++) {
        if (expressLines[i].includes('app.use(') && 
            !expressLines[i].includes('router') && 
            !expressLines[i].includes('/api')) {
          middlewareIndex = i;
        }
      }
      
      if (middlewareIndex > -1) {
        // Add require statement at the top
        const requireStatements = expressLines.filter(line => line.includes('require('));
        const lastRequireIndex = expressLines.indexOf(requireStatements[requireStatements.length - 1]);
        
        expressLines.splice(lastRequireIndex + 1, 0, 
          "const modelCompatibility = require('./middleware/modelCompatibility');");
        
        // Add middleware usage
        expressLines.splice(middlewareIndex + 1, 0, 
          "// Apply model compatibility middleware for camelCase/snake_case support",
          "app.use(modelCompatibility);");
        
        appContent = expressLines.join('\n');
        fs.writeFileSync(appPath, appContent);
        console.log('✅ Updated app.js to use compatibility middleware');
      } else {
        console.log('⚠️ Could not determine where to add middleware in app.js');
      }
    }
  }
  
  // Create a patch script to fix models
  const patchModelsPath = path.join(__dirname, 'fix-model-naming.js');
  const patchModelsContent = `/**
 * Fix Model Naming Conventions
 * 
 * This script patches all Sequelize models to ensure they:
 * 1. Have explicit tableName definitions
 * 2. Have proper timestamps setting
 * 3. Use proper underscored option
 * 4. Work with both camelCase and snake_case
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'backend', 'models');

// Skip these files
const skipFiles = ['index.js', 'sequelize.js'];

// Process all model files
function processModelFiles() {
  console.log('🔧 Processing model files...');
  
  if (!fs.existsSync(modelsDir)) {
    console.error('❌ Models directory not found at:', modelsDir);
    return;
  }
  
  const files = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.js') && !skipFiles.includes(file));
  
  console.log(\`Found \${files.length} model files to process\`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Model name is the file name without .js, with first letter uppercase
    const modelName = file.replace('.js', '');
    const modelNameUpper = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    
    // Check if model definition exists
    if (!content.includes('sequelize.define')) {
      console.log(\`⚠️ Skipping \${file} - not a standard Sequelize model\`);
      continue;
    }
    
    // Fix tableName if missing
    if (!content.includes('tableName:')) {
      // Find the options object in sequelize.define
      const defineMatch = content.match(/sequelize\.define\\(['"][^'"]+['"],\\s*{[^}]+}\\s*,\\s*({[^}]*})/);
      
      if (defineMatch) {
        const options = defineMatch[1];
        const expectedTableName = modelName.includes(/[A-Z]/) 
          ? modelName.replace(/([A-Z])/g, '_$1').toLowerCase() 
          : modelName;
        
        // Add tableName to options
        const newOptions = options.replace('{', \`{
    tableName: '\${expectedTableName}',\`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(\`✅ Added tableName: '\${expectedTableName}' to \${file}\`);
      }
    }
    
    // Fix timestamps if missing
    if (!content.includes('timestamps:')) {
      const optionsMatch = content.match(/({[^}]*})\\s*\\)/);
      
      if (optionsMatch) {
        const options = optionsMatch[1];
        const newOptions = options.replace(/}\\s*$/, \`,
    timestamps: true
}\`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(\`✅ Added timestamps: true to \${file}\`);
      }
    }
    
    // Fix underscored if missing
    if (!content.includes('underscored:')) {
      const optionsMatch = content.match(/({[^}]*})\\s*\\)/);
      
      if (optionsMatch) {
        const options = optionsMatch[1];
        const newOptions = options.replace(/}\\s*$/, \`,
    underscored: true
}\`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(\`✅ Added underscored: true to \${file}\`);
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(\`📝 Saved changes to \${file}\`);
    } else {
      console.log(\`✓ No changes needed for \${file}\`);
    }
  }
  
  console.log(\`✅ Fixed \${fixedCount} model files\`);
}

// Update Sequelize instance to support both naming conventions
function updateSequelizeInstance() {
  const sequelizePath = path.join(modelsDir, 'sequelize.js');
  
  if (!fs.existsSync(sequelizePath)) {
    console.log('⚠️ sequelize.js not found, looking for index.js...');
    
    const indexPath = path.join(modelsDir, 'index.js');
    if (fs.existsSync(indexPath)) {
      updateSequelizeInIndex(indexPath);
    } else {
      console.error('❌ Neither sequelize.js nor index.js found');
    }
    return;
  }
  
  console.log('🔧 Updating sequelize.js...');
  
  let content = fs.readFileSync(sequelizePath, 'utf8');
  let modified = false;
  
  // Add compatibility layer import if needed
  if (!content.includes('model-compatibility-layer')) {
    const newImport = \`const { patchModelInstance } = require('../src/model-compatibility-layer');\n\`;
    
    // Add after other imports
    const lastImportMatch = content.match(/require\\([^)]+\\);\\n/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + newImport);
      modified = true;
      console.log('✅ Added compatibility layer import');
    }
  }
  
  // Patch model instances
  if (!content.includes('patchModelInstance')) {
    // Look for where Sequelize is exported
    if (content.includes('module.exports')) {
      // Add patching before export
      const patchCode = \`
// Apply compatibility layer to all model instances
const originalModelFn = sequelize.model.bind(sequelize);
sequelize.model = function(...args) {
  const model = originalModelFn(...args);
  
  // Patch the model's build and create methods
  const originalBuild = model.build.bind(model);
  model.build = function(...buildArgs) {
    const instance = originalBuild(...buildArgs);
    return patchModelInstance(instance);
  };
  
  const originalCreate = model.create.bind(model);
  model.create = async function(...createArgs) {
    const instance = await originalCreate(...createArgs);
    return patchModelInstance(instance);
  };
  
  return model;
};
\`;

      content = content.replace('module.exports', patchCode + '\nmodule.exports');
      modified = true;
      console.log('✅ Added model instance patching');
    }
  }
  
  // Save changes if modified
  if (modified) {
    fs.writeFileSync(sequelizePath, content);
    console.log('📝 Saved changes to sequelize.js');
  } else {
    console.log('✓ No changes needed for sequelize.js');
  }
}

// Update Sequelize in index.js
function updateSequelizeInIndex(indexPath) {
  console.log('🔧 Updating index.js...');
  
  let content = fs.readFileSync(indexPath, 'utf8');
  let modified = false;
  
  // Add compatibility layer import if needed
  if (!content.includes('model-compatibility-layer')) {
    const newImport = \`const { patchModelInstance } = require('../src/model-compatibility-layer');\n\`;
    
    // Add after other imports
    const lastImportMatch = content.match(/require\\([^)]+\\);\\n/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + newImport);
      modified = true;
      console.log('✅ Added compatibility layer import to index.js');
    }
  }
  
  // Add patching code
  if (!content.includes('patchModelInstance')) {
    // Find where models are processed
    const modelsForEachMatch = content.match(/Object\\.keys\\(db\\)\\s*\\.\\s*forEach\\s*\\([^}]+\\}/);
    if (modelsForEachMatch) {
      const patchCode = \`
// Apply compatibility layer patching
Object.keys(db).forEach(modelName => {
  if (db[modelName].prototype) {
    // Store original build method
    const originalBuild = db[modelName].build.bind(db[modelName]);
    db[modelName].build = function(...args) {
      const instance = originalBuild(...args);
      return patchModelInstance(instance);
    };
    
    // Store original create method
    const originalCreate = db[modelName].create.bind(db[modelName]);
    db[modelName].create = async function(...args) {
      const instance = await originalCreate(...args);
      return patchModelInstance(instance);
    };
  }
});\n\`;

      // Add after other model operations
      content = content.replace('module.exports = db;', patchCode + '\nmodule.exports = db;');
      modified = true;
      console.log('✅ Added model instance patching to index.js');
    }
  }
  
  // Save changes if modified
  if (modified) {
    fs.writeFileSync(indexPath, content);
    console.log('📝 Saved changes to index.js');
  } else {
    console.log('✓ No changes needed for index.js');
  }
}

// Main function
async function main() {
  console.log('🚀 Starting model naming fix script');
  processModelFiles();
  updateSequelizeInstance();
  console.log('✅ Model naming fix script complete');
}

main().catch(console.error);
`;

  fs.writeFileSync(patchModelsPath, patchModelsContent);
  console.log('✅ Created fix-model-naming.js');
  
  // Create a controller fix script
  const fixControllersPath = path.join(__dirname, 'fix-controllers.js');
  const fixControllersContent = `/**
 * Fix Controller Naming Conventions
 * 
 * This script analyzes and fixes controllers to:
 * 1. Add proper error handling
 * 2. Handle both camelCase and snake_case property access
 * 3. Add includes for related models where needed
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'backend', 'controllers');

// Process all controller files
function processControllerFiles() {
  console.log('🔧 Processing controller files...');
  
  if (!fs.existsSync(controllersDir)) {
    console.error('❌ Controllers directory not found at:', controllersDir);
    return;
  }
  
  const files = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js');
  
  console.log(\`Found \${files.length} controller files to process\`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix missing try/catch blocks
    const methodMatches = content.match(/exports\\.[\\w]+\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*\\}/g) || [];
    
    for (const methodMatch of methodMatches) {
      // Skip if already has try/catch
      if (methodMatch.includes('try {')) {
        continue;
      }
      
      // Extract method signature and body
      const signatureMatch = methodMatch.match(/(exports\\.[\\w]+\\s*=\\s*async\\s*\\([^)]*\\))\\s*\\{([^}]*)\\}/);
      
      if (signatureMatch) {
        const signature = signatureMatch[1];
        const body = signatureMatch[2];
        
        // Create new method with try/catch
        const newMethod = \`\${signature} {
  try {\${body}
  } catch (error) {
    console.error(\`Error in \${file.replace('.js', '')}:\`, error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message 
    });
  }
}\`;
        
        content = content.replace(methodMatch, newMethod);
        modified = true;
        console.log(\`✅ Added try/catch to method in \${file}\`);
      }
    }
    
    // Check for list method to add includes if needed
    if (content.includes('exports.list') && !content.includes('include:') && content.includes('findAll')) {
      // Extract model name(s)
      const modelMatches = content.match(/require\\(['"]\\.\\.\\/models\\/([^'"]+)['"]/g) || [];
      const modelNames = modelMatches.map(m => m.match(/\\/([^'"]+)['"]/)[1]);
      
      // Find related models from file name
      const controllerName = file.replace('Controller.js', '');
      const relatedModels = [];
      
      // Common model relationships
      if (controllerName === 'inventory') {
        relatedModels.push('Item');
      } else if (controllerName === 'purchaseRequisition') {
        relatedModels.push('Supplier');
      } else if (controllerName === 'supplier') {
        // No obvious relation
      }
      
      if (relatedModels.length > 0 && content.includes('findAll')) {
        // Add includes to findAll
        const findAllMatch = content.match(/findAll\\(\\s*\\{[^}]*\\}\\s*\\)/);
        
        if (findAllMatch) {
          const findAllOptions = findAllMatch[0];
          
          if (!findAllOptions.includes('include:')) {
            const includesStr = relatedModels.map(model => \`      {
        model: models.\${model}
      }\`).join(',\\n');
            
            const newFindAll = findAllOptions.replace(/\\{/, \`{
    include: [
\${includesStr}
    ],\`);
            
            content = content.replace(findAllOptions, newFindAll);
            modified = true;
            console.log(\`✅ Added includes for \${relatedModels.join(', ')} to \${file}\`);
          }
        }
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(\`📝 Saved changes to \${file}\`);
    } else {
      console.log(\`✓ No changes needed for \${file}\`);
    }
  }
  
  console.log(\`✅ Fixed \${fixedCount} controller files\`);
}

// Main function
async function main() {
  console.log('🚀 Starting controller fix script');
  processControllerFiles();
  console.log('✅ Controller fix script complete');
}

main().catch(console.error);
`;

  fs.writeFileSync(fixControllersPath, fixControllersContent);
  console.log('✅ Created fix-controllers.js');
  
  // Create an all-in-one fix script
  const allInOnePath = path.join(__dirname, 'fix-api-endpoints.ps1');
  const allInOneContent = `# Comprehensive API Endpoints Fix Script

Write-Host "🚀 Starting comprehensive API endpoint fixes..." -ForegroundColor Cyan

# Step 1: Make sure the compatibility layer is in place
Write-Host "Step 1: Ensuring compatibility layer is properly implemented..." -ForegroundColor Yellow
node ./create-compatibility-layer.js

# Step 2: Fix model naming conventions
Write-Host "Step 2: Fixing model naming conventions..." -ForegroundColor Yellow
node ./fix-model-naming.js

# Step 3: Fix controllers
Write-Host "Step 3: Fixing controllers..." -ForegroundColor Yellow
node ./fix-controllers.js

# Step 4: Fix database tables
Write-Host "Step 4: Fixing database tables..." -ForegroundColor Yellow
node ./fix-all-tables.js

# Step 5: Restart the server
Write-Host "Step 5: Restarting the server..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
cd ./backend
npm start &

Write-Host "✅ All fixes have been applied. The server should now be restarting." -ForegroundColor Green
Write-Host "Please test the API endpoints to verify they are working correctly." -ForegroundColor Green
`;

  fs.writeFileSync(allInOnePath, allInOneContent);
  console.log('✅ Created fix-api-endpoints.ps1');
}

// Main function
async function main() {
  console.log('🚀 Starting model compatibility analysis');
  await checkAllTablesNaming();
  await examineAllModels();
  await examineAllControllers();
  await createComprehensiveFix();
  console.log('\n✅ Analysis complete');
  sequelize.close();
}

main().catch(console.error);
