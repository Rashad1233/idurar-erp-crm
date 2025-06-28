// Test script to validate the fix for user display in Purchase Requisition
const axios = require('axios');

async function testUserDisplay() {
  try {
    console.log('Testing PR user display fix...');
    
    // Get a token first (adjust these credentials as needed)
    const authResponse = await axios.post('http://localhost:3100/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (!authResponse.data.token) {
      console.error('Failed to get auth token');
      return;
    }
    
    const token = authResponse.data.token;
    console.log('Got auth token');
    
    // Set up headers for subsequent requests
    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };
    
    // 1. Test user info endpoint directly with the user ID from the screenshot
    console.log('\n===== Testing User Info Endpoint =====');
    const testUserId = '0b4afa3e-8582-452b-833c-f8bf695c4d60'; // From the screenshot
    
    try {
      const userResponse = await axios.get(`http://localhost:3100/api/user-info/users/${testUserId}`, config);
      console.log('User Info Response:', JSON.stringify(userResponse.data, null, 2));
    } catch (error) {
      console.error('Error testing user endpoint:', error.message);
      console.log('Response data if available:', error.response?.data);
    }
    
    // 2. Test a PR to see how users are displayed
    console.log('\n===== Testing PR Display =====');
    try {
      // Get list of PRs to find one to test
      const prsResponse = await axios.get('http://localhost:3100/api/procurement/purchase-requisition', config);
      
      if (prsResponse.data.result && prsResponse.data.result.length > 0) {
        const testPR = prsResponse.data.result[0];
        console.log(`Testing PR with ID: ${testPR.id}`);
        
        // Get detailed PR data
        const prResponse = await axios.get(`http://localhost:3100/api/procurement/purchase-requisition/${testPR.id}`, config);
        const pr = prResponse.data.result;
        
        console.log('\nUser Info in PR:');
        console.log('- Approver:', pr.approver ? 
          (typeof pr.approver === 'object' ? 
            JSON.stringify(pr.approver) : 
            pr.approver) : 
          'Not set');
        
        console.log('- ApproverId:', pr.approverId || 'Not set');
        
        console.log('- Current Approver:', pr.currentApprover ? 
          (typeof pr.currentApprover === 'object' ? 
            JSON.stringify(pr.currentApprover) : 
            pr.currentApprover) : 
          'Not set');
          
        console.log('- CurrentApproverId:', pr.currentApproverId || 'Not set');
        
        console.log('- Requestor:', pr.requestor ? 
          (typeof pr.requestor === 'object' ? 
            JSON.stringify(pr.requestor) : 
            pr.requestor) : 
          'Not set');
          
        console.log('- RequestorId:', pr.requestorId || 'Not set');
      } else {
        console.log('No PRs found to test');
      }
    } catch (error) {
      console.error('Error testing PR display:', error.message);
      console.log('Response data if available:', error.response?.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testUserDisplay();
