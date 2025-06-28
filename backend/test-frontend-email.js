const http = require('http');

// Test the frontend RFQ send endpoint
const testData = {
  supplierIds: ['test-supplier-id'],
  message: 'This is a test message from the procurement team.',
  emailSubject: 'Test RFQ Email from Frontend'
};

const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/procurement/rfq/131f11cc-d35b-4560-85b1-1967eac91b38/send',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(testData).length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  console.log('Response Status:', res.statusCode);
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (response.emailResults) {
        console.log('\n=== Email Results ===');
        response.emailResults.forEach((result, index) => {
          console.log(`Email ${index + 1}:`);
          console.log(`  Supplier ID: ${result.supplierId}`);
          console.log(`  Status: ${result.status}`);
          console.log(`  Email: ${result.email}`);
          if (result.error) {
            console.log(`  Error: ${result.error}`);
          }
        });
      }
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(JSON.stringify(testData));
req.end();
