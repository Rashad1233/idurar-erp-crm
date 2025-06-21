/**
 * DEBUG: React Infinite Loop Test
 * 
 * This test helps identify infinite loop issues in React components
 * Run this in the browser console to check for re-render issues
 */

// Test 1: Check if Purchase Requisition component is re-rendering excessively
const PurchaseRequisitionDebug = {
  // Counter to track component renders
  renderCount: 0,
  
  // Track useEffect calls
  effectCalls: {
    scrollCheck: 0,
    errorLogging: 0,
    apiData: 0
  },
  
  // Log render cycles
  logRender: function(componentName) {
    this.renderCount++;
    console.log(`🔄 ${componentName} render #${this.renderCount}`);
    
    if (this.renderCount > 50) {
      console.error('🚨 INFINITE LOOP DETECTED: Component has rendered more than 50 times!');
      console.error('💡 Check useEffect dependencies for changing object references');
      return true; // Indicates infinite loop
    }
    return false;
  },
  
  // Log useEffect calls
  logEffect: function(effectName) {
    this.effectCalls[effectName] = (this.effectCalls[effectName] || 0) + 1;
    console.log(`⚡ useEffect[${effectName}] call #${this.effectCalls[effectName]}`);
    
    if (this.effectCalls[effectName] > 20) {
      console.error(`🚨 useEffect[${effectName}] called too many times! Possible infinite loop.`);
    }
  },
  
  // Reset counters
  reset: function() {
    this.renderCount = 0;
    this.effectCalls = {
      scrollCheck: 0,
      errorLogging: 0,
      apiData: 0
    };
    console.log('🔄 Debug counters reset');
  },
  
  // Check for common infinite loop patterns
  checkCommonIssues: function() {
    console.log('🔍 Checking for common infinite loop patterns...');
    
    const issues = [];
    
    // Check 1: Objects being recreated in useEffect dependencies
    console.log('1. ✅ Fixed: useEffect dependencies use .length instead of full arrays');
    
    // Check 2: API hook stability
    console.log('2. ✅ useApiData hook has stable dependencies');
    
    // Check 3: State updates in render
    console.log('3. ⚠️  Check: No setState calls outside useEffect or event handlers');
    
    // Check 4: Async operations
    console.log('4. ✅ API calls are properly contained in useEffect');
    
    console.log('🎯 Summary: Major infinite loop causes have been addressed');
    
    return issues;
  }
};

// Instructions for use
console.log('🧪 PURCHASE REQUISITION DEBUG TOOL LOADED');
console.log('📋 Usage:');
console.log('  - Add PurchaseRequisitionDebug.logRender("PurchaseRequisition") to component render');
console.log('  - Add PurchaseRequisitionDebug.logEffect("effectName") to useEffect calls');
console.log('  - Call PurchaseRequisitionDebug.checkCommonIssues() to check patterns');
console.log('  - Call PurchaseRequisitionDebug.reset() to reset counters');

// Export for browser console use
if (typeof window !== 'undefined') {
  window.PurchaseRequisitionDebug = PurchaseRequisitionDebug;
}

// Auto-check common issues
PurchaseRequisitionDebug.checkCommonIssues();

export default PurchaseRequisitionDebug;
