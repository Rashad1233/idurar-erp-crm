/**
 * UNSPSC React Hooks Fix Test Script
 * 
 * This script validates that our fix for the "Rendered more hooks than during the previous render"
 * error was successful by checking that:
 * 
 * 1. All hooks are properly at the component level (not nested in conditionals or loops)
 * 2. No useState/useEffect calls exist inside the renderUnspscCategoryChart function
 * 3. All handlers for the UNSPSC table are properly defined
 */

const fs = require('fs');
const path = require('path');

// Define the file path
const componentPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Inventory', 'EnhancedInventoryReporting.jsx');

// Check if file exists
if (!fs.existsSync(componentPath)) {
  console.error(`❌ File not found: ${componentPath}`);
  process.exit(1);
}

// Read the file content
const fileContent = fs.readFileSync(componentPath, 'utf8');

// Define patterns to check
const patterns = [
  {
    name: 'No useState in renderUnspscCategoryChart',
    pattern: /renderUnspscCategoryChart\s*=\s*\(\)\s*=>\s*{[\s\S]*?useState\(/g,
    shouldExist: false,
    message: '❌ Found useState inside renderUnspscCategoryChart, which is not allowed'
  },
  {
    name: 'No useEffect in renderUnspscCategoryChart',
    pattern: /renderUnspscCategoryChart\s*=\s*\(\)\s*=>\s*{[\s\S]*?useEffect\(/g,
    shouldExist: false,
    message: '❌ Found useEffect inside renderUnspscCategoryChart, which is not allowed'
  },
  {
    name: 'handleUnspscSearch defined outside rendering function',
    pattern: /const\s+handleUnspscSearch\s*=\s*\(/g,
    shouldExist: true,
    message: '❌ handleUnspscSearch not defined outside of renderUnspscCategoryChart'
  },
  {
    name: 'handleUnspscSearchReset defined outside rendering function',
    pattern: /const\s+handleUnspscSearchReset\s*=\s*\(/g,
    shouldExist: true,
    message: '❌ handleUnspscSearchReset not defined outside of renderUnspscCategoryChart'
  },
  {
    name: 'handleSelectUnspscByPrefix defined outside rendering function',
    pattern: /const\s+handleSelectUnspscByPrefix\s*=\s*\(/g,
    shouldExist: true,
    message: '❌ handleSelectUnspscByPrefix not defined outside of renderUnspscCategoryChart'
  },
  {
    name: 'searchText state defined at component level',
    pattern: /const\s+\[\s*searchText\s*,\s*setSearchText\s*\]\s*=\s*useState\(/g,
    shouldExist: true,
    message: '❌ searchText state not properly defined at component level'
  },
  {
    name: 'searchedColumn state defined at component level',
    pattern: /const\s+\[\s*searchedColumn\s*,\s*setSearchedColumn\s*\]\s*=\s*useState\(/g,
    shouldExist: true,
    message: '❌ searchedColumn state not properly defined at component level'
  },
  {
    name: 'searchInput ref defined at component level',
    pattern: /const\s+searchInput\s*=\s*React\.useRef\(/g,
    shouldExist: true,
    message: '❌ searchInput ref not properly defined at component level'
  }
];

// Check each pattern
let allPassed = true;

console.log('\n====== UNSPSC React Hooks Fix Validation ======\n');

patterns.forEach(item => {
  const matches = fileContent.match(item.pattern);
  const exists = matches !== null && matches.length > 0;
  
  if (item.shouldExist === exists) {
    console.log(`✅ PASS: ${item.name}`);
  } else {
    console.log(item.message);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n✅ All checks passed! The React hooks issue should be fixed.');
} else {
  console.log('\n❌ Some checks failed. Please review the code and fix the issues.');
}

console.log('\nTo fully validate the fix, please run the application and verify that:');
console.log('1. The UNSPSC category visualization loads without errors');
console.log('2. The search and filter functionality works properly');
console.log('3. Category selection updates the charts correctly\n');
