// Test script to verify item creation with UNSPSC UUID lookup
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

// Helper function to generate a test token
async function generateTestToken() {
  try {
    const user = await User.findOne({
      where: { email: 'admin@erp.com' }
    });

    if (!user) {
      console.error('Admin user not found');
      return null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    console.error('Error generating test token:', error);
    return null;
  }
}

async function testItemCreationWithUnspscLookup() {
  try {
    const token = await generateTestToken();
    
    if (!token) {
      console.error('Failed to generate test token');
      return;
    }

    const api = axios.create({
      baseURL: `http://localhost:${process.env.PORT || 8888}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n--- Testing Item Creation with UNSPSC UUID Lookup ---');
    
    // Step 1: Look up UNSPSC code to get UUID
    const unspscCode = '31151700';
    console.log(`\nStep 1: Looking up UNSPSC code ${unspscCode}`);
    
    const unspscResponse = await api.get(`/unspsc/code/${unspscCode}`);
    const unspscData = unspscResponse.data;
    console.log('UNSPSC data:', JSON.stringify(unspscData, null, 2));
    
    // Step 2: Create item with the UUID
    console.log('\nStep 2: Creating item with UNSPSC UUID');
    const itemData = {
      shortDescription: 'Test Gear Item',
      longDescription: 'This is a test gear item for UNSPSC validation',
      standardDescription: 'Standard gear for testing',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TM-GEAR-001',
      equipmentCategory: 'MECHANICAL',
      equipmentSubCategory: 'GEARS',
      unspscCodeId: unspscData.id,  // Use the UUID, not the code
      uom: 'EA',
      equipmentTag: 'TEST-GEAR-01',
      serialNumber: 'N',
      criticality: 'LOW',
      stockItem: 'Y',
      plannedStock: 'N'
    };
    
    console.log('Item data being sent:', JSON.stringify(itemData, null, 2));
    
    const itemResponse = await api.post('/item', itemData);
    console.log('Item creation response status:', itemResponse.status);
    console.log('Item creation response:', JSON.stringify(itemResponse.data, null, 2));
    
    // Step 3: Verify the item was created with correct UNSPSC relationship
    if (itemResponse.data.success && itemResponse.data.data) {
      const itemId = itemResponse.data.data.id;
      console.log(`\nStep 3: Verifying item ${itemId} with UNSPSC relationship`);
      
      const verifyResponse = await api.get(`/item/${itemId}`);
      console.log('Verification response:', JSON.stringify(verifyResponse.data, null, 2));
      
      if (verifyResponse.data.data.unspsc) {
        console.log('\n✅ SUCCESS: Item created with correct UNSPSC relationship');
        console.log('UNSPSC Code:', verifyResponse.data.data.unspsc.code);
        console.log('UNSPSC Title:', verifyResponse.data.data.unspsc.title);
      } else {
        console.log('\n❌ FAILURE: Item created but UNSPSC relationship not found');
      }
    }

    console.log('\n--- Test completed ---');
  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testItemCreationWithUnspscLookup();
