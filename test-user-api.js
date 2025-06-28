// Test script for user info API
const axios = require('axios');

// Replace this with the actual user ID from the database
const USER_ID = '0b4afa3e-8582-452b-833c-f8bf695c4d60'; // System Administrator ID 
const API_URL = 'http://localhost:3100/api';

async function testUserInfoAPI() {
  console.log('Testing User Info API...');
  try {
    // First try the enhanced user-info endpoint
    const response = await axios.get(`${API_URL}/user-info/users/${USER_ID}`, {
      headers: {
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('User Info Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing user info API:', error.response?.status, error.response?.data || error.message);
    
    // Try fallback to regular users endpoint if available
    try {
      console.log('Trying fallback user endpoint...');
      const fallbackResponse = await axios.get(`${API_URL}/users/${USER_ID}`);
      console.log('Fallback Response:');
      console.log(JSON.stringify(fallbackResponse.data, null, 2));
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.response?.status, fallbackError.response?.data || fallbackError.message);
    }
  }
}

// Run the test
testUserInfoAPI()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));
