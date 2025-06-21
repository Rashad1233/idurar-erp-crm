const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8888/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU';

async function testPurchaseRequisitionCreation() {
  try {
    console.log('🧪 Testing Purchase Requisition Creation');
    console.log('=====================================');
    
    // Configure axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    axios.defaults.headers.common['x-auth-token'] = AUTH_TOKEN;
    
    // Test data with corrected field names
    const prData = {
      description: 'Test Purchase Requisition - API Test',
      costCenter: 'IT',
      currency: 'USD',
      requiredDate: '2025-06-19',
      comments: 'Test creation via API',
      totalValue: 25.50,
      items: [
        {
          itemName: 'Test Item 1',
          description: 'Test item description',
          quantity: 2,
          uom: 'EA',
          unitPrice: 10.50  // Corrected field name from 'price' to 'unitPrice'
        },
        {
          itemName: 'Test Item 2',
          description: 'Another test item',
          quantity: 1,
          uom: 'PC',
          unitPrice: 4.50   // Corrected field name from 'price' to 'unitPrice'
        }
      ]
    };
    
    console.log('📤 Sending POST request to /procurement/purchase-requisition');
    console.log('📋 Test data:', JSON.stringify(prData, null, 2));
    
    const response = await axios.post('/procurement/purchase-requisition', prData);
    
    console.log('✅ Purchase Requisition created successfully!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('🎉 SUCCESS: Purchase Requisition creation is working!');
      console.log(`📋 PR Number: ${response.data.data.prNumber}`);
      console.log(`🆔 PR ID: ${response.data.data.id}`);
    } else {
      console.log('⚠️ API returned success=false:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating Purchase Requisition:');
    
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 Network Error - no response received');
      console.error('📡 Request details:', error.message);
    } else {
      console.error('🐛 Unexpected error:', error.message);
    }
  }
}

// Run the test
testPurchaseRequisitionCreation();
