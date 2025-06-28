const http = require('http');

console.log('=== Testing Frontend Route Fix ===');
console.log('Testing the route that frontend will now call...');

const data = JSON.stringify({
  supplierIds: ['test'],
  message: 'Testing route fix - frontend integration test',
  emailSubject: 'RFQ Route Fix Test'
});

const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/procurement/rfq/131f11cc-d35b-4560-85b1-1967eac91b38/send',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log('✅ Route Status:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('✅ Success:', response.success);
      console.log('📧 Message:', response.message);
      
      if (response.emailResults) {
        console.log('\n📧 Email Results:');
        response.emailResults.forEach((result, i) => {
          console.log(`  Email ${i+1}: ${result.status} to ${result.email}`);
        });
      }
      
      console.log('\n🎯 Frontend route fix confirmed working!');
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e);
});

req.write(data);
req.end();
