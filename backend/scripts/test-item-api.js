// Script to test the Item API
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testItemAPI() {
  try {
    // Generate a test token
    const token = jwt.sign(
      { id: '123e4567-e89b-12d3-a456-426614174000', email: 'admin@erp.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Testing Item API...');
    
    const response = await axios.get('http://localhost:8888/api/item', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response structure:', {
      success: response.data.success,
      count: response.data.count,
      dataLength: response.data.data ? response.data.data.length : 0
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('Sample item structure:');
      const sampleItem = response.data.data[0];
      console.log(JSON.stringify(sampleItem, null, 2));
      
      console.log('\nKey fields check:');
      console.log('- itemNumber:', sampleItem.itemNumber);
      console.log('- shortDescription:', sampleItem.shortDescription);
      console.log('- manufacturerName:', sampleItem.manufacturerName);
      console.log('- unspsc:', sampleItem.unspsc);
      console.log('- status:', sampleItem.status);
    } else {
      console.log('No items found in database');
    }
    
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testItemAPI();
