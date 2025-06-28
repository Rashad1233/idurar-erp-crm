const nodemailer = require('nodemailer');
const config = require('./config/config');

async function testEmailSending() {
  console.log('=== Testing Email Sending ===');
  
  // Check if credentials are set
  if (!config.email.user || !config.email.password) {
    console.log('❌ EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
    console.log('See EMAIL-SETUP-GUIDE.md for instructions');
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
  
  // Test connection
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');
  } catch (error) {
    console.log('❌ SMTP Connection Failed:', error.message);
    return;
  }
  
  // Send test email
  const testEmailOptions = {
    from: config.email.from,
    to: config.email.user, // Send to yourself for testing
    subject: 'ERP System Email Test',
    html: `
      <h2>Email Test Successful!</h2>
      <p>This is a test email from your ERP system.</p>
      <p><strong>Configuration:</strong></p>
      <ul>
        <li>Host: ${config.email.host}</li>
        <li>Port: ${config.email.port}</li>
        <li>From: ${config.email.from}</li>
      </ul>
      <p>If you received this email, your Gmail SMTP configuration is working correctly!</p>
    `
  };
  
  try {
    const info = await transporter.sendMail(testEmailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', config.email.user);
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
  }
}

// Run the test
testEmailSending();
