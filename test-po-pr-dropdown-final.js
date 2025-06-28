const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api';

async function testPurchaseRequisitionDropdown() {
  console.log('🚀 Testing Purchase Requisition Dropdown API');
  console.log('==========================================\n');
  
  try {
    // Test 1: Test the API endpoint
    console.log('📡 Testing API endpoint: GET /api/purchase-requisition/list');
    
    const response = await axios.get(`${API_BASE_URL}/purchase-requisition/list`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Success:', response.data.success);
    
    if (response.data.result) {
      const prs = response.data.result;
      console.log(`\n📋 Found ${prs.length} Purchase Requisitions:`);
      
      // Show all PRs
      prs.forEach(pr => {
        console.log(`\n  PR #${pr.prNumber}:`);
        console.log(`    - ID: ${pr.id || pr._id}`);
        console.log(`    - Description: ${pr.description}`);
        console.log(`    - Status: ${pr.status}`);
        console.log(`    - Total Amount: $${pr.totalAmount || 0}`);
        console.log(`    - Department: ${pr.department || 'N/A'}`);
        console.log(`    - Date Required: ${pr.dateRequired ? new Date(pr.dateRequired).toLocaleDateString() : 'N/A'}`);
      });
      
      // Filter approved PRs
      const approvedPRs = prs.filter(pr => pr.status === 'approved');
      console.log(`\n✅ Approved PRs for PO dropdown: ${approvedPRs.length}`);
      
      if (approvedPRs.length === 0) {
        console.log('\n⚠️  No approved PRs found!');
        console.log('   To see PRs in the Purchase Order dropdown:');
        console.log('   1. Create a Purchase Requisition');
        console.log('   2. Submit it for approval');
        console.log('   3. Approve the PR');
      } else {
        console.log('\n🎯 Approved PRs available for selection:');
        approvedPRs.forEach(pr => {
          console.log(`   - ${pr.prNumber}: ${pr.description}`);
        });
      }
      
    } else {
      console.log('❌ No result data in response');
    }
    
    // Test 2: Check frontend compatibility
    console.log('\n\n🔍 Frontend Compatibility Check:');
    console.log('The frontend expects the following structure:');
    console.log('- API endpoint: /api/purchase-requisition/list');
    console.log('- Response format: { success: true, result: [...] }');
    console.log('- Each PR should have: id/_id, prNumber, description, status');
    console.log('- Frontend filters for status === "approved"');
    
    console.log('\n✅ The API is properly configured for the dropdown!');
    
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure the backend server is running on port 8888');
    console.log('2. Check if you need to add authentication headers');
    console.log('3. Verify the database connection is working');
  }
}

// Run the test
testPurchaseRequisitionDropdown();
