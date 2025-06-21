// Deep Tooltip Infinite Loop Fix - Final Test
// This script validates that the tooltip infinite loop is completely fixed

(function() {
  console.log('🧪 RUNNING FINAL TOOLTIP INFINITE LOOP TEST');
  console.log('============================================');
  
  // Track render counts
  let renderCount = 0;
  let renderTime = Date.now();
  let renderIntervals = [];
  
  // Monitor performance
  const startTime = performance.now();
  
  // Override console.log to track renders
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    if (typeof args[0] === 'string' && args[0].includes('[DEBUG] PurchaseRequisition rendered')) {
      const currentTime = Date.now();
      renderCount++;
      
      if (renderTime) {
        renderIntervals.push(currentTime - renderTime);
      }
      
      renderTime = currentTime;
      
      // Log with increasing severity based on render count
      if (renderCount > 100) {
        console.error(`🚨 CRITICAL: Render #${renderCount} detected!`);
      } else if (renderCount > 50) {
        console.warn(`⚠️ WARNING: Render #${renderCount} detected!`);
      } else if (renderCount > 20) {
        console.warn(`🔍 NOTICE: Render #${renderCount} detected`);
      }
    }
    
    // Call original
    originalConsoleLog.apply(console, args);
  };
  
  // Function to test tooltips
  function testTooltips() {
    console.log('Starting tooltip tests...');
    
    // Get all tooltip triggers
    const tooltipTriggers = document.querySelectorAll('.table-column-with-tooltip .anticon, .tooltip-icon-wrapper');
    console.log(`Found ${tooltipTriggers.length} tooltip triggers to test`);
    
    if (tooltipTriggers.length === 0) {
      console.error('No tooltip triggers found! Are you on the Purchase Requisition page?');
      return false;
    }
    
    // Test each tooltip one by one with a delay
    let index = 0;
    
    function testNextTooltip() {
      if (index >= tooltipTriggers.length) {
        console.log('✅ All tooltip tests completed!');
        generateReport();
        return;
      }
      
      const trigger = tooltipTriggers[index];
      console.log(`Testing tooltip #${index + 1}...`);
      
      // Track renders before hover
      const rendersBefore = renderCount;
      
      // Simulate hover
      const mouseEnterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      
      trigger.dispatchEvent(mouseEnterEvent);
      
      // After a short delay, check if renders increased dramatically
      setTimeout(() => {
        const rendersAfterHover = renderCount;
        const rendersDuringHover = rendersAfterHover - rendersBefore;
        
        if (rendersDuringHover > 5) {
          console.warn(`⚠️ Tooltip #${index + 1} caused ${rendersDuringHover} renders during hover!`);
        } else {
          console.log(`Tooltip #${index + 1} caused ${rendersDuringHover} renders during hover - OK`);
        }
        
        // Simulate mouseout
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true,
        });
        
        trigger.dispatchEvent(mouseLeaveEvent);
        
        // Move to next tooltip after a delay
        setTimeout(() => {
          index++;
          testNextTooltip();
        }, 500);
      }, 1000);
    }
    
    // Start testing tooltips
    testNextTooltip();
    return true;
  }
  
  // Generate final report
  function generateReport() {
    console.log('Restoring console.log...');
    console.log = originalConsoleLog;
    
    console.log('\n📊 FINAL TOOLTIP TEST RESULTS');
    console.log('============================');
    
    const totalTestTime = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Test duration: ${totalTestTime} seconds`);
    console.log(`Total component renders: ${renderCount}`);
    
    if (renderIntervals.length > 0) {
      const avgInterval = renderIntervals.reduce((sum, val) => sum + val, 0) / renderIntervals.length;
      console.log(`Average time between renders: ${avgInterval.toFixed(2)}ms`);
      
      // Check for rapid renders (potential infinite loop)
      const rapidRenders = renderIntervals.filter(interval => interval < 50).length;
      
      if (rapidRenders > 5) {
        console.error(`🚨 CRITICAL: Detected ${rapidRenders} rapid renders (<50ms apart)`);
        console.error('This strongly suggests an infinite render loop is still present');
      } else if (renderCount > 50) {
        console.warn('⚠️ WARNING: High render count detected, but not in rapid succession');
        console.warn('This suggests excessive re-renders, but not an infinite loop');
      } else {
        console.log('✅ No evidence of infinite render loops detected');
      }
    }
    
    // Final verdict
    if (renderCount < 20) {
      console.log('\n✅ TEST PASSED: Component renders are within normal range');
    } else if (renderCount < 50) {
      console.log('\n⚠️ TEST INCONCLUSIVE: Component renders are higher than ideal, but may not indicate a problem');
    } else {
      console.log('\n❌ TEST FAILED: Component is rendering excessively, likely still has an infinite loop issue');
    }
  }
  
  // Run the test after a short delay to let the component stabilize
  setTimeout(() => {
    testTooltips();
  }, 2000);
  
  console.log('Test initialized, waiting for component to stabilize...');
})();
