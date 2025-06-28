const axios = require('axios');

async function testPurchaseRequisitionAPI() {
  console.log('🚀 Testing Purchase Requisition Dropdown API');
  console.log('==========================================\n');
  
  try {
    // Test the root endpoint (what the frontend actually calls)
    console.log('📡 Testing API endpoint: GET /api/purchase-requisition');
    
    const response = await axios.get('http://localhost:8888/api/purchase-requisition', {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ API call successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.result) {
      const prs = response.data.result;
      console.log(`\n📋 Found ${prs.length} Purchase Requisitions:`);
      
      prs.forEach(pr => {
        console.log(`  - ${pr.prNumber}: ${pr.description} (Status: ${pr.status})`);
      });
      
      const approvedPRs = prs.filter(pr => pr.status === 'approved');
      console.log(`\n✅ ${approvedPRs.length} approved PRs available for PO dropdown`);
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the backend server is running on port 8888');
    console.log('2. Check if you need to add authentication headers');
    console.log('3. Verify the database connection is working');
    console.log('4. Restart the backend server to apply the route changes');
  }
}

// Run the test
testPurchaseRequisitionAPI();
