/**
 * Ultimate Tooltip Fix Test - June 11, 2025
 * Tests the final isolated static tooltip implementation
 */

(function() {
  console.log('🧪 RUNNING ULTIMATE TOOLTIP FIX TEST');
  console.log('===================================');
  
  // Track render counts
  let renderCount = 0;
  let renderTime = Date.now();
  let renderIntervals = [];
  
  // Save original console.log
  const originalConsoleLog = console.log;
  
  // Override console.log to track renders
  console.log = function(...args) {
    if (typeof args[0] === 'string' && args[0].includes('[DEBUG] PurchaseRequisition rendered')) {
      const currentTime = Date.now();
      renderCount++;
      
      if (renderTime) {
        renderIntervals.push(currentTime - renderTime);
      }
      
      renderTime = currentTime;
      
      // Log with increasing severity based on render count
      if (renderCount > 20) {
        console.warn(`⚠️ Render #${renderCount} detected`);
      } else {
        originalConsoleLog.apply(console, [`✓ Render #${renderCount} detected`]);
      }
    }
    
    // Call original
    originalConsoleLog.apply(console, args);
  };
  
  // Testing functions
  const testStaticTooltips = () => {
    console.log('Testing static tooltips...');
    
    // Find all tooltip triggers
    const tooltipTriggers = document.querySelectorAll('.static-tooltip-trigger .anticon');
    
    if (tooltipTriggers.length === 0) {
      console.error('❌ No static tooltip triggers found. Are you on the Purchase Requisition page?');
      return false;
    }
    
    console.log(`Found ${tooltipTriggers.length} static tooltip triggers to test`);
    
    // Test each tooltip with a delay
    let index = 0;
    
    function testNextTooltip() {
      if (index >= tooltipTriggers.length) {
        console.log('✅ All static tooltip tests completed');
        setTimeout(finalReport, 1000);
        return;
      }
      
      const initialRenderCount = renderCount;
      const trigger = tooltipTriggers[index];
      
      console.log(`Testing tooltip #${index + 1}...`);
      
      // Simulate hover
      const mouseEnterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      
      trigger.dispatchEvent(mouseEnterEvent);
      
      // Check renders after 500ms
      setTimeout(() => {
        const rendersAfterHover = renderCount - initialRenderCount;
        
        if (rendersAfterHover > 0) {
          console.warn(`⚠️ Tooltip #${index + 1} caused ${rendersAfterHover} renders during hover!`);
        } else {
          console.log(`✅ Tooltip #${index + 1}: No renders during hover - PERFECT!`);
        }
        
        // Simulate mouse leave
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true,
        });
        
        trigger.dispatchEvent(mouseLeaveEvent);
        
        // Move to next tooltip after delay
        setTimeout(() => {
          index++;
          testNextTooltip();
        }, 500);
      }, 500);
    }
    
    // Start testing
    testNextTooltip();
    return true;
  };
  
  // Generate final report
  const finalReport = () => {
    console.log('\n📊 FINAL TOOLTIP TEST RESULTS');
    console.log('============================');
    console.log(`Total renders during test: ${renderCount}`);
    
    if (renderCount > 30) {
      console.error('❌ FAIL: Too many renders detected, tooltip fix may not be working');
    } else if (renderCount > 15) {
      console.warn('⚠️ CAUTION: Higher than expected render count, but may be acceptable');
    } else {
      console.log('✅ SUCCESS: Normal render count, tooltip fix appears to be working');
    }
    
    // Calculate average time between renders
    if (renderIntervals.length > 1) {
      const avgInterval = renderIntervals.reduce((sum, val) => sum + val, 0) / renderIntervals.length;
      console.log(`Average time between renders: ${avgInterval.toFixed(2)}ms`);
      
      // Check for rapid renders (potential infinite loop)
      const rapidRenders = renderIntervals.filter(interval => interval < 50).length;
      
      if (rapidRenders > 5) {
        console.error('❌ FAIL: Multiple rapid renders detected - still indicates an infinite loop issue');
      } else if (rapidRenders > 0) {
        console.warn('⚠️ CAUTION: Some rapid renders detected, but might not be problematic');
      } else {
        console.log('✅ SUCCESS: No rapid renders detected, tooltip fix appears stable');
      }
    }
    
    // Check for React warnings in console
    if (window.__REACT_ERROR_OVERLAY__) {
      console.error('❌ FAIL: React error overlay detected - there are still React errors');
    } else {
      console.log('✅ SUCCESS: No React error overlay detected');
    }
    
    // Restore original console.log
    console.log = originalConsoleLog;
    
    console.log('\n🎯 FINAL VERDICT');
    console.log('==================');
    if (renderCount <= 15 && renderIntervals.filter(interval => interval < 50).length === 0) {
      console.log('✅✅✅ TEST PASSED: Static tooltip implementation appears to be working correctly!');
    } else {
      console.log('❌ TEST FAILED: Static tooltip implementation still has issues that need addressing');
    }
  };
  
  // Start tests after a delay to let component stabilize
  setTimeout(() => {
    testStaticTooltips();
  }, 2000);
  
  console.log('Test initialized, waiting for component to stabilize...');
})();
