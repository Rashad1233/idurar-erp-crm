const http = require('http');

// Test the PR list endpoint to see the actual error
const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/purchase-requisition/list',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // Add a test token - you may need to replace this with a valid token
    'Authorization': 'Bearer test-token'
  }
};

console.log('Testing Purchase Requisition list endpoint...');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.end();
