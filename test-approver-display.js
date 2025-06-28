// Script to test approver display functionality
const axios = require('axios');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const PR_ID = '0b4afa3e-8582-452b-833c-f8bf695c4460'; // Use the ID shown in your screenshot
const OUTPUT_FILE = './approver-test-results.json';

async function testApproverDisplay() {
  console.log('🔍 Testing Approver Display Functionality');
  console.log('----------------------------------------');
  
  try {
    // Step 1: Test the user info endpoint
    console.log('Step 1: Testing user info endpoint...');
    const approverId = '0b4afa3e-8582-452b-833c-f8bf695c4460'; // Using the same ID as PR just for testing
    
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/user-info/users/${approverId}`);
      console.log('✅ User info endpoint response:', JSON.stringify(userResponse.data, null, 2));
    } catch (error) {
      console.error('❌ User info endpoint error:', error.message);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
      }
    }
    
    // Step 2: Test the PR endpoint to see if approver is resolved
    console.log('\nStep 2: Testing purchase requisition endpoint...');
    
    try {
      const prResponse = await axios.get(`${API_BASE_URL}/procurement/purchase-requisition/${PR_ID}`);
      console.log('✅ PR endpoint response successful');
      
      const prData = prResponse.data.result || prResponse.data.data;
      
      console.log('\nApprover Information:');
      console.log('-------------------');
      console.log('approverId:', prData.approverId);
      console.log('approver:', JSON.stringify(prData.approver, null, 2));
      
      console.log('\nCurrent Approver Information:');
      console.log('---------------------------');
      console.log('currentApproverId:', prData.currentApproverId);
      console.log('currentApprover:', JSON.stringify(prData.currentApprover, null, 2));
      
      console.log('\nRequestor Information:');
      console.log('--------------------');
      console.log('requestorId:', prData.requestorId || prData.requestor?.id);
      console.log('requestor:', JSON.stringify(prData.requestor, null, 2));
      
      // Save complete response to file for analysis
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(prResponse.data, null, 2));
      console.log(`\nFull response saved to ${OUTPUT_FILE}`);
      
    } catch (error) {
      console.error('❌ PR endpoint error:', error.message);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testApproverDisplay();
