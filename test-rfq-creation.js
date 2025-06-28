// Test RFQ creation
const axios = require('axios');

async function testRFQCreation() {
  console.log('🔍 Testing RFQ creation...');
  
  const BASE_URL = 'http://localhost:8888';
  
  try {
    // Test creating an RFQ
    const rfqData = {
      description: 'Test RFQ for office supplies',
      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      notes: 'This is a test RFQ created for debugging purposes',
      items: [
        {
          description: 'Office chairs',
          quantity: 10,
          uom: 'pieces'
        },
        {
          description: 'Desk lamps',
          quantity: 5,
          uom: 'pieces'
        }
      ],
      suppliers: [
        {
          supplierName: 'Test Supplier 1',
          contactEmail: 'supplier1@test.com',
          contactName: 'John Doe'
        },
        {
          supplierName: 'Test Supplier 2',
          contactEmail: 'supplier2@test.com',
          contactName: 'Jane Smith'
        }
      ]
    };
    
    console.log('\n1. Creating RFQ...');
    const createResponse = await axios.post(`${BASE_URL}/api/procurement/rfq`, rfqData, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ RFQ created successfully!');
    console.log('Response:', createResponse.data);
    
    const rfqId = createResponse.data.data?.id;
    
    if (rfqId) {
      console.log('\n2. Fetching created RFQ...');
      const getResponse = await axios.get(`${BASE_URL}/api/procurement/rfq/${rfqId}`, {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });
      
      console.log('✅ RFQ fetched successfully!');
      console.log('RFQ Details:', JSON.stringify(getResponse.data, null, 2));
    }
    
    console.log('\n3. Fetching all RFQs...');
    const listResponse = await axios.get(`${BASE_URL}/api/procurement/rfq`, {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    });
    
    console.log('✅ RFQ list fetched successfully!');
    console.log(`Found ${listResponse.data.count} RFQs`);
    
  } catch (error) {
    console.error('❌ Error testing RFQ creation:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data?.message);
    console.error('  Error:', error.response?.data?.error);
  }
}

testRFQCreation();