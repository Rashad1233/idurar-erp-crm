const nodemailer = require('./backend/node_modules/nodemailer');
require('dotenv').config({ path: './backend/.env' });

async function testEmail() {
  try {
    console.log('=== Testing Email Configuration ===\n');
    
    console.log('Email config:');
    console.log('HOST:', process.env.EMAIL_HOST);
    console.log('PORT:', process.env.EMAIL_PORT);
    console.log('USER:', process.env.EMAIL_USER);
    console.log('PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
    console.log('FROM:', process.env.EMAIL_FROM);
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Test connection
    console.log('\n=== Testing SMTP Connection ===');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    console.log('\n=== Sending Test Email ===');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'yousoubof@gmail.com',
      subject: 'Test Email from ERP System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify email functionality is working.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
