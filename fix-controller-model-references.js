const fs = require('fs');
const path = require('path');

// Path to controllers directory
const controllersDir = path.join(__dirname, 'backend', 'controllers');

// Function to process controllers
function processControllers() {
  // Get all controller files
  const files = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.js'));
  
  console.log(`🔍 Processing ${files.length} controller files...`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add models object with aliases
    if (!content.includes('const models = {') && 
        (content.includes('PurchaseRequisition') || 
         content.includes('Supplier') || 
         content.includes('Inventory') || 
         content.includes('User'))) {
      
      // Find the model imports
      const modelImports = content.match(/const\s+(\w+)\s+=\s+require\(['"]\.\.\/models\/(\w+)['"]\)/g) || [];
      
      if (modelImports.length > 0) {
        // Extract the model variables
        const modelsMap = {};
        modelImports.forEach(imp => {
          const match = imp.match(/const\s+(\w+)\s+=\s+require\(['"]\.\.\/models\/(\w+)['"]\)/);
          if (match) {
            modelsMap[match[1]] = match[2];
          }
        });
        
        // Create models object code
        const modelsObjectCode = `
// Create models object with both capitalized and lowercase aliases
const models = {
  ${Object.entries(modelsMap).map(([varName, modelName]) => {
    return `${varName},
  ${modelName.toLowerCase()}: ${varName},
  ${modelName}: ${varName},`;
  }).join('\n  ')}
};
`;
        
        // Insert models object after the last require statement
        const lastRequireIndex = content.lastIndexOf('require(');
        const insertPosition = content.indexOf(';', lastRequireIndex) + 1;
        
        content = content.slice(0, insertPosition) + modelsObjectCode + content.slice(insertPosition);
        modified = true;
        console.log(`✅ Added models object to ${file}`);
      }
    }
    
    // Replace model references in findAll, findOne, create, update, etc.
    const modelOperations = [
      'findAll', 'findOne', 'findByPk', 'create', 'update', 'destroy',
      'count', 'findAndCountAll', 'findOrCreate', 'findOrBuild'
    ];
    
    modelOperations.forEach(operation => {
      // Find direct model references like PurchaseRequisition.findAll
      const regex = new RegExp(`(PurchaseRequisition|Supplier|Inventory|User)\\.${operation}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, (match, modelName) => {
          return `models.${modelName}.${operation}`;
        });
        modified = true;
        console.log(`✅ Replaced direct model references in ${file} for ${operation}`);
      }
    });
    
    // Patch the 500 error handler to include more details
    if (content.includes('catch (error)') && !content.includes('error.message')) {
      content = content.replace(
        /catch\s*\(error\)\s*{\s*(?:console\.error\([^)]*\);)?\s*(?:return\s+)?res\.status\(500\)\.json\(\s*{\s*([^}]*)}\s*\)/g,
        (match, inner) => {
          // Check if inner already has success and result properties
          let props = inner.trim();
          if (!props.includes('success')) {
            props += 'success: false,\n      ';
          }
          if (!props.includes('result')) {
            props += 'result: null,\n      ';
          }
          if (!props.includes('message')) {
            props += 'message: error.message,\n      ';
          }
          if (!props.includes('error')) {
            props += 'error: process.env.NODE_ENV === "development" ? error.stack : undefined\n    ';
          }
          
          return `catch (error) {
    console.error('Error in ${file}:', error);
    return res.status(500).json({
      ${props}
    })`;
        }
      );
      modified = true;
      console.log(`✅ Enhanced error handler in ${file}`);
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
  
  console.log(`✅ Fixed ${fixedCount} controller files`);
}

// Main function
async function main() {
  console.log('🚀 Starting controller fix script');
  processControllers();
  console.log('✅ Controller fix script complete');
}

main().catch(console.error);
