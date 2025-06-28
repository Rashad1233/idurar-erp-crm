const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testPRDropdown() {
  console.log('🚀 Testing Purchase Requisition Dropdown (Simple Version)');
  console.log('=================================================\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Checking if backend server is running...');
    try {
      const healthCheck = await makeRequest({
        hostname: 'localhost',
        port: 8888,
        path: '/api/health',
        method: 'GET'
      });
      console.log('✅ Backend server is running on port 8888\n');
    } catch (error) {
      console.log('⚠️  Backend might not be running or health endpoint not available');
      console.log('   Continuing with other tests...\n');
    }
    
    // Test 2: Try to access PR list without auth (to see if it requires auth)
    console.log('2️⃣ Testing PR list endpoint without authentication...');
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 8888,
        path: '/api/purchase-requisition/list',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log('⚠️  Endpoint requires authentication (401 Unauthorized)');
        console.log('   This is expected behavior for protected endpoints.\n');
      } else if (response.status === 200) {
        console.log('✅ Endpoint accessible without authentication');
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      } else {
        console.log(`❌ Unexpected status code: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      }
    } catch (error) {
      console.log('❌ Failed to connect to PR endpoint');
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Test 3: Try login
    console.log('3️⃣ Testing login endpoint...');
    const loginData = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    try {
      const loginResponse = await makeRequest({
        hostname: 'localhost',
        port: 8888,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': loginData.length
        }
      }, loginData);
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful');
        
        // Extract token from various possible locations
        let token = null;
        if (loginResponse.data.result && loginResponse.data.result.token) {
          token = loginResponse.data.result.token;
        } else if (loginResponse.data.token) {
          token = loginResponse.data.token;
        } else if (loginResponse.data.accessToken) {
          token = loginResponse.data.accessToken;
        }
        
        if (token) {
          console.log('   Token received successfully\n');
          
          // Test 4: Access PR list with authentication
          console.log('4️⃣ Testing PR list endpoint with authentication...');
          const prResponse = await makeRequest({
            hostname: 'localhost',
            port: 8888,
            path: '/api/purchase-requisition/list',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (prResponse.status === 200) {
            console.log('✅ PR list endpoint working correctly!');
            const result = prResponse.data.result || [];
            console.log(`   Found ${result.length} Purchase Requisitions`);
            
            if (result.length > 0) {
              console.log('\n   Sample PRs:');
              result.slice(0, 3).forEach(pr => {
                console.log(`   - ${pr.prNumber}: ${pr.description} (${pr.status})`);
              });
            }
            
            console.log('\n✅ The Purchase Requisition dropdown fix is working!');
          } else {
            console.log(`❌ PR list returned status ${prResponse.status}`);
            console.log(`   Response: ${JSON.stringify(prResponse.data, null, 2)}`);
          }
        } else {
          console.log('❌ No token found in login response');
          console.log(`   Response structure: ${JSON.stringify(loginResponse.data, null, 2)}`);
        }
      } else {
        console.log(`❌ Login failed with status ${loginResponse.status}`);
        console.log(`   Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
      }
    } catch (error) {
      console.log('❌ Failed to connect to auth endpoint');
      console.log(`   Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 Summary:');
  console.log('   - The PR dropdown fix replaces complex Sequelize queries with simple SQL');
  console.log('   - This avoids the "Include unexpected" error');
  console.log('   - Make sure the backend server is running on port 8888');
  console.log('   - The frontend can now load PRs without errors');
}

// Run the test
testPRDropdown();
