// Final Comprehensive Test for Tooltip Infinite Loop Fixes
// This script checks both the search input tooltip and the table header tooltips

(function() {
  console.log('🔍 RUNNING COMPREHENSIVE TOOLTIP INFINITE LOOP TEST');
  console.log('===================================================');
  
  // 1. Test if the component is still rendering too much
  let renderCount = 0;
  let effectCalls = {};
  let startTime = Date.now();
  let renderTimes = [];
  
  // Hook into React DevTools to monitor renders
  try {
    // Save original console.log
    const originalLog = console.log;
    
    // Override console.log to catch render tracker logs
    console.log = function(...args) {
      // Check if this is a render tracker log
      if (args[0] && typeof args[0] === 'string' && args[0].includes('[DEBUG] PurchaseRequisition rendered')) {
        renderCount++;
        renderTimes.push(Date.now());
        console.warn(`Render #${renderCount} detected`);
      }
      
      // Call original console.log
      originalLog.apply(console, args);
    };
    
    // Helper function to test tooltips
    const testTooltip = (selector, name) => {
      const tooltipTrigger = document.querySelector(selector);
      if (tooltipTrigger) {
        console.log(`Found ${name} tooltip trigger, simulating hover...`);
        
        // Simulate hover
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
        });
        
        tooltipTrigger.dispatchEvent(mouseEnterEvent);
        
        // Simulate mouseout after 1 second
        setTimeout(() => {
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
          });
          
          tooltipTrigger.dispatchEvent(mouseLeaveEvent);
          console.log(`${name} hover test complete`);
        }, 1000);
        return true;
      } else {
        console.warn(`Could not find ${name} tooltip element for testing`);
        return false;
      }
    };
    
    // Test search tooltip first
    console.log('Testing search input tooltip...');
    const searchTooltipTested = testTooltip('.tooltip-icon-wrapper', 'search input');
    
    // Then test table header tooltips
    setTimeout(() => {
      console.log('Testing table header tooltips...');
      const tableHeaderTooltipTested = testTooltip('.table-column-with-tooltip .anticon', 'table header');
      
      // Restore console.log after all tests and report findings
      setTimeout(() => {
        console.log = originalLog;
        
        // Report findings
        const elapsedTime = Date.now() - startTime;
        console.log(`Test completed in ${elapsedTime}ms`);
        console.log(`Total renders detected: ${renderCount}`);
        
        if (renderCount > 10) {
          console.error('⚠️ POTENTIAL ISSUE: Component rendered more than 10 times in 5 seconds');
          
          // Calculate render frequency
          if (renderTimes.length > 1) {
            const intervals = [];
            for (let i = 1; i < renderTimes.length; i++) {
              intervals.push(renderTimes[i] - renderTimes[i-1]);
            }
            
            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            console.log(`Average interval between renders: ${avgInterval.toFixed(2)}ms`);
            
            if (avgInterval < 100) {
              console.error('🚨 CRITICAL ISSUE: Renders happening very rapidly (less than 100ms apart)');
              console.log('This suggests an infinite loop may still be occurring');
            }
          }
        } else {
          console.log('✅ Component render count looks normal');
        }
        
        // Final summary
        if (!searchTooltipTested && !tableHeaderTooltipTested) {
          console.error('❌ Could not test any tooltips - are you on the right page?');
        } else {
          console.log('✅ Tooltip hover tests completed successfully');
        }
      }, 3000);
    }, 2000);
    
    console.log('Test is running, please wait for results...');
  } catch (err) {
    console.error('Error during test:', err);
  }
})();
