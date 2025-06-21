// Debug script to test lazy loading of components
const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend', 'src');

// Find all route files that use lazyWithErrorHandling
const routeFiles = [
  'router/inventoryRoutes.jsx',
  'router/procurementRoutes.jsx',
  'router/routes.jsx',
  'router/warehouseRoutes.jsx',
  'router/supplierRoutes.jsx',
  'router/financeRoutes.jsx',
  'routes/InventoryRoutes.jsx'
];

console.log('🔍 Checking lazy loaded components...\n');

for (const routeFile of routeFiles) {
  const filePath = path.join(frontendPath, routeFile);
  
  if (fs.existsSync(filePath)) {
    console.log(`📁 Checking ${routeFile}:`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract lazy loaded components
      const lazyMatches = content.match(/const\s+(\w+)\s*=\s*lazyWithErrorHandling\(\s*\(\)\s*=>\s*import\(['"`]([^'"`]+)['"`]\)/g);
      
      if (lazyMatches) {
        lazyMatches.forEach(match => {
          const [, componentName, importPath] = match.match(/const\s+(\w+)\s*=\s*lazyWithErrorHandling\(\s*\(\)\s*=>\s*import\(['"`]([^'"`]+)['"`]\)/);
          
          // Check if the target file exists
          let resolvedPath = importPath;
          if (resolvedPath.startsWith('@/')) {
            resolvedPath = resolvedPath.replace('@/', '');
          }
          
          const targetFile = path.join(frontendPath, resolvedPath);
          const targetFileJsx = targetFile + '.jsx';
          const targetFileIndex = path.join(targetFile, 'index.jsx');
          
          let exists = false;
          let actualPath = '';
          
          if (fs.existsSync(targetFileJsx)) {
            exists = true;
            actualPath = targetFileJsx;
          } else if (fs.existsSync(targetFileIndex)) {
            exists = true;
            actualPath = targetFileIndex;
          } else if (fs.existsSync(targetFile + '.js')) {
            exists = true;
            actualPath = targetFile + '.js';
          }
          
          console.log(`  ├─ ${componentName} -> ${importPath}`);
          console.log(`  │  ${exists ? '✅' : '❌'} ${exists ? actualPath : 'FILE NOT FOUND'}`);
          
          if (exists) {
            // Check if the file has a proper default export
            try {
              const targetContent = fs.readFileSync(actualPath, 'utf8');
              const hasDefaultExport = targetContent.includes('export default') || targetContent.includes('module.exports');
              const hasFunctionExport = targetContent.match(/export\s+default\s+(function|class|\w+)/);
              
              console.log(`  │  ${hasDefaultExport ? '✅' : '❌'} Has default export`);
              console.log(`  │  ${hasFunctionExport ? '✅' : '❌'} Exports function/class`);
              
              // Check for syntax errors
              if (targetContent.includes('};};') || targetContent.includes('};}')) {
                console.log(`  │  ⚠️  Potential syntax error (double closing braces)`);
              }
              
            } catch (err) {
              console.log(`  │  ❌ Error reading file: ${err.message}`);
            }
          }
          console.log(`  │`);
        });
      } else {
        console.log(`  ├─ No lazy loaded components found`);
      }
      
    } catch (err) {
      console.log(`  ❌ Error reading ${routeFile}: ${err.message}`);
    }
    
    console.log('');
  } else {
    console.log(`❌ ${routeFile} does not exist\n`);
  }
}

console.log('🔍 Checking lazyLoadHelper...');
const lazyHelperPath = path.join(frontendPath, 'utils', 'lazyLoadHelper.jsx');
if (fs.existsSync(lazyHelperPath)) {
  try {
    const helperContent = fs.readFileSync(lazyHelperPath, 'utf8');
    console.log('✅ LazyLoadHelper exists');
    console.log('Content:');
    console.log(helperContent);
    
    // Check for syntax errors
    if (helperContent.includes('};};') || helperContent.includes('};}')) {
      console.log('⚠️  Potential syntax error in lazyLoadHelper');
    }
  } catch (err) {
    console.log(`❌ Error reading lazyLoadHelper: ${err.message}`);
  }
} else {
  console.log('❌ LazyLoadHelper does not exist');
}
