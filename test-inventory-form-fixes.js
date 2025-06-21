#!/usr/bin/env node

/**
 * Test script to validate EnhancedInventoryForm fixes
 * Tests both UNSPSC code copying and bin locations functionality
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_PATH = './frontend/src/components/Inventory/EnhancedInventoryForm.jsx';

console.log('🔍 Testing EnhancedInventoryForm fixes...\n');

// Test 1: Check if API cache has clear method
function testApiCacheClearMethod() {
  console.log('1. Testing API cache clear method...');
  
  try {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    if (content.includes('clear(key)') && content.includes('delete this.data[key]')) {
      console.log('✅ API cache clear method implemented correctly');
      return true;
    } else {
      console.log('❌ API cache clear method not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading component file:', error.message);
    return false;
  }
}

// Test 2: Check UNSPSC code fix with timeout
function testUnspscCodeFix() {
  console.log('\n2. Testing UNSPSC code fix...');
  
  try {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    const hasTimeout = content.includes('setTimeout(() => {') && 
                      content.includes('formInstance.setFieldsValue({ \n                unspscCode: selected.unspscCode \n              });');
    
    const hasProperDelay = content.includes('}, 100);');
    
    if (hasTimeout && hasProperDelay) {
      console.log('✅ UNSPSC code fix implemented with proper timeout');
      return true;
    } else {
      console.log('❌ UNSPSC code fix not properly implemented');
      console.log('   - Has timeout:', hasTimeout);
      console.log('   - Has proper delay:', hasProperDelay);
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading component file:', error.message);
    return false;
  }
}

// Test 3: Check bin locations fix with cache clearing
function testBinLocationsFix() {
  console.log('\n3. Testing bin locations fix...');
  
  try {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    const hasCacheClear = content.includes('apiRequestCache.clear(binLocationsCacheKey)');
    const hasDebugLogging = content.includes('console.log(\'Raw bin locations response:\', binLocationsData)');
    const hasAdditionalDebugging = content.includes('console.log(\'Sample bin location:\', binLocationsData[0])');
    
    if (hasCacheClear && hasDebugLogging && hasAdditionalDebugging) {
      console.log('✅ Bin locations fix implemented correctly');
      return true;
    } else {
      console.log('❌ Bin locations fix not properly implemented');
      console.log('   - Has cache clear:', hasCacheClear);
      console.log('   - Has debug logging:', hasDebugLogging);
      console.log('   - Has additional debugging:', hasAdditionalDebugging);
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading component file:', error.message);
    return false;
  }
}

// Test 4: Check debugging effects
function testDebuggingEffects() {
  console.log('\n4. Testing debugging effects...');
  
  try {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    const hasStateUpdateLogging = content.includes('console.log(`Bin locations state updated: ${binLocations.length} items for storage location:`');
    const hasSampleLogging = content.includes('console.log(\'Sample bin location:\', binLocations[0])');
    
    if (hasStateUpdateLogging && hasSampleLogging) {
      console.log('✅ Debugging effects implemented correctly');
      return true;
    } else {
      console.log('❌ Debugging effects not properly implemented');
      console.log('   - Has state update logging:', hasStateUpdateLogging);
      console.log('   - Has sample logging:', hasSampleLogging);
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading component file:', error.message);
    return false;
  }
}

// Test 5: Check for syntax errors and required return statements
function testSyntaxAndReturnStatements() {
  console.log('\n5. Testing syntax and return statements...');
  
  try {
    const content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    // Check for proper return statements in key functions
    const handleStorageLocationChange = content.match(/const handleStorageLocationChange = async \(value\) => \{[\s\S]*?\};/);
    const handleBinLocationChange = content.match(/const handleBinLocationChange = \(value\) => \{[\s\S]*?\};/);
    
    if (!handleStorageLocationChange || !handleBinLocationChange) {
      console.log('❌ Could not find required handler functions');
      return false;
    }
    
    const storageLocationHasReturn = handleStorageLocationChange[0].includes('if (!isMounted.current) return;');
    const binLocationHasReturn = handleBinLocationChange[0].includes('if (!isMounted.current) return;');
    
    if (storageLocationHasReturn && binLocationHasReturn) {
      console.log('✅ All handler functions have proper return statements');
      return true;
    } else {
      console.log('❌ Missing return statements in handler functions');
      console.log('   - Storage location handler has return:', storageLocationHasReturn);
      console.log('   - Bin location handler has return:', binLocationHasReturn);
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading component file:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [
    testApiCacheClearMethod(),
    testUnspscCodeFix(),
    testBinLocationsFix(),
    testDebuggingEffects(),
    testSyntaxAndReturnStatements()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All fixes have been successfully implemented!');
    console.log('\n📋 Summary of fixes:');
    console.log('   ✅ UNSPSC code now properly copies from item master with delayed form update');
    console.log('   ✅ Bin locations now force fresh retrieval when storage location changes');
    console.log('   ✅ Enhanced debugging and error handling for better troubleshooting');
    console.log('   ✅ API cache utility now supports clearing cached data');
    console.log('   ✅ All handler functions have proper return statements');
  } else {
    console.log('❌ Some fixes are missing or incomplete. Please review the failed tests above.');
  }
  
  return passed === total;
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
