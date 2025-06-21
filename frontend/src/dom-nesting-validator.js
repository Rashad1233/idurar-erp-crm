// DOM Nesting Validation Helper
// This script helps identify and fix common React DOM nesting validation errors

// Function to check for whitespace nodes in JSX component code
function findWhitespaceNodeIssues(code) {
  const issues = [];
  
  // Pattern to find multiline JSX with potential whitespace between tags
  const pattern = /<([a-zA-Z0-9.]+)[\s\S]*?>[\s\n]+<\/\1>/g;
  let match;
  
  while ((match = pattern.exec(code)) !== null) {
    issues.push({
      element: match[1],
      text: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
      position: match.index
    });
  }
  
  // Check for potential whitespace between adjacent JSX elements
  const jsxElements = code.match(/<\/[a-zA-Z0-9.]+>[\s\n]+<[a-zA-Z0-9.]+/g) || [];
  jsxElements.forEach(element => {
    issues.push({
      element: 'Adjacent JSX',
      text: element,
      position: code.indexOf(element)
    });
  });
  
  return issues;
}

// Function to suggest fixes for common React DOM nesting issues
function suggestFixes(issues) {
  return issues.map(issue => {
    if (issue.element === 'Adjacent JSX') {
      return {
        ...issue,
        fix: 'Remove whitespace between adjacent JSX elements:\n' +
             issue.text.replace(/>([\s\n]+)</g, '><')
      };
    } else {
      return {
        ...issue,
        fix: `Check for whitespace inside ${issue.element} component. ` +
             'Make sure there are no text nodes (including spaces, newlines) between tags.'
      };
    }
  });
}

// Example usage for a component with DOM nesting issues
const problematicCode = `
<Table.Summary.Row>
  <Table.Summary.Cell index={0} colSpan={3}>
    <strong>{translate('Page Total')}</strong>
  </Table.Summary.Cell>
  <Table.Summary.Cell index={1} align="right">
    <strong>{totalItems.toLocaleString()}</strong>
  </Table.Summary.Cell>
  <Table.Summary.Cell index={2} colSpan={1}></Table.Summary.Cell>                  
  <Table.Summary.Cell index={3} align="right">
    <strong>${typeof totalValue === 'number' ? totalValue.toFixed(2) : '0.00'}</strong>
  </Table.Summary.Cell>
  <Table.Summary.Cell index={4} colSpan={6}></Table.Summary.Cell>
</Table.Summary.Row>
`;

const issues = findWhitespaceNodeIssues(problematicCode);
const fixes = suggestFixes(issues);

console.log('DOM Nesting Validation Helper');
console.log('============================');
console.log(`Found ${issues.length} potential issues:`);

fixes.forEach((fix, index) => {
  console.log(`\nIssue ${index + 1}:`);
  console.log(`Element: ${fix.element}`);
  console.log(`Text: ${fix.text}`);
  console.log(`Suggestion: ${fix.fix}`);
});

// Output general guidelines for fixing React DOM nesting errors
console.log('\nGeneral Guidelines for Fixing DOM Nesting Validation Errors:');
console.log('1. Remove whitespace between adjacent JSX elements');
console.log('2. Make sure table cells (<td>, <th>) are only direct children of rows (<tr>)');
console.log('3. Make sure list items (<li>) are only direct children of lists (<ul>, <ol>)');
console.log('4. Avoid text nodes directly inside <table>, <tbody>, <thead>, <tfoot>, <tr>');
console.log('5. Use React Fragments (<> </>) to group elements without adding extra DOM nodes');
console.log('6. For ant-design Table components, ensure Summary.Row only contains Summary.Cell components');
