// Test frontend RFQ API call
const axios = require('axios');

async function testFrontendRFQ() {
  console.log('🔍 Testing frontend RFQ API call...');
  
  try {
    // Simulate the frontend API call
    const response = await axios.get('http://localhost:8888/api/procurement/rfq', {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check the structure
    const data = response.data;
    if (data.success) {
      console.log('\n📊 Data Analysis:');
      console.log('  - Success:', data.success);
      console.log('  - Count:', data.count);
      console.log('  - Data field exists:', !!data.data);
      console.log('  - Data is array:', Array.isArray(data.data));
      console.log('  - Number of RFQs:', data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        console.log('\n🔍 First RFQ structure:');
        const firstRFQ = data.data[0];
        console.log('  - ID:', firstRFQ.id);
        console.log('  - RFQ Number:', firstRFQ.rfqNumber);
        console.log('  - Description:', firstRFQ.description);
        console.log('  - Status:', firstRFQ.status);
        console.log('  - Response Deadline:', firstRFQ.responseDeadline);
        console.log('  - Created At:', firstRFQ.createdAt);
        console.log('  - Suppliers:', firstRFQ.suppliers?.length || 0);
        console.log('  - Items:', firstRFQ.items?.length || 0);
      }
    } else {
      console.log('❌ API returned success: false');
      console.log('  - Message:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend RFQ API:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data?.message);
    console.error('  Error:', error.response?.data?.error);
  }
}

testFrontendRFQ();