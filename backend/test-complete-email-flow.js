const { 
  RequestForQuotation,
  RfqSupplier,
  sequelize
} = require('./models/sequelize');

async function testCompleteEmailFlow() {
  try {
    await sequelize.authenticate();
    console.log('=== Complete Email Flow Test ===');
    
    // Find an RFQ with suppliers
    const rfq = await RequestForQuotation.findOne({
      include: [{
        model: RfqSupplier,
        as: 'suppliers'
      }],
      where: {
        status: 'sent' // Look for recently sent RFQs
      }
    });
    
    if (!rfq) {
      console.log('❌ No sent RFQ found');
      return;
    }
    
    console.log(`Found RFQ: ${rfq.rfqNumber}`);
    console.log(`Status: ${rfq.status}`);
    console.log(`Sent At: ${rfq.sentAt}`);
    console.log(`Suppliers: ${rfq.suppliers?.length || 0}`);
    
    if (rfq.suppliers && rfq.suppliers.length > 0) {
      console.log('\n=== Supplier Email Status ===');
      rfq.suppliers.forEach((supplier, index) => {
        console.log(`Supplier ${index + 1}:`);
        console.log(`  Name: ${supplier.supplierName}`);
        console.log(`  Email: ${supplier.contactEmail}`);
        console.log(`  Status: ${supplier.status}`);
        console.log(`  Sent At: ${supplier.sentAt}`);
        console.log(`  Response Token: ${supplier.responseToken ? 'Generated' : 'Not Generated'}`);
        console.log('');
      });
    }
    
    console.log('✅ Email flow test completed!');
    console.log(`Check the email inbox: ${rfq.suppliers[0]?.contactEmail || 'No email found'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testCompleteEmailFlow();
