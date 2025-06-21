// Test script for warehouse controller functions
const axios = require('axios');

// Configuration
const baseURL = 'http://localhost:3001/api'; // Adjust if your server runs on a different port
let token = null;
let storageLocationId = null;
let binLocationId = null;
let transactionId = null;

// Test data
const testStorageLocation = {
  code: `TEST-WH-${Date.now()}`,
  description: 'Test Warehouse',
  street: 'Test Street',
  city: 'Test City',
  postalCode: '12345',
  country: 'Test Country'
};

const testBinLocation = {
  binCode: `TEST-BIN-${Date.now()}`,
  description: 'Test Bin'
};

// Helper function to authenticate
async function authenticate() {
  try {
    console.log('\n=== AUTHENTICATING USER ===');
    const response = await axios.post(`${baseURL}/users/login`, {
      email: 'admin@example.com', // Replace with valid credentials
      password: 'password123'    // Replace with valid credentials
    });

    token = response.data.token;
    console.log('✅ Authentication successful');
    return token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Helper function to make authenticated requests
function authRequest() {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// Test warehouse functionality
async function testWarehouseFunctions() {
  try {
    // Authenticate first
    await authenticate();
    const request = authRequest();

    console.log('\n=== TESTING STORAGE LOCATION FUNCTIONS ===');
    
    // Test creating a storage location
    console.log('\n1. Creating a test storage location...');
    const createStorageResponse = await request.post('/warehouse/storage-location', testStorageLocation);
    storageLocationId = createStorageResponse.data.data.id;
    console.log('✅ Storage location created:', createStorageResponse.data.data);

    // Test getting all storage locations
    console.log('\n2. Getting all storage locations...');
    const getAllStorageResponse = await request.get('/warehouse/storage-location');
    console.log(`✅ Retrieved ${getAllStorageResponse.data.count} storage locations`);

    // Test getting a specific storage location
    console.log('\n3. Getting specific storage location...');
    const getStorageResponse = await request.get(`/warehouse/storage-location/${storageLocationId}`);
    console.log('✅ Retrieved storage location:', getStorageResponse.data.data.code);

    // Test updating a storage location
    console.log('\n4. Updating storage location...');
    const updateStorageResponse = await request.put(`/warehouse/storage-location/${storageLocationId}`, {
      description: 'Updated Test Warehouse'
    });
    console.log('✅ Storage location updated:', updateStorageResponse.data.data.description);

    console.log('\n=== TESTING BIN LOCATION FUNCTIONS ===');
    
    // Test creating a bin location
    console.log('\n5. Creating a test bin location...');
    const createBinResponse = await request.post('/warehouse/bin-location', {
      ...testBinLocation,
      storageLocationId
    });
    binLocationId = createBinResponse.data.data.id;
    console.log('✅ Bin location created:', createBinResponse.data.data);

    // Test getting all bin locations
    console.log('\n6. Getting all bin locations...');
    const getAllBinsResponse = await request.get('/warehouse/bin-location');
    console.log(`✅ Retrieved ${getAllBinsResponse.data.count} bin locations`);

    // Test getting bins for specific storage location
    console.log('\n7. Getting bins for specific storage location...');
    const getBinsByStorageResponse = await request.get(`/warehouse/storage-location/${storageLocationId}/bins`);
    console.log(`✅ Retrieved ${getBinsByStorageResponse.data.count} bins for storage location`);

    // Test getting a specific bin location
    console.log('\n8. Getting specific bin location...');
    const getBinResponse = await request.get(`/warehouse/bin-location/${binLocationId}`);
    console.log('✅ Retrieved bin location:', getBinResponse.data.data.binCode);

    // Test updating a bin location
    console.log('\n9. Updating bin location...');
    const updateBinResponse = await request.put(`/warehouse/bin-location/${binLocationId}`, {
      description: 'Updated Test Bin'
    });
    console.log('✅ Bin location updated:', updateBinResponse.data.data.description);

    // Test creating a transaction would require inventory items, which we don't set up in this simple test
    // To test transactions, we would need to:
    // 1. Create item master records
    // 2. Create inventory records
    // 3. Create transactions

    // Cleanup - Delete bin location
    console.log('\n10. Cleaning up - deleting bin location...');
    const deleteBinResponse = await request.delete(`/warehouse/bin-location/${binLocationId}`);
    console.log('✅ Bin location deleted:', deleteBinResponse.data.message);

    // Cleanup - Delete storage location
    console.log('\n11. Cleaning up - deleting storage location...');
    const deleteStorageResponse = await request.delete(`/warehouse/storage-location/${storageLocationId}`);
    console.log('✅ Storage location deleted:', deleteStorageResponse.data.message);

    console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Error details:', error.response?.data?.error || error.stack);
  }
}

// Run the tests
testWarehouseFunctions();
