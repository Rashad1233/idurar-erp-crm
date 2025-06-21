// Test file to identify which lazy-loaded component is causing the primitive value error
console.log('Testing lazy loading components...');

// Test imports one by one to identify the problematic component
async function testLazyComponents() {
  const componentsToTest = [
    { name: 'Dashboard', path: '@/pages/Dashboard' },
    { name: 'PurchaseRequisition', path: '@/pages/PurchaseRequisition' },
    { name: 'PurchaseRequisitionCreateSimple', path: '@/pages/PurchaseRequisition/PurchaseRequisitionCreateSimple' },
    { name: 'Customer', path: '@/pages/Customer' },
    { name: 'Invoice', path: '@/pages/Invoice' }
  ];

  for (const component of componentsToTest) {
    try {
      console.log(`Testing ${component.name}...`);
      const module = await import(component.path);
      console.log(`✅ ${component.name} loaded successfully`);
      
      // Check if it has a default export
      if (!module.default) {
        console.warn(`⚠️ ${component.name} does not have a default export`);
      }
    } catch (error) {
      console.error(`❌ ${component.name} failed to load:`, error);
    }
  }
}

// Run the test if we're in browser environment
if (typeof window !== 'undefined') {
  testLazyComponents();
}
