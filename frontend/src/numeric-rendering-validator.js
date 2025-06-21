// Numeric Rendering Validator
// This script helps identify and fix potential toFixed() related issues in React components

const fs = require('fs');
const path = require('path');

// Directories to scan
const pagesDir = path.join(__dirname, '../pages');

// Pattern to find toFixed() usage in render functions
const toFixedPattern = /render\s*:\s*\(([^)]*)\)\s*=>\s*.*?toFixed\s*\(/g;
// Pattern to find potentially unsafe .toFixed() usage
const unsafeToFixedPattern = /(?<!parseFloat\s*\([^)]*\)|\btypeof\s+[^=]*===\s*['"]number['"]\s*\?)\s*\.\s*toFixed\s*\(/g;

// Function to scan a file for potential toFixed() issues
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Find all render functions with toFixed()
    let match;
    while ((match = toFixedPattern.exec(content)) !== null) {
      const renderFunc = content.substring(match.index, match.index + 200); // Get some context
      
      // Check if the toFixed usage is potentially unsafe
      if (unsafeToFixedPattern.test(renderFunc)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        issues.push({
          type: 'unsafe-tofixed',
          line: lineNumber,
          context: renderFunc.substring(0, renderFunc.indexOf(')')+1) + '...',
          suggestion: 'Use parseFloat() before calling toFixed() or check value type'
        });
      }
    }
    
    return { filePath, issues };
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return { filePath, issues: [], error: error.message };
  }
}

// Function to recursively scan directories
function scanDirectory(dir) {
  const results = [];
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...scanDirectory(filePath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const scanResult = scanFile(filePath);
      if (scanResult.issues.length > 0) {
        results.push(scanResult);
      }
    }
  }
  
  return results;
}

// Scan all pages
console.log('Scanning pages for potential toFixed() issues...');
const results = scanDirectory(pagesDir);

// Display results
console.log('\nResults:');
console.log('=========');

if (results.length === 0) {
  console.log('No issues found! All components are using toFixed() safely.');
} else {
  console.log(`Found ${results.length} files with potential issues:`);
  
  results.forEach(result => {
    console.log(`\nFile: ${path.relative(path.join(__dirname, '..'), result.filePath)}`);
    
    result.issues.forEach(issue => {
      console.log(`  Line ${issue.line}: ${issue.type}`);
      console.log(`  Context: ${issue.context}`);
      console.log(`  Suggestion: ${issue.suggestion}`);
    });
  });
  
  console.log('\nRecommended fix pattern:');
  console.log('```jsx');
  console.log('render: (value) => {');
  console.log('  const numValue = parseFloat(value) || 0;');
  console.log('  return `$${numValue.toFixed(2)}`;');
  console.log('}');
  console.log('```');
}

console.log('\nCompleted scan!');
