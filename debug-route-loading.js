const express = require('express');

async function debugRouteLoading() {
    console.log('=== ROUTE LOADING DIAGNOSTICS ===\n');
    
    try {
        // Test 1: Load inventory routes
        console.log('1. Testing inventory routes import...');
        const inventoryRoutes = require('./backend/routes/inventoryRoutes.js');
        console.log('✅ Inventory routes imported successfully');
        
        // Test 2: Check if router has routes
        if (inventoryRoutes.stack) {
            console.log(`✅ Router has ${inventoryRoutes.stack.length} routes registered`);
            
            // List all routes
            console.log('\n📋 Registered routes:');
            inventoryRoutes.stack.forEach((layer, index) => {
                const route = layer.route;
                if (route) {
                    const methods = Object.keys(route.methods).join(', ').toUpperCase();
                    console.log(`   ${index + 1}. ${methods} ${route.path}`);
                }
            });
        } else {
            console.log('❌ Router has no stack property or routes');
        }
        
        // Test 3: Try importing controller
        console.log('\n2. Testing inventory controller import...');
        const inventoryController = require('./backend/controllers/inventoryController.js');
        console.log('✅ Inventory controller imported successfully');
        
        // Test 4: Check if deleteInventory function exists
        if (inventoryController.deleteInventory) {
            console.log('✅ deleteInventory function found in controller');
        } else {
            console.log('❌ deleteInventory function NOT found in controller');
            console.log('Available functions:', Object.keys(inventoryController));
        }
        
        // Test 5: Try creating a test Express app
        console.log('\n3. Testing route registration...');
        const testApp = express();
        testApp.use('/api/inventory', inventoryRoutes);
        console.log('✅ Routes registered successfully in test app');
        
        // Test 6: Check middleware
        console.log('\n4. Testing auth middleware import...');
        const { protect } = require('./backend/middleware/authMiddleware.js');
        console.log('✅ Auth middleware imported successfully');
        
    } catch (error) {
        console.error('❌ Error during diagnostics:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

debugRouteLoading();
