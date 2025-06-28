const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// For testing purposes, create an Ethereal account if no email config is provided
const createTestTransporter = async () => {
  try {
    // Generate test SMTP service account from ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Error creating test transporter:', error);
    return null;
  }
};

// Get the appropriate transporter
const getTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📧 Using Gmail SMTP configuration');
    return createTransporter();
  } else {
    console.log('📧 Email credentials not found, using test transporter');
    return await createTestTransporter();
  }
};

module.exports = {
  getTransporter,
  createTestTransporter
};