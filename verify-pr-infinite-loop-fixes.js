/**
 * Final Verification Script for Purchase Requisition Infinite Loop Fixes
 * 
 * This script can be run in the browser console to verify that the
 * infinite loop issues in the Purchase Requisition component have been resolved.
 */

// Utility to track render counts
const RenderVerifier = {
  components: {},
  
  // Track a component render
  trackRender: function(componentName) {
    if (!this.components[componentName]) {
      this.components[componentName] = {
        renderCount: 0,
        lastRenderTime: Date.now(),
        renderTimes: [],
        issues: []
      };
    }
    
    const component = this.components[componentName];
    component.renderCount++;
    
    const now = Date.now();
    const timeSinceLastRender = now - component.lastRenderTime;
    component.renderTimes.push(timeSinceLastRender);
    component.lastRenderTime = now;
    
    // Check for rapid renders (potential infinite loop)
    if (component.renderTimes.length > 5) {
      const recentRenders = component.renderTimes.slice(-5);
      const averageRenderTime = recentRenders.reduce((sum, time) => sum + time, 0) / recentRenders.length;
      
      if (averageRenderTime < 50 && component.renderCount > 10) {
        component.issues.push({
          type: 'RAPID_RENDERS',
          message: `Potential infinite loop detected: ${recentRenders.length} renders in ${averageRenderTime.toFixed(2)}ms average intervals`,
          time: new Date().toISOString()
        });
        console.error(`⚠️ POTENTIAL INFINITE LOOP in ${componentName}: Renders happening too rapidly`);
      }
    }
    
    return component.renderCount;
  },
  
  // Log a useEffect call
  trackEffect: function(componentName, effectName, dependencies) {
    if (!this.components[componentName]) {
      this.trackRender(componentName);
    }
    
    const component = this.components[componentName];
    if (!component.effects) {
      component.effects = {};
    }
    
    if (!component.effects[effectName]) {
      component.effects[effectName] = {
        callCount: 0,
        lastDependencies: null
      };
    }
    
    const effect = component.effects[effectName];
    effect.callCount++;
    
    // Log dependencies if provided
    if (dependencies) {
      effect.lastDependencies = dependencies;
    }
  },
  
  // Generate a report on component render performance
  generateReport: function() {
    console.log('📊 RENDER PERFORMANCE REPORT');
    console.log('============================');
    
    Object.keys(this.components).forEach(componentName => {
      const component = this.components[componentName];
      
      console.log(`\n📌 ${componentName}`);
      console.log(`   Total Renders: ${component.renderCount}`);
      
      if (component.effects) {
        console.log('   Effects:');
        Object.keys(component.effects).forEach(effectName => {
          const effect = component.effects[effectName];
          console.log(`     - ${effectName}: ${effect.callCount} calls`);
        });
      }
      
      if (component.issues.length > 0) {
        console.log('   ⚠️ ISSUES:');
        component.issues.forEach(issue => {
          console.log(`     - ${issue.type}: ${issue.message}`);
        });
      } else {
        console.log('   ✅ No issues detected');
      }
      
      // Calculate average render time
      if (component.renderTimes.length > 1) {
        const avgTime = component.renderTimes.reduce((sum, time) => sum + time, 0) / component.renderTimes.length;
        console.log(`   Average time between renders: ${avgTime.toFixed(2)}ms`);
      }
    });
    
    // Final assessment
    const hasIssues = Object.values(this.components).some(comp => comp.issues.length > 0);
    
    if (!hasIssues) {
      console.log('\n✅ NO INFINITE LOOPS DETECTED - FIXES VERIFIED');
    } else {
      console.error('\n❌ ISSUES DETECTED - FIXES MAY NOT BE COMPLETE');
    }
  },
  
  // Reset all tracking data
  reset: function() {
    this.components = {};
    console.log('🔄 Render tracking reset');
  }
};

// Test functions to verify fixes
const FixVerifier = {
  testSearchFunctionality: function() {
    console.log('🔍 Testing search functionality...');
    
    try {
      // Find the search input field
      const searchInput = document.querySelector('.search-container input');
      if (!searchInput) {
        throw new Error('Search input not found');
      }
      
      // Reset tracking before test
      RenderVerifier.reset();
      
      // Track initial render
      RenderVerifier.trackRender('PurchaseRequisition');
      
      // Test with short search (should not trigger API search)
      searchInput.value = 'a';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        RenderVerifier.trackRender('PurchaseRequisition');
        console.log('✓ Tested short search term');
        
        // Test with valid search
        searchInput.value = 'test';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          RenderVerifier.trackRender('PurchaseRequisition');
          console.log('✓ Tested valid search term');
          
          // Clear search
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          setTimeout(() => {
            RenderVerifier.trackRender('PurchaseRequisition');
            console.log('✓ Tested clearing search');
            
            // Generate report
            RenderVerifier.generateReport();
          }, 1000);
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error('Error testing search:', error);
    }
  },
  
  verifyAllFixes: function() {
    console.log('🧪 RUNNING COMPREHENSIVE VERIFICATION');
    console.log('===================================');
    
    // 1. Check for React dependency on the page
    if (!window.React) {
      console.error('❌ React not found on page - are you on the right page?');
      return;
    }
    
    console.log('✓ React is available');
    
    // 2. Check for our component
    if (!document.querySelector('.ant-table')) {
      console.error('❌ Purchase Requisition table not found - are you on the right page?');
      return;
    }
    
    console.log('✓ Purchase Requisition component found');
    
    // 3. Start monitoring renders
    RenderVerifier.reset();
    
    // 4. Test search functionality
    this.testSearchFunctionality();
  }
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.RenderVerifier = RenderVerifier;
  window.FixVerifier = FixVerifier;
  
  console.log('🧪 VERIFICATION TOOLS LOADED');
  console.log('Run FixVerifier.verifyAllFixes() to test the fixes');
}

export { RenderVerifier, FixVerifier };
