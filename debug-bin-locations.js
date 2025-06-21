// Debug script for testing bin locations functionality
console.log('Starting bin locations debugging');

// Reference to the API service
const warehouseService = require('./frontend/src/services/warehouseService');

// Function to test bin locations retrieval
async function testBinLocations() {
  try {
    console.log('Fetching storage locations...');
    const storageLocations = await warehouseService.getStorageLocations();
    console.log(`Found ${storageLocations.data?.length || 0} storage locations`);
    
    // Test each storage location to check for bin locations
    if (storageLocations.success && storageLocations.data?.length > 0) {
      for (const location of storageLocations.data) {
        console.log(`Testing storage location: ${location.code} (ID: ${location.id})`);
        
        const binLocations = await warehouseService.getBinLocations(location.id);
        
        if (binLocations.success) {
          console.log(`  - Found ${binLocations.data?.length || 0} bin locations`);
          if (binLocations.data?.length > 0) {
            console.log('  - Sample bin location:', JSON.stringify(binLocations.data[0], null, 2));
          }
        } else {
          console.error(`  - Failed to retrieve bin locations: ${binLocations.message || 'Unknown error'}`);
        }
      }
    }
  } catch (error) {
    console.error('Error testing bin locations:', error);
  }
}

// Run the test
testBinLocations().then(() => {
  console.log('Bin locations debugging complete');
});
