// Test DELETE route functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api';

async function testDeleteRoute() {
    console.log('🧪 Testing DELETE route functionality...\n');

    try {
        // Step 1: Test if we can get inventory items (to get a valid ID)
        console.log('Step 1: Getting inventory items...');
        const getResponse = await axios.get(`${API_BASE_URL}/inventory`);
        console.log('✅ GET /api/inventory status:', getResponse.status);
        
        if (getResponse.data && getResponse.data.length > 0) {
            const firstItem = getResponse.data[0];
            console.log(`📋 Found ${getResponse.data.length} inventory items`);
            console.log(`🔍 Testing with item ID: ${firstItem.id}`);
            console.log(`📝 Item details:`, {
                id: firstItem.id,
                inventoryNumber: firstItem.inventoryNumber,
                description: firstItem.itemMaster?.shortDescription
            });

            // Step 2: Test DELETE route without authentication
            console.log('\nStep 2: Testing DELETE without authentication...');
            try {
                await axios.delete(`${API_BASE_URL}/inventory/${firstItem.id}`);
                console.log('✅ DELETE successful without auth');
            } catch (error) {
                console.log('❌ DELETE failed without auth:', error.response?.status, error.response?.statusText);
                console.log('📄 Error details:', error.response?.data);

                // Step 3: Test DELETE route with mock authentication
                console.log('\nStep 3: Testing DELETE with mock authentication...');
                try {
                    await axios.delete(`${API_BASE_URL}/inventory/${firstItem.id}`, {
                        headers: {
                            'Authorization': 'Bearer fake-token',
                            'x-auth-token': 'fake-token'
                        }
                    });
                    console.log('✅ DELETE successful with mock auth');
                } catch (authError) {
                    console.log('❌ DELETE failed with auth:', authError.response?.status, authError.response?.statusText);
                    console.log('📄 Auth error details:', authError.response?.data);
                }
            }

            // Step 4: Test route existence by checking all available routes
            console.log('\nStep 4: Testing route existence...');
            try {
                // Test if the route exists by making an OPTIONS request
                const optionsResponse = await axios.options(`${API_BASE_URL}/inventory/${firstItem.id}`);
                console.log('✅ OPTIONS request successful:', optionsResponse.status);
                console.log('📋 Allowed methods:', optionsResponse.headers['access-control-allow-methods']);
            } catch (optionsError) {
                console.log('❌ OPTIONS request failed:', optionsError.response?.status);
                
                // Try a different approach - test with invalid method to see what's allowed
                try {
                    await axios.patch(`${API_BASE_URL}/inventory/${firstItem.id}`);
                } catch (methodError) {
                    console.log('📋 Method error response:', methodError.response?.status, methodError.response?.statusText);
                    console.log('📄 Method error details:', methodError.response?.data);
                }
            }
        } else {
            console.log('❌ No inventory items found to test with');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('📄 Response status:', error.response.status);
            console.error('📄 Response data:', error.response.data);
        }
    }
}

// Run the test
testDeleteRoute().catch(console.error);
