const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8888/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU';

async function verifyPurchaseRequisition() {
  try {
    console.log('🔍 Verifying Purchase Requisition Data');
    console.log('=====================================');
    
    // Configure axios
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    axios.defaults.headers.common['x-auth-token'] = AUTH_TOKEN;
    
    console.log('📤 Fetching all Purchase Requisitions...');
    
    const response = await axios.get('/procurement/purchase-requisition');
    
    console.log('✅ Purchase Requisitions fetched successfully!');
    console.log('📊 Total PRs found:', response.data.data?.length || 0);
    
    if (response.data.success && response.data.data) {
      response.data.data.forEach((pr, index) => {
        console.log(`\n📋 PR ${index + 1}:`);
        console.log(`   🆔 ID: ${pr.id}`);
        console.log(`   📋 Number: ${pr.prNumber}`);
        console.log(`   📝 Description: ${pr.description}`);
        console.log(`   💰 Total Amount: $${pr.totalAmount}`);
        console.log(`   🏢 Cost Center: ${pr.costCenter}`);
        console.log(`   📊 Status: ${pr.status}`);
        console.log(`   🕒 Created: ${pr.createdAt}`);
        
        if (pr.items && pr.items.length > 0) {
          console.log(`   📦 Items (${pr.items.length}):`);
          pr.items.forEach((item, idx) => {
            console.log(`      ${idx + 1}. ${item.description} - Qty: ${item.quantity}, Price: $${item.unitPrice}`);
          });
        }
      });
    }
    
    console.log('\n🎉 Data verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying Purchase Requisitions:');
    
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📡 Network Error - no response received');
    } else {
      console.error('🐛 Unexpected error:', error.message);
    }
  }
}

// Run the verification
verifyPurchaseRequisition();
