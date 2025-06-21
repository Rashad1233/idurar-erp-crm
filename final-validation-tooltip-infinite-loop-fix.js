/**
 * Final Validation Script - React Infinite Loop Fix
 * For Purchase Requisition Component
 * Date: June 10, 2025
 * 
 * This script provides comprehensive validation of the fixes applied
 * to the PurchaseRequisition component to resolve the infinite loop issues.
 */

(function() {
  console.log('🔍 RUNNING COMPREHENSIVE VALIDATION');
  console.log('===================================');
  
  // Log information about the environment
  console.log('Browser:', navigator.userAgent);
  console.log('React version:', React?.version || 'Unknown');
  console.log('Current page:', window.location.href);
  
  // Component tracking
  const ComponentTracker = {
    renders: {},
    startTime: Date.now(),
    maxTrackedRenders: 50,
    
    // Track component render
    trackRender: function(componentName, dependencies = {}) {
      if (!this.renders[componentName]) {
        this.renders[componentName] = {
          count: 0,
          timestamps: [],
          dependencies: []
        };
      }
      
      const component = this.renders[componentName];
      component.count++;
      component.timestamps.push(Date.now());
      component.dependencies.push({...dependencies, timestamp: Date.now()});
      
      // Only keep the last N renders to avoid memory issues
      if (component.timestamps.length > this.maxTrackedRenders) {
        component.timestamps.shift();
        component.dependencies.shift();
      }
      
      return component.count;
    },
    
    // Check for potential issues
    analyzeRenders: function() {
      const issues = [];
      
      Object.keys(this.renders).forEach(componentName => {
        const component = this.renders[componentName];
        
        // Check render count - too many renders in a short time might indicate issues
        if (component.count > 20) {
          const totalTime = Date.now() - this.startTime;
          const rendersPerSecond = (component.count / totalTime) * 1000;
          
          if (rendersPerSecond > 5) { // More than 5 renders per second is suspicious
            issues.push({
              component: componentName,
              severity: 'high',
              issue: `High render frequency: ${rendersPerSecond.toFixed(2)} renders/second (${component.count} total)`
            });
          }
        }
        
        // Check for rapid consecutive renders (potential loop)
        if (component.timestamps.length > 3) {
          const recentIntervals = [];
          for (let i = 1; i < component.timestamps.length; i++) {
            recentIntervals.push(component.timestamps[i] - component.timestamps[i-1]);
          }
          
          const avgInterval = recentIntervals.reduce((sum, val) => sum + val, 0) / recentIntervals.length;
          if (avgInterval < 50) { // Less than 50ms between renders is very suspicious
            issues.push({
              component: componentName,
              severity: 'critical',
              issue: `Potential infinite loop: ${avgInterval.toFixed(2)}ms average between renders`
            });
          }
        }
        
        // Check for dependency changes between renders
        if (component.dependencies.length > 1) {
          const changedDeps = {};
          
          // Compare each render's dependencies with the previous render
          for (let i = 1; i < component.dependencies.length; i++) {
            const prevDeps = component.dependencies[i-1];
            const currDeps = component.dependencies[i];
            
            Object.keys(currDeps).forEach(key => {
              if (key !== 'timestamp' && prevDeps[key] !== currDeps[key]) {
                if (!changedDeps[key]) changedDeps[key] = 0;
                changedDeps[key]++;
              }
            });
          }
          
          // Report dependencies that change frequently
          Object.keys(changedDeps).forEach(dep => {
            const changePercent = (changedDeps[dep] / (component.dependencies.length - 1)) * 100;
            if (changePercent > 70) { // Changed in more than 70% of renders
              issues.push({
                component: componentName,
                severity: 'medium',
                issue: `Dependency '${dep}' changed in ${changePercent.toFixed(1)}% of renders - may cause excessive re-renders`
              });
            }
          });
        }
      });
      
      return issues;
    },
    
    // Generate a report of component rendering
    generateReport: function() {
      console.log('\n📊 COMPONENT RENDER REPORT');
      console.log('=========================');
      
      const issues = this.analyzeRenders();
      
      // Report for each component
      Object.keys(this.renders).forEach(componentName => {
        const component = this.renders[componentName];
        console.log(`\n${componentName}:`);
        console.log(`  Total renders: ${component.count}`);
        
        if (component.timestamps.length > 1) {
          const recentIntervals = [];
          for (let i = 1; i < component.timestamps.length; i++) {
            recentIntervals.push(component.timestamps[i] - component.timestamps[i-1]);
          }
          
          const avgInterval = recentIntervals.reduce((sum, val) => sum + val, 0) / recentIntervals.length;
          console.log(`  Average interval between renders: ${avgInterval.toFixed(2)}ms`);
        }
      });
      
      // Report issues
      if (issues.length > 0) {
        console.log('\n⚠️ POTENTIAL ISSUES');
        console.log('==================');
        
        issues.forEach(issue => {
          let icon = '⚠️';
          if (issue.severity === 'critical') icon = '🚨';
          if (issue.severity === 'high') icon = '❗';
          
          console.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.component}: ${issue.issue}`);
        });
      } else {
        console.log('\n✅ No rendering issues detected!');
      }
      
      // Final assessment
      const elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      console.log(`\nTest completed in ${elapsedTime} seconds.`);
      
      const hasInfiniteLoop = issues.some(issue => issue.severity === 'critical');
      if (hasInfiniteLoop) {
        console.error('\n❌ ALERT: Potential infinite loop detected. Review the issues above.');
      } else {
        console.log('\n✅ VALIDATION COMPLETE: No infinite loops detected!');
      }
    }
  };
  
  // Validation tests
  const ValidationTests = {
    // Hook into React's component lifecycle to track renders
    setupRenderTracking: function() {
      // Try to find the RenderTracker component if it's already in the DOM
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        if (typeof args[0] === 'string' && args[0].includes('[DEBUG] PurchaseRequisition rendered')) {
          const renderCount = parseInt(args[0].match(/rendered (\d+) times/)[1]);
          ComponentTracker.trackRender('PurchaseRequisition', {renderCount});
        }
        originalConsoleLog.apply(console, args);
      };
      
      console.log('Render tracking set up. Waiting for component renders...');
    },
    
    // Test the search functionality
    testSearch: function() {
      console.log('\n🔍 Testing search functionality');
      const searchInput = document.querySelector('.search-container input');
      
      if (!searchInput) {
        console.error('❌ Search input not found - are you on the Purchase Requisition page?');
        return;
      }
      
      // Helper to update input value and trigger change event
      const setInputValue = (input, value) => {
        input.value = value;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
        
        // Also dispatch a change event for React to pick it up
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      };
      
      // Test with different search terms
      setTimeout(() => {
        console.log('  Testing with short search term (should not trigger API search)');
        setInputValue(searchInput, 'a');
        
        setTimeout(() => {
          console.log('  Testing with valid search term');
          setInputValue(searchInput, 'test query');
          
          setTimeout(() => {
            console.log('  Testing search clear');
            setInputValue(searchInput, '');
            
            setTimeout(() => {
              console.log('✅ Search tests completed');
            }, 1000);
          }, 1000);
        }, 1000);
      }, 100);
    },
    
    // Test tooltip hover behavior
    testTooltip: function() {
      console.log('\n🔍 Testing tooltip behavior');
      const tooltipTrigger = document.querySelector('.tooltip-icon-wrapper');
      
      if (!tooltipTrigger) {
        console.error('❌ Tooltip trigger not found - are you on the Purchase Requisition page?');
        return;
      }
      
      // Simulate a mouse hover
      setTimeout(() => {
        console.log('  Simulating mouse hover on tooltip');
        
        // Create and dispatch a mouseenter event
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
        });
        tooltipTrigger.dispatchEvent(mouseEnterEvent);
        
        // Move mouse away after 1 second
        setTimeout(() => {
          console.log('  Simulating mouse leave from tooltip');
          const mouseLeaveEvent = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
          });
          tooltipTrigger.dispatchEvent(mouseLeaveEvent);
          
          setTimeout(() => {
            console.log('✅ Tooltip tests completed');
          }, 500);
        }, 1000);
      }, 100);
    },
    
    // Run all validation tests
    runAllTests: function() {
      this.setupRenderTracking();
      
      // Run tests in sequence
      setTimeout(() => {
        this.testSearch();
        
        setTimeout(() => {
          this.testTooltip();
          
          // Generate final report after all tests complete
          setTimeout(() => {
            ComponentTracker.generateReport();
          }, 5000);
        }, 4000);
      }, 1000);
    }
  };
  
  // Begin validation tests
  ValidationTests.runAllTests();
})();
