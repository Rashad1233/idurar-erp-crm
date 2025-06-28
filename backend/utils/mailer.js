const nodemailer = require('nodemailer');

// Configure your SMTP settings here
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your@email.com',
    pass: process.env.SMTP_PASSWORD || 'yourpassword',
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @returns {Promise}
 */
async function sendMail({ to, subject, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'ERP System <no-reply@erp.com>',
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
