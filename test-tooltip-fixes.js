// Test script for the PurchaseRequisition component fixes
// Run this in your browser console to verify the fixes

(function() {
  console.log('🔍 Testing PurchaseRequisition Component Fixes');
  console.log('============================================');
  
  // Track component renders
  let renderCount = 0;
  let lastRenderTime = Date.now();
  let renderIntervals = [];
  
  // Function to log render information
  const trackRender = (componentName) => {
    renderCount++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime;
    renderIntervals.push(timeSinceLastRender);
    lastRenderTime = now;
    
    console.log(`${componentName} render #${renderCount} (${timeSinceLastRender}ms since last render)`);
    
    // Detect potential infinite loops
    if (renderIntervals.length >= 10) {
      const last10Intervals = renderIntervals.slice(-10);
      const avgInterval = last10Intervals.reduce((sum, interval) => sum + interval, 0) / 10;
      
      if (avgInterval < 100 && renderCount > 20) {
        console.error('⚠️ POTENTIAL INFINITE LOOP DETECTED!');
        console.error(`Average interval between last 10 renders: ${avgInterval.toFixed(2)}ms`);
      }
    }
  };
  
  // Function to monitor tooltip behavior
  const monitorTooltip = () => {
    console.log('🔍 Monitoring tooltip behavior...');
    
    // Find the tooltip element
    const tooltipTrigger = document.querySelector('.tooltip-icon-wrapper');
    if (!tooltipTrigger) {
      console.warn('❓ Tooltip trigger element not found');
      return;
    }
    
    // Monitor tooltip events
    console.log('✅ Found tooltip trigger element, monitoring interactions...');
    
    // Track hover events
    tooltipTrigger.addEventListener('mouseenter', () => {
      console.log('🖱️ Tooltip mouseenter event triggered');
      trackRender('Tooltip hover');
    });
    
    tooltipTrigger.addEventListener('mouseleave', () => {
      console.log('🖱️ Tooltip mouseleave event triggered');
      trackRender('Tooltip leave');
    });
    
    // Simulate hover to test
    console.log('🖱️ Simulating tooltip hover...');
    const mouseEnterEvent = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
    });
    tooltipTrigger.dispatchEvent(mouseEnterEvent);
    
    setTimeout(() => {
      const mouseLeaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
      });
      tooltipTrigger.dispatchEvent(mouseLeaveEvent);
      
      // Show results
      setTimeout(() => {
        const avgInterval = renderIntervals.reduce((sum, interval) => sum + interval, 0) / renderIntervals.length;
        
        console.log('\n📊 TOOLTIP TEST RESULTS');
        console.log('====================');
        console.log(`Total renders: ${renderCount}`);
        console.log(`Average interval: ${avgInterval.toFixed(2)}ms`);
        
        if (renderCount < 10 && avgInterval > 100) {
          console.log('✅ NO INFINITE LOOP DETECTED - Fix appears successful!');
        } else if (renderCount > 20 && avgInterval < 100) {
          console.error('❌ INFINITE LOOP LIKELY STILL PRESENT');
        } else {
          console.log('⚠️ INDETERMINATE - Please manually verify component behavior');
        }
      }, 2000);
    }, 1000);
  };
  
  // Monitor search behavior
  const monitorSearch = () => {
    console.log('🔍 Monitoring search input behavior...');
    
    // Find the search input
    const searchInput = document.querySelector('.search-container input');
    if (!searchInput) {
      console.warn('❓ Search input element not found');
      return;
    }
    
    console.log('✅ Found search input element, monitoring interactions...');
    
    // Reset tracking
    renderCount = 0;
    lastRenderTime = Date.now();
    renderIntervals = [];
    
    // Test search input
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      console.log('✅ Search test complete');
      monitorTooltip();
    }, 2000);
  };
  
  // Start monitoring
  monitorSearch();
})();
