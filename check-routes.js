const axios = require('axios');

async function checkRoutes() {
    console.log('=== ROUTE ACCESSIBILITY CHECK ===\n');
    
    const baseURL = 'http://localhost:8888';
    const routes = [
        '/api',
        '/api/inventory',
        '/api/inventory/1',
        '/api/auth/login'
    ];
    
    for (const route of routes) {
        try {
            const response = await axios.get(`${baseURL}${route}`);
            console.log(`✅ ${route}: ${response.status} - ${response.statusText}`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${route}: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`🔴 ${route}: Server not running (connection refused)`);
            } else {
                console.log(`❓ ${route}: ${error.message}`);
            }
        }
    }
}

checkRoutes();
