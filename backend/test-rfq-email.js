const { 
  RequestForQuotation,
  RfqSupplier,
  Supplier,
  sequelize
} = require('./models/sequelize');

async function testRFQEmail() {
  try {
    await sequelize.authenticate();
    console.log('=== Testing RFQ Email Sending ===');
    
    // Get the first RFQ with suppliers
    const rfq = await RequestForQuotation.findOne({
      include: [{
        model: RfqSupplier,
        as: 'suppliers',
        include: [{
          model: Supplier,
          as: 'supplier'
        }]
      }]
    });
    
    if (!rfq) {
      console.log('❌ No RFQ found');
      return;
    }
    
    console.log(`Found RFQ: ${rfq.rfqNumber}`);
    console.log(`Suppliers: ${rfq.suppliers?.length || 0}`);
    
    if (rfq.suppliers && rfq.suppliers.length > 0) {
      const firstSupplier = rfq.suppliers[0];
      console.log(`First supplier: ${firstSupplier.supplierName}`);
      console.log(`Email: ${firstSupplier.contactEmail || 'No email'}`);
      
      // Test sending email to this supplier
      const nodemailer = require('nodemailer');
      const config = require('./config/config');
      
      const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      });
      
      const testEmail = {
        from: config.email.from,
        to: 'rashadyus10@gmail.com', // Send to your email for testing
        subject: `Test RFQ Email: ${rfq.rfqNumber}`,
        html: `
          <h2>RFQ Email Test</h2>
          <p>This is a test of the RFQ email system.</p>
          <p><strong>RFQ Number:</strong> ${rfq.rfqNumber}</p>
          <p><strong>Description:</strong> ${rfq.description}</p>
          <p><strong>Supplier:</strong> ${firstSupplier.supplierName}</p>
          <p><strong>Response Deadline:</strong> ${new Date(rfq.responseDeadline).toLocaleDateString()}</p>
          <p><a href="http://localhost:3000/rfq/supplier-approval/${rfq.id}">View RFQ</a></p>
        `
      };
      
      const result = await transporter.sendMail(testEmail);
      console.log('✅ Test RFQ email sent successfully!');
      console.log('Message ID:', result.messageId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testRFQEmail();
