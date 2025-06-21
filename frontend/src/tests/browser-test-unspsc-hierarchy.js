// Simple browser test for UNSPSC Hierarchy API
// Open the browser console on your ERP application and paste this code

// First, login to get the token
async function testUnspscHierarchy() {
  try {
    console.log('Testing UNSPSC Hierarchy API from browser...');
    
    // Get the stored token from localStorage or sessionStorage
    // This assumes you're already logged in to the application
    const authData = JSON.parse(localStorage.getItem('persist:auth'));
    if (!authData || !authData.current) {
      console.error('No authentication data found. Please log in first.');
      return;
    }
    
    const auth = JSON.parse(authData.current);
    const token = auth.token;
    
    if (!token) {
      console.error('No token found. Please log in first.');
      return;
    }
    
    console.log('Found authentication token');
    
    // Test the UNSPSC hierarchy by level endpoint
    console.log('\nTesting GET /api/unspsc-hierarchy/by-level/SEGMENT endpoint...');
    const segmentsResponse = await fetch('http://localhost:8888/api/unspsc-hierarchy/by-level/SEGMENT', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const segmentsData = await segmentsResponse.json();
    console.log('Response status:', segmentsResponse.status);
    console.log('Response data:', segmentsData);
    
    // Test global UNSPSC segments
    console.log('\nTesting GET /api/unspsc/level/SEGMENT endpoint...');
    const globalSegmentsResponse = await fetch('http://localhost:8888/api/unspsc/level/SEGMENT', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const globalSegmentsData = await globalSegmentsResponse.json();
    console.log('Response status:', globalSegmentsResponse.status);
    console.log('Found', globalSegmentsData.length, 'global segments');
    
    console.log('Test completed!');
  } catch (error) {
    console.error('Error testing UNSPSC Hierarchy API:', error);
  }
}

// Run the test
testUnspscHierarchy();
