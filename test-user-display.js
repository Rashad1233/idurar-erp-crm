// Test script to validate user display in Purchase Requisition
const axios = require('axios');

async function testUserInfoEndpoint() {
  console.log('Testing User Info Endpoint...');
  
  try {
    // Replace with a valid user ID from your database
    const testUserId = '0b4afa3e-8582-452b-833c-f8bf695c4d60';
    
    // Test the user info endpoint
    const response = await axios.get(`http://localhost:3100/api/user-info/users/${testUserId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with your auth token
      }
    });
    
    console.log('User Info Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing user info endpoint:', error.response?.data || error.message);
  }
}

async function testPRDisplay() {
  console.log('Testing PR Display...');
  
  try {
    // Replace with a valid PR ID from your database
    const testPRId = 'SOME_PR_ID';
    
    // Test the PR API endpoint
    const response = await axios.get(`http://localhost:3100/api/purchaseRequisition/${testPRId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with your auth token
      }
    });
    
    console.log('PR Response:', JSON.stringify(response.data, null, 2));
    
    // Extract user info from response
    const pr = response.data.result;
    console.log('Approver Display:', typeof pr.approver === 'object' ? pr.approver : pr.approverId);
    console.log('Current Approver Display:', typeof pr.currentApprover === 'object' ? pr.currentApprover : pr.currentApproverId);
    console.log('Requestor Display:', typeof pr.requestor === 'object' ? pr.requestor : pr.requestorId);
  } catch (error) {
    console.error('Error testing PR display:', error.response?.data || error.message);
  }
}

// Run the tests
async function runTests() {
  await testUserInfoEndpoint();
  console.log('-----------------------');
  await testPRDisplay();
}

runTests();
