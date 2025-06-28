const { RfqSupplier, Supplier } = require('./backend/models/sequelize');

async function testRFQSupplierData() {
  try {
    console.log('🔍 Testing RFQ supplier data...');
    
    // Get all RFQ suppliers
    const rfqSuppliers = await RfqSupplier.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📋 Found ${rfqSuppliers.length} RFQ suppliers:`);
    rfqSuppliers.forEach(supplier => {
      console.log(`\n📄 RFQ Supplier:`);
      console.log(`  ID: ${supplier.id}`);
      console.log(`  RFQ ID: ${supplier.requestForQuotationId}`);
      console.log(`  Supplier Name: ${supplier.supplierName}`);
      console.log(`  Contact Name: ${supplier.contactName}`);
      console.log(`  Contact Email: ${supplier.contactEmail}`);
      console.log(`  Contact Phone: ${supplier.contactPhone}`);
      console.log(`  Status: ${supplier.status}`);
    });
    
    // Also check the original suppliers table
    console.log('\n🏢 Original Suppliers:');
    const originalSuppliers = await Supplier.findAll({
      attributes: ['id', 'legalName', 'contactEmail', 'contactPhone'],
      order: [['createdAt', 'DESC']]
    });
    
    originalSuppliers.forEach(supplier => {
      console.log(`  - ${supplier.legalName}: ${supplier.contactEmail} | Phone: ${supplier.contactPhone || 'No phone'}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing RFQ supplier data:', error);
  } finally {
    process.exit(0);
  }
}

testRFQSupplierData();