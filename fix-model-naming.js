/**
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
  
  console.log(`Found ${files.length} model files to process`);
  
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
      console.log(`⚠️ Skipping ${file} - not a standard Sequelize model`);
      continue;
    }
    
    // Fix tableName if missing
    if (!content.includes('tableName:')) {
      // Find the options object in sequelize.define
      const defineMatch = content.match(/sequelize.define\(['"][^'"]+['"],\s*{[^}]+}\s*,\s*({[^}]*})/);
      
      if (defineMatch) {
        const options = defineMatch[1];
        const expectedTableName = modelName.includes(/[A-Z]/) 
          ? modelName.replace(/([A-Z])/g, '_$1').toLowerCase() 
          : modelName;
        
        // Add tableName to options
        const newOptions = options.replace('{', `{
    tableName: '${expectedTableName}',`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(`✅ Added tableName: '${expectedTableName}' to ${file}`);
      }
    }
    
    // Fix timestamps if missing
    if (!content.includes('timestamps:')) {
      const optionsMatch = content.match(/({[^}]*})\s*\)/);
      
      if (optionsMatch) {
        const options = optionsMatch[1];
        const newOptions = options.replace(/}\s*$/, `,
    timestamps: true
}`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(`✅ Added timestamps: true to ${file}`);
      }
    }
    
    // Fix underscored if missing
    if (!content.includes('underscored:')) {
      const optionsMatch = content.match(/({[^}]*})\s*\)/);
      
      if (optionsMatch) {
        const options = optionsMatch[1];
        const newOptions = options.replace(/}\s*$/, `,
    underscored: true
}`);
        
        content = content.replace(options, newOptions);
        modified = true;
        console.log(`✅ Added underscored: true to ${file}`);
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`📝 Saved changes to ${file}`);
    } else {
      console.log(`✓ No changes needed for ${file}`);
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} model files`);
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
    const newImport = `const { patchModelInstance } = require('../src/model-compatibility-layer');
`;
    
    // Add after other imports
    const lastImportMatch = content.match(/require\([^)]+\);\n/g);
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
      const patchCode = `
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
`;

      content = content.replace('module.exports', patchCode + '
module.exports');
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
    const newImport = `const { patchModelInstance } = require('../src/model-compatibility-layer');
`;
    
    // Add after other imports
    const lastImportMatch = content.match(/require\([^)]+\);\n/g);
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
    const modelsForEachMatch = content.match(/Object\.keys\(db\)\s*\.\s*forEach\s*\([^}]+\}/);
    if (modelsForEachMatch) {
      const patchCode = `
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
});
`;

      // Add after other model operations
      content = content.replace('module.exports = db;', patchCode + '
module.exports = db;');
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
