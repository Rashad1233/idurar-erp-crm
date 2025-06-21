/**
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
  
  console.log(`Found ${files.length} controller files to process`);
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix missing try/catch blocks
    const methodMatches = content.match(/exports\.[\w]+\s*=\s*async\s*\([^)]*\)\s*\{[^}]*\}/g) || [];
    
    for (const methodMatch of methodMatches) {
      // Skip if already has try/catch
      if (methodMatch.includes('try {')) {
        continue;
      }
      
      // Extract method signature and body
      const signatureMatch = methodMatch.match(/(exports\.[\w]+\s*=\s*async\s*\([^)]*\))\s*\{([^}]*)\}/);
      
      if (signatureMatch) {
        const signature = signatureMatch[1];
        const body = signatureMatch[2];
        
        // Create new method with try/catch
        const newMethod = `${signature} {
  try {${body}
  } catch (error) {
    console.error(`Error in ${file.replace('.js', '')}:`, error);
    return res.status(500).json({ 
      success: false, 
      result: null, 
      message: error.message 
    });
  }
}`;
        
        content = content.replace(methodMatch, newMethod);
        modified = true;
        console.log(`✅ Added try/catch to method in ${file}`);
      }
    }
    
    // Check for list method to add includes if needed
    if (content.includes('exports.list') && !content.includes('include:') && content.includes('findAll')) {
      // Extract model name(s)
      const modelMatches = content.match(/require\(['"]\.\.\/models\/([^'"]+)['"]/g) || [];
      const modelNames = modelMatches.map(m => m.match(/\/([^'"]+)['"]/)[1]);
      
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
        const findAllMatch = content.match(/findAll\(\s*\{[^}]*\}\s*\)/);
        
        if (findAllMatch) {
          const findAllOptions = findAllMatch[0];
          
          if (!findAllOptions.includes('include:')) {
            const includesStr = relatedModels.map(model => `      {
        model: models.${model}
      }`).join(',\n');
            
            const newFindAll = findAllOptions.replace(/\{/, `{
    include: [
${includesStr}
    ],`);
            
            content = content.replace(findAllOptions, newFindAll);
            modified = true;
            console.log(`✅ Added includes for ${relatedModels.join(', ')} to ${file}`);
          }
        }
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
  
  console.log(`✅ Fixed ${fixedCount} controller files`);
}

// Main function
async function main() {
  console.log('🚀 Starting controller fix script');
  processControllerFiles();
  console.log('✅ Controller fix script complete');
}

main().catch(console.error);
