const { RequestForQuotation } = require('./models/sequelize');

async function testRFQData() {
  try {
    console.log('Checking RFQ data...');
    
    const rfqs = await RequestForQuotation.findAll({
      limit: 5,
      attributes: ['id', 'rfqNumber', 'description', 'status', 'createdAt']
    });
    
    console.log(`Found ${rfqs.length} RFQs:`);
    rfqs.forEach(rfq => {
      console.log(`- ID: ${rfq.id}, Number: ${rfq.rfqNumber}, Status: ${rfq.status}, Description: ${rfq.description}`);
    });
    
    if (rfqs.length === 0) {
      console.log('No RFQs found in database. Creating a test RFQ...');
      
      const testRFQ = await RequestForQuotation.create({
        rfqNumber: 'RFQ-TEST-001',
        description: 'Test RFQ for debugging',
        status: 'draft',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdById: 1 // Assuming admin user has ID 1
      });
      
      console.log(`Created test RFQ with ID: ${testRFQ.id}`);
    }
    
  } catch (error) {
    console.error('Error checking RFQ data:', error);
  }
}

testRFQData();