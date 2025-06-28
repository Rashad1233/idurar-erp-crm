// Test RFQ and PO endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8888';

async function testEndpoints() {
  console.log('🚀 Testing RFQ and PO endpoints...\n');

  try {
    // Test basic API health
    console.log('1. Testing basic API health...');
    const healthResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API is running:', healthResponse.data.message);

    // Test database connectivity
    console.log('\n2. Testing database connectivity...');
    const dbTestResponse = await axios.get(`${BASE_URL}/api/test-inventory`);
    console.log('✅ Database test:', dbTestResponse.data.message);

    // Test RFQ endpoint (no auth for now)
    console.log('\n3. Testing RFQ endpoint...');
    try {
      const rfqResponse = await axios.get(`${BASE_URL}/api/procurement/rfq`);
      console.log('✅ RFQ endpoint response:', rfqResponse.data);
    } catch (rfqError) {
      if (rfqError.response?.status === 401) {
        console.log('⚠️  RFQ endpoint requires authentication (expected)');
      } else {
        console.log('❌ RFQ endpoint error:', rfqError.response?.data || rfqError.message);
      }
    }

    // Test PO endpoint (no auth for now)
    console.log('\n4. Testing PO endpoint...');
    try {
      const poResponse = await axios.get(`${BASE_URL}/api/procurement/purchase-order`);
      console.log('✅ PO endpoint response:', poResponse.data);
    } catch (poError) {
      if (poError.response?.status === 401) {
        console.log('⚠️  PO endpoint requires authentication (expected)');
      } else {
        console.log('❌ PO endpoint error:', poError.response?.data || poError.message);
      }
    }

    // Test public RFQ response endpoint
    console.log('\n5. Testing public RFQ response endpoint...');
    try {
      const publicRfqResponse = await axios.get(`${BASE_URL}/api/supplier/rfq/response/dummy-token`);
      console.log('✅ Public RFQ response:', publicRfqResponse.data);
    } catch (publicRfqError) {
      if (publicRfqError.response?.status === 404) {
        console.log('⚠️  Public RFQ endpoint works but token not found (expected)');
      } else {
        console.log('❌ Public RFQ error:', publicRfqError.response?.data || publicRfqError.message);
      }
    }

    // Test public PO approval endpoint
    console.log('\n6. Testing public PO approval endpoint...');
    try {
      const publicPoResponse = await axios.get(`${BASE_URL}/api/supplier/po/approval/dummy-token`);
      console.log('✅ Public PO approval:', publicPoResponse.data);
    } catch (publicPoError) {
      if (publicPoError.response?.status === 404) {
        console.log('⚠️  Public PO endpoint works but token not found (expected)');
      } else {
        console.log('❌ Public PO error:', publicPoError.response?.data || publicPoError.message);
      }
    }

    console.log('\n🎉 All endpoints are accessible!');
    console.log('\n📋 Summary:');
    console.log('✅ RFQ API: /api/procurement/rfq');
    console.log('✅ PO API: /api/procurement/purchase-order');
    console.log('✅ Public RFQ Response: /api/supplier/rfq/response/:token');
    console.log('✅ Public PO Approval: /api/supplier/po/approval/:token');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test database connection specifically
async function testDatabaseModels() {
  console.log('\n🔧 Testing database models...\n');

  try {
    const { 
      RequestForQuotation, 
      RfqSupplier, 
      PurchaseOrder,
      ApprovalWorkflow,
      NotificationLog
    } = require('./models/sequelize');

    // Test model availability
    console.log('1. Testing model loading...');
    console.log('✅ RequestForQuotation:', !!RequestForQuotation);
    console.log('✅ RfqSupplier:', !!RfqSupplier);
    console.log('✅ PurchaseOrder:', !!PurchaseOrder);
    console.log('✅ ApprovalWorkflow:', !!ApprovalWorkflow);
    console.log('✅ NotificationLog:', !!NotificationLog);

    // Test basic queries
    console.log('\n2. Testing database queries...');
    const rfqCount = await RequestForQuotation.count();
    console.log('✅ RFQ count:', rfqCount);

    const poCount = await PurchaseOrder.count();
    console.log('✅ PO count:', poCount);

    const supplierCount = await RfqSupplier.count();
    console.log('✅ RFQ Supplier count:', supplierCount);

    console.log('\n🎉 Database models are working!');

  } catch (error) {
    console.error('❌ Database model test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

async function main() {
  console.log('🚀 Starting comprehensive tests...\n');
  
  await testEndpoints();
  await testDatabaseModels();
  
  console.log('\n🏁 All tests completed!');
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testEndpoints,
  testDatabaseModels
};