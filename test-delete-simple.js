// Simple test to check route accessibility
const https = require('https');
const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.port === 443 ? https : http;
        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    data: body
                });
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function testRoutes() {
    console.log('🧪 Testing routes with native HTTP...\n');
    
    try {
        // Test basic API endpoint
        console.log('1. Testing basic API endpoint...');
        const basicTest = await makeRequest({
            hostname: 'localhost',
            port: 8888,
            path: '/api',
            method: 'GET'
        });
        console.log(`✅ Basic API: ${basicTest.status} ${basicTest.statusMessage}`);
        
        // Test inventory GET endpoint
        console.log('\n2. Testing inventory GET endpoint...');
        const inventoryTest = await makeRequest({
            hostname: 'localhost',
            port: 8888,
            path: '/api/inventory',
            method: 'GET'
        });
        console.log(`📋 Inventory GET: ${inventoryTest.status} ${inventoryTest.statusMessage}`);
        
        if (inventoryTest.status === 200) {
            const data = JSON.parse(inventoryTest.data);
            console.log(`📊 Found ${data.length} items`);
            
            if (data.length > 0) {
                const testId = data[0].id;
                console.log(`🎯 Testing DELETE with ID: ${testId}`);
                
                // Test DELETE endpoint
                console.log('\n3. Testing DELETE endpoint...');
                const deleteTest = await makeRequest({
                    hostname: 'localhost',
                    port: 8888,
                    path: `/api/inventory/${testId}`,
                    method: 'DELETE'
                });
                console.log(`🗑️ DELETE response: ${deleteTest.status} ${deleteTest.statusMessage}`);
                console.log(`📄 DELETE data:`, deleteTest.data);
            }
        } else {
            console.log('❌ Cannot test DELETE - inventory GET failed');
            console.log('📄 Response:', inventoryTest.data);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRoutes();
