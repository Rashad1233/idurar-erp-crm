// Basic test for checking the server status
const axios = require('axios');

const API_URL = 'http://localhost:3100';

async function checkServerStatus() {
  try {
    console.log('Checking server status...');
    const response = await axios.get(`${API_URL}/api/health-check`, { 
      timeout: 5000 
    });
    console.log('Server response:', response.status, response.data);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. The server appears to be down.');
    } else {
      console.error('Error checking server:', error.message);
    }
    return false;
  }
}

checkServerStatus();
