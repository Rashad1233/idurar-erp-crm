const { RequestForQuotation, RfqItem, RfqSupplier } = require('./backend/models/sequelize');

async function testRFQRead() {
  try {
    console.log('🔍 Testing RFQ read functionality...');
    
    // Get all RFQs first
    const allRFQs = await RequestForQuotation.findAll({
      attributes: ['id', 'rfqNumber', 'description', 'status'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📋 Found ${allRFQs.length} RFQs:`);
    allRFQs.forEach(rfq => {
      console.log(`  - ${rfq.rfqNumber}: ${rfq.description} (${rfq.status})`);
    });
    
    if (allRFQs.length > 0) {
      const testRFQ = allRFQs[0];
      console.log(`\n🔍 Testing read for RFQ: ${testRFQ.rfqNumber} (ID: ${testRFQ.id})`);
      
      // Get full RFQ details
      const rfq = await RequestForQuotation.findByPk(testRFQ.id);
      console.log('RFQ Details:', {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        description: rfq.description,
        status: rfq.status,
        dueDate: rfq.dueDate,
        notes: rfq.notes
      });
      
      // Get RFQ items
      const items = await RfqItem.findAll({
        where: { requestForQuotationId: testRFQ.id }
      });
      console.log(`📦 RFQ Items: ${items.length}`);
      items.forEach(item => {
        console.log(`  - ${item.description} (Qty: ${item.quantity})`);
      });
      
      // Get RFQ suppliers
      const suppliers = await RfqSupplier.findAll({
        where: { requestForQuotationId: testRFQ.id }
      });
      console.log(`🏢 RFQ Suppliers: ${suppliers.length}`);
      suppliers.forEach(supplier => {
        console.log(`  - ${supplier.supplierName} (${supplier.contactEmail})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing RFQ read:', error);
  } finally {
    process.exit(0);
  }
}

testRFQRead();