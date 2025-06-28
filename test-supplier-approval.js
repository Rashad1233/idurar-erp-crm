const http = require('http');

// Test supplier approval endpoint
const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/procurement/rfq/131f11cc-d35b-4560-85b1-1967eac91b38/supplier-approve',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  supplierId: 'test-supplier-id',
  comments: 'We approve this RFQ and are ready to provide the requested items.'
});

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
