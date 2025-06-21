// Final Test Script for Tooltip Infinite Loop Fix
// Run this in your browser console when viewing the Purchase Requisition page

(function() {
  console.log('🔍 RUNNING FINAL TOOLTIP INFINITE LOOP TEST');
  console.log('========================================');
  
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
    
    // Restore console.log after 5 seconds
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
    }, 5000);
    
    // Test tooltip hover to verify it doesn't cause infinite renders
    console.log('Testing tooltip hover interaction...');
    
    // Find tooltip element
    const tooltipTrigger = document.querySelector('.tooltip-icon-wrapper');
    if (tooltipTrigger) {
      console.log('Found tooltip trigger, simulating hover...');
      
      // Simulate hover
      const mouseEnterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      
      tooltipTrigger.dispatchEvent(mouseEnterEvent);
      
      // Simulate mouseout after 2 seconds
      setTimeout(() => {
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true,
        });
        
        tooltipTrigger.dispatchEvent(mouseLeaveEvent);
        console.log('Tooltip hover test complete');
      }, 2000);
    } else {
      console.warn('Could not find tooltip element for testing');
    }
    
    console.log('Test is running, please wait 5 seconds for results...');
  } catch (err) {
    console.error('Error during test:', err);
  }
})();
