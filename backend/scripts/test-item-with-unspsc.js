// Script to test item creation with UNSPSC code
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, UnspscCode, ItemMaster } = require('../models/sequelize');

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

// Test creating an item with UNSPSC code
async function testItemCreationWithUnspsc() {
  try {
    console.log('=== Testing Item Creation with UNSPSC Code ===');
    
    // 1. Get a sample UNSPSC code from the database
    const unspscCode = await UnspscCode.findOne({
      where: { level: 'COMMODITY' },
      limit: 1
    });
    
    if (!unspscCode) {
      console.error('No UNSPSC commodity codes found in database');
      return;
    }
    
    console.log('Using UNSPSC Code:');
    console.log('ID:', unspscCode.id);
    console.log('Code:', unspscCode.code);
    console.log('Title:', unspscCode.title);
    console.log('Level:', unspscCode.level);
    
    // 2. Generate test token
    const token = await generateTestToken();
    if (!token) {
      console.error('Failed to generate test token');
      return;
    }
    
    // 3. Create test item data
    const testItemData = {
      shortDescription: 'Test Ball Bearing with UNSPSC',
      longDescription: 'This is a test ball bearing item with proper UNSPSC classification',
      standardDescription: 'Standard ball bearing for testing purposes',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TEST-BB-001',
      equipmentCategory: 'MECHANICAL',
      equipmentSubCategory: 'BEARINGS',
      unspscCodeId: unspscCode.id, // Use the actual UUID from database
      uom: 'EA',
      equipmentTag: 'TEST-TAG-001',
      serialNumber: 'N',
      criticality: 'LOW',
      stockItem: 'Y',
      plannedStock: 'N'
    };
    
    console.log('\nTest item data to send:');
    console.log(JSON.stringify(testItemData, null, 2));
    
    // 4. Create axios instance with token
    const api = axios.create({
      baseURL: `http://localhost:${process.env.PORT || 8888}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 5. Send POST request to create item
    console.log('\n--- Creating item via API ---');
    const response = await api.post('/item', testItemData);
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // 6. Verify the item was created with UNSPSC code
    const createdItemId = response.data.data.id;
    console.log('\n--- Verifying created item ---');
    
    const verifyResponse = await api.get(`/item/${createdItemId}`);
    console.log('Verification response:', JSON.stringify(verifyResponse.data, null, 2));
    
    // 7. Check if UNSPSC code is properly associated
    const itemWithUnspsc = await ItemMaster.findByPk(createdItemId, {
      include: [
        { model: UnspscCode, as: 'unspsc' }
      ]
    });
    
    console.log('\n--- Direct database check ---');
    console.log('Item ID:', itemWithUnspsc.id);
    console.log('Item Number:', itemWithUnspsc.itemNumber);
    console.log('Short Description:', itemWithUnspsc.shortDescription);
    console.log('UNSPSC Code ID:', itemWithUnspsc.unspscCodeId);
    
    if (itemWithUnspsc.unspsc) {
      console.log('UNSPSC Details:');
      console.log('  ID:', itemWithUnspsc.unspsc.id);
      console.log('  Code:', itemWithUnspsc.unspsc.code);
      console.log('  Title:', itemWithUnspsc.unspsc.title);
      console.log('  Level:', itemWithUnspsc.unspsc.level);
      console.log('✅ UNSPSC code is properly linked!');
    } else {
      console.log('❌ UNSPSC code is NOT linked to the item');
    }
    
    console.log('\n=== Test completed successfully ===');
    
  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testItemCreationWithUnspsc()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
