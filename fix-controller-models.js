const fs = require('fs');
const path = require('path');

// Path to controllers directory
const controllersDir = path.join(__dirname, 'backend', 'controllers');

// Function to fix controller models references
function fixControllerModels(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if the file already has a models object
    const hasModelsObject = content.includes('const models = {');
    
    // Check if it has incorrect references like models.models.X
    const hasIncorrectReferences = content.includes('models.models.');
    
    // If there are incorrect references, fix them
    if (hasIncorrectReferences) {
      content = content.replace(/models\.models\./g, 'models.');
      modified = true;
      console.log(`  Fixed incorrect 'models.models.' references`);
    }
    
    // If the file needs a models object but doesn't have one
    if (!hasModelsObject && (content.includes('models.') || content.includes('await models'))) {
      // Find required models from the require statement
      const modelRequireMatch = content.match(/const\s*{\s*([\w\s,]+)\s*}\s*=\s*require\(['"'"]\.\.\/models\/sequelize['"'"]\);/);
      
      if (modelRequireMatch) {
        const modelsImported = modelRequireMatch[1].split(',').map(m => m.trim()).filter(m => m && m !== 'sequelize');
        
        // Create models object definition
        const modelsObjectDef = `
// Create models object with both capitalized and lowercase aliases
const models = {
  ${modelsImported.map(model => `${model},
  ${model.toLowerCase()}: ${model}`).join(',\n  ')}
};`;
        
        // Insert the models object after the require statement
        const requireEndIndex = content.indexOf(';', content.indexOf("require('../models/sequelize')")) + 1;
        content = content.slice(0, requireEndIndex) + modelsObjectDef + content.slice(requireEndIndex);
        
        modified = true;
        console.log(`  Added models object with ${modelsImported.length} models`);
      }
    }
    
    // If there are multiple models objects, fix them
    if (content.match(/const\s+models\s*=\s*{/g)?.length > 1) {
      // Find the first models definition
      const firstModelsDef = content.match(/const\s+models\s*=\s*{[^}]*}/s)[0];
      
      // Remove other model definitions
      const multipleDefPattern = /const\s+models\s*=\s*{[^}]*}/gs;
      let matches;
      let count = 0;
      
      while ((matches = multipleDefPattern.exec(content)) !== null) {
        count++;
        if (count > 1) {
          content = content.replace(matches[0], '');
          modified = true;
          console.log(`  Removed duplicate models definition`);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✓ No changes needed in ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Main function to process all controller files
function main() {
  console.log('🔍 Looking for controller files...');
  
  // Get all controller files
  const files = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('Controller.js'));
  
  console.log(`Found ${files.length} controller files`);
  
  // Process each file
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(controllersDir, file);
    if (fixControllerModels(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} controller files`);
}

// Run the main function
main();
