// Debug RFQ Functionality
const axios = require('axios');

(async () => {
  console.log('🔍 Starting RFQ Debug...');
  
  const baseURL = 'http://localhost:8888/api/procurement/rfq';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer null' // Using null as shown in logs
  };
  
  try {
    // Test 1: Get all RFQs
    console.log('\n📋 Test 1: Getting all RFQs...');
    try {
      const response = await axios.get(baseURL, { headers });
      console.log('✅ GET /rfq response:', response.status);
      console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ GET /rfq error:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.message || error.message);
      console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 2: Create a simple RFQ
    console.log('\n��� Test 2: Creating a simple RFQ...');
    const rfqData = {
      description: 'Test RFQ for debugging',
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      notes: 'This is a test RFQ created for debugging purposes',
      items: [
        {
          description: 'Test Item 1',
          uom: 'PCS',
          quantity: 10
        },
        {
          description: 'Test Item 2',
          uom: 'KG',
          quantity: 5
        }
      ],
      suppliers: [
        {
          supplierName: 'Test Supplier 1',
          contactEmail: 'supplier1@test.com',
          contactName: 'John Doe'
        },
        {
          supplierName: 'Test Supplier 2',
          contactEmail: 'supplier2@test.com',
          contactName: 'Jane Smith'
        }
      ]
    };
    
    try {
      const response = await axios.post(baseURL, rfqData, { headers });
      console.log('✅ POST /rfq response:', response.status);
      console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
      
      // Store the created RFQ ID for further tests
      const rfqId = response.data.data?.id;
      
      if (rfqId) {
        // Test 3: Get the created RFQ
        console.log('\n📖 Test 3: Getting the created RFQ...');
        try {
          const getResponse = await axios.get(`${baseURL}/${rfqId}`, { headers });
          console.log('✅ GET /rfq/:id response:', getResponse.status);
          console.log('📄 Response data:', JSON.stringify(getResponse.data, null, 2));
        } catch (error) {
          console.error('❌ GET /rfq/:id error:', error.response?.status);
          console.error('❌ Error message:', error.response?.data?.message || error.message);
        }
        
        // Test 4: Update the RFQ
        console.log('\n✏️ Test 4: Updating the RFQ...');
        const updateData = {
          description: 'Updated Test RFQ for debugging',
          notes: 'This RFQ has been updated for testing purposes'
        };
        
        try {
          const updateResponse = await axios.put(`${baseURL}/${rfqId}`, updateData, { headers });
          console.log('✅ PUT /rfq/:id response:', updateResponse.status);
          console.log('📄 Response data:', JSON.stringify(updateResponse.data, null, 2));
        } catch (error) {
          console.error('❌ PUT /rfq/:id error:', error.response?.status);
          console.error('❌ Error message:', error.response?.data?.message || error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ POST /rfq error:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.message || error.message);
      console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Fatal error in RFQ debug:', error.message);
  }
  
  // Test 5: Check RFQ models availability
  console.log('\n🔍 Test 5: Checking RFQ models availability...');
  try {
    const modelsResponse = await axios.get('http://localhost:8888/api/procurement/purchase-order/test-simple', { headers });
    console.log('📄 Available models:', modelsResponse.data.modelsCreated);
  } catch (error) {
    console.error('❌ Models check error:', error.message);
  }
})();