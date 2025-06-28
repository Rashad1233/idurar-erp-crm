const nodemailer = require('nodemailer');
const config = require('./config/config');

console.log('=== Email Configuration Test ===');
console.log('Host:', config.email.host);
console.log('Port:', config.email.port);
console.log('Secure:', config.email.secure);
console.log('User:', config.email.user ? '[SET]' : '[NOT SET]');
console.log('Password:', config.email.password ? '[SET]' : '[NOT SET]');
console.log('From:', config.email.from);

// Test transporter creation
try {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });

  console.log('\n=== Transporter Created Successfully ===');
  
  // Test connection (if credentials are provided)
  if (config.email.user && config.email.password) {
    console.log('Testing SMTP connection...');
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ SMTP Connection Failed:', error.message);
      } else {
        console.log('✅ SMTP Connection Successful!');
      }
    });
  } else {
    console.log('⚠️ EMAIL_USER and/or EMAIL_PASSWORD not set - cannot test connection');
    console.log('\nTo fix email sending, you need to set these environment variables:');
    console.log('EMAIL_USER=your-gmail-address@gmail.com');
    console.log('EMAIL_PASSWORD=your-app-password');
    console.log('EMAIL_FROM=Your Name <your-gmail-address@gmail.com>');
    console.log('\nFor Gmail SMTP, you need to:');
    console.log('1. Enable 2-factor authentication on your Gmail account');
    console.log('2. Generate an App Password (not your regular password)');
    console.log('3. Use the App Password as EMAIL_PASSWORD');
  }
} catch (error) {
  console.error('❌ Error creating transporter:', error.message);
}
