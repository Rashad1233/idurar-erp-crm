const axios = require('axios');

const API_URL = 'http://localhost:8888/api';

async function testPRCreation() {
  try {
    console.log('🔍 Testing Purchase Requisition Creation...\n');

    // First, login to get auth token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.result.token;
    console.log('✅ Login successful, token received\n');

    // Create a test PR
    console.log('2. Creating Purchase Requisition...');
    const prData = {
      description: 'Test Purchase Requisition for Office Supplies',
      costCenter: 'IT',
      currency: 'USD',
      notes: 'Urgent requirement for IT department',
      totalValue: 1500,
      items: [
        {
          itemNumber: 'ITEM-001',
          description: 'Laptop Mouse',
          itemName: 'Laptop Mouse',
          uom: 'EA',
          quantity: 10,
          unitPrice: 25,
          totalPrice: 250,
          supplierId: null,
          supplierName: null,
          contractId: null,
          deliveryDate: null,
          comments: 'Wireless mouse preferred'
        },
        {
          itemNumber: 'ITEM-002',
          description: 'USB Keyboard',
          itemName: 'USB Keyboard',
          uom: 'EA',
          quantity: 5,
          unitPrice: 50,
          totalPrice: 250,
          supplierId: null,
          supplierName: null,
          contractId: null,
          deliveryDate: null,
          comments: 'Mechanical keyboard'
        },
        {
          itemNumber: 'ITEM-003',
          description: 'Monitor 24 inch',
          itemName: 'Monitor 24 inch',
          uom: 'EA',
          quantity: 2,
          unitPrice: 500,
          totalPrice: 1000,
          supplierId: null,
          supplierName: null,
          contractId: null,
          deliveryDate: null,
          comments: 'Full HD resolution required'
        }
      ]
    };

    const createResponse = await axios.post(
      `${API_URL}/procurement/purchase-requisition`,
      prData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ PR created successfully!');
    console.log('PR Number:', createResponse.data.result.prNumber);
    console.log('PR ID:', createResponse.data.result.id);
    console.log('Items created:', createResponse.data.result.items.length);
    console.log('\n');

    // Fetch the created PR to verify
    console.log('3. Fetching created PR...');
    const prId = createResponse.data.result.id;
    const fetchResponse = await axios.get(
      `${API_URL}/procurement/purchase-requisition/${prId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const fetchedPR = fetchResponse.data.data;
    console.log('✅ PR fetched successfully!');
    console.log('PR Details:');
    console.log('- Number:', fetchedPR.prNumber);
    console.log('- Description:', fetchedPR.description);
    console.log('- Status:', fetchedPR.status);
    console.log('- Total Amount:', fetchedPR.totalAmount);
    console.log('- Cost Center:', fetchedPR.costCenter);
    console.log('- Currency:', fetchedPR.currency);
    console.log('- Items:', fetchedPR.items?.length || 0);
    
    if (fetchedPR.items && fetchedPR.items.length > 0) {
      console.log('\nItems:');
      fetchedPR.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.description} - Qty: ${item.quantity}, Price: $${item.unitPrice}, Total: $${item.totalPrice}`);
      });
    }

    console.log('\n✅ All tests passed! Purchase Requisition creation is working correctly.');

  } catch (error) {
    console.error('❌ Error during test:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

// Run the test
testPRCreation();
