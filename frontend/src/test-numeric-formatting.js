// Test script to validate numeric formatting fixes
console.log('Testing numeric parsing and formatting...');

// Test cases
const testCases = [
  { value: 123.456, expected: '123.46' },
  { value: '123.456', expected: '123.46' },
  { value: null, expected: '0.00' },
  { value: undefined, expected: '0.00' },
  { value: 'not-a-number', expected: '0.00' },
  { value: {}, expected: '0.00' },
  { value: 0, expected: '0.00' },
  { value: '0', expected: '0.00' }
];

// Test the parsing and formatting function
function formatValue(value) {
  const numValue = parseFloat(value) || 0;
  return numValue.toFixed(2);
}

// Run tests
let allPassed = true;
testCases.forEach((test, index) => {
  try {
    const result = formatValue(test.value);
    const passed = result === test.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'} - Input: ${JSON.stringify(test.value)}, Result: ${result}, Expected: ${test.expected}`);
    if (!passed) allPassed = false;
  } catch (err) {
    console.error(`Test ${index + 1}: ERROR - Input: ${JSON.stringify(test.value)}, Error: ${err.message}`);
    allPassed = false;
  }
});

console.log(`\nOverall test result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
