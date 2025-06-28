// Comprehensive test to debug the frontend dropdown issue
const axios = require('axios');

async function debugFrontendIssue() {
  console.log('🔍 Debugging Purchase Requisition Item Master Dropdown Issue\n');
  
  // Test 1: Basic API connectivity
  console.log('1. Testing basic API connectivity...');
  try {
    const response = await axios.get('http://localhost:8888/api');
    console.log('✅ Backend API is accessible');
  } catch (error) {
    console.log('❌ Backend API is not accessible:', error.message);
    return;
  }
  
  // Test 2: Test the exact endpoint the frontend calls
  console.log('\n2. Testing /api/item?filter=approved endpoint...');
  try {
    const response = await axios.get('http://localhost:8888/api/item?filter=approved&page=1&limit=100&includePricing=true');
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Success:', response.data.success);
    console.log('✅ Items returned:', response.data.data ? response.data.data.length : 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Sample item structure:');
      const item = response.data.data[0];
      console.log('   - id:', item.id);
      console.log('   - itemNumber:', item.itemNumber);
      console.log('   - shortDescription:', item.shortDescription);
      console.log('   - status:', item.status);
      console.log('   - uom:', item.uom);
    }
  } catch (error) {
    console.log('❌ API call failed:', error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
    return;
  }
  
  // Test 3: Test with authentication headers (simulate frontend)
  console.log('\n3. Testing with authentication headers...');
  try {
    const response = await axios.get('http://localhost:8888/api/item?filter=approved&page=1&limit=100&includePricing=true', {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Authorization': 'Bearer test-token',
        'x-auth-token': 'test-token'
      },
      withCredentials: true
    });
    console.log('✅ API call with auth headers successful');
    console.log('✅ Items returned:', response.data.data ? response.data.data.length : 0);
  } catch (error) {
    console.log('❌ API call with auth headers failed:', error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Data:', error.response.data);
    }
  }
  
  // Test 4: Test alternative endpoints
  console.log('\n4. Testing alternative item endpoints...');
  
  // Test /api/item-master endpoint
  try {
    const response = await axios.get('http://localhost:8888/api/item-master');
    console.log('✅ /api/item-master endpoint works');
    console.log('✅ Items returned:', response.data.data ? response.data.data.length : 0);
  } catch (error) {
    console.log('❌ /api/item-master endpoint failed:', error.message);
  }
  
  // Test direct database query
  console.log('\n5. Testing direct database query...');
  try {
    const { sequelize } = require('./backend/models/sequelize');
    const [items] = await sequelize.query('SELECT COUNT(*) as count FROM "ItemMasters" WHERE status = \'APPROVED\'');
    console.log('✅ Direct DB query - Approved items count:', items[0].count);
    
    const [sampleItems] = await sequelize.query('SELECT id, "itemNumber", "shortDescription", status FROM "ItemMasters" WHERE status = \'APPROVED\' LIMIT 3');
    console.log('✅ Sample approved items from DB:');
    sampleItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.itemNumber} - ${item.shortDescription} (${item.status})`);
    });
  } catch (error) {
    console.log('❌ Direct DB query failed:', error.message);
  }
  
  console.log('\n🔍 Diagnosis Complete!');
  console.log('\nNext steps:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Check Network tab in browser dev tools');
  console.log('3. Verify authentication token is being sent');
  console.log('4. Check if CORS is properly configured');
}

debugFrontendIssue().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Debug script error:', error);
  process.exit(1);
});