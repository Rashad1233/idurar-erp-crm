const { getTransporter } = require('../config/email');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  async initTransporter() {
    this.transporter = await getTransporter();
  }

  async sendSupplierApprovalEmail(supplier, approvalData) {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }

      if (!this.transporter) {
        throw new Error('Email transporter not available');
      }

      const { acceptanceToken } = approvalData;
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const acceptUrl = `${baseUrl}/supplier-acceptance/${acceptanceToken}?action=accept`;
      const declineUrl = `${baseUrl}/supplier-acceptance/${acceptanceToken}?action=decline`;
      const viewUrl = `${baseUrl}/supplier-acceptance/${acceptanceToken}`;

      const emailTemplate = this.generateSupplierApprovalTemplate({
        supplierName: supplier.legalName || supplier.tradeName,
        contactName: supplier.contactName,
        contactEmail: supplier.contactEmail,
        acceptUrl,
        declineUrl,
        viewUrl,
        approvalNotes: approvalData.approvalNotes
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@company.com',
        to: supplier.contactEmail,
        cc: supplier.contactEmailSecondary || null,
        subject: '🎉 Your Supplier Application Has Been Approved - Action Required',
        html: emailTemplate.html,
        text: emailTemplate.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // For development with Ethereal, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', require('nodemailer').getTestMessageUrl(result));
      }

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: require('nodemailer').getTestMessageUrl(result)
      };
    } catch (error) {
      console.error('Error sending supplier approval email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateSupplierApprovalTemplate({ supplierName, contactName, contactEmail, acceptUrl, declineUrl, viewUrl, approvalNotes }) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Supplier Application Approved</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .email-container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #1890ff, #52c41a);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 30px 20px;
            }
            .company-name {
                color: #1890ff;
                font-weight: bold;
            }
            .action-buttons {
                text-align: center;
                margin: 30px 0;
            }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            .btn-accept {
                background-color: #52c41a;
                color: white;
            }
            .btn-accept:hover {
                background-color: #46a818;
            }
            .btn-decline {
                background-color: #ff4d4f;
                color: white;
            }
            .btn-decline:hover {
                background-color: #d9363e;
            }
            .btn-view {
                background-color: #1890ff;
                color: white;
                margin-top: 10px;
            }
            .info-box {
                background-color: #f6ffed;
                border-left: 4px solid #52c41a;
                padding: 15px;
                margin: 20px 0;
            }
            .footer {
                background-color: #f0f0f0;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .benefits {
                background-color: #f9f9f9;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .benefits ul {
                margin: 0;
                padding-left: 20px;
            }
            .warning {
                background-color: #fff7e6;
                border-left: 4px solid #faad14;
                padding: 10px;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p>Your supplier application has been approved</p>
            </div>
            
            <div class="content">
                <p><strong>Dear ${contactName || 'Supplier Representative'},</strong></p>
                
                <p>We are pleased to inform you that <span class="company-name">${supplierName}</span> has been approved to join our supplier network!</p>
                
                ${approvalNotes ? `
                <div class="info-box">
                    <strong>Approval Notes:</strong><br>
                    ${approvalNotes}
                </div>
                ` : ''}
                
                <div class="benefits">
                    <h3>🚀 What's Next?</h3>
                    <p>By accepting this invitation, you'll gain access to:</p>
                    <ul>
                        <li>📋 Request for Quotations (RFQs)</li>
                        <li>💼 Procurement opportunities</li>
                        <li>📄 Contract management</li>
                        <li>💳 Streamlined payment processing</li>
                        <li>🔧 Dedicated supplier portal</li>
                    </ul>
                </div>
                
                <div class="action-buttons">
                    <a href="${acceptUrl}" class="btn btn-accept">✅ Accept Invitation</a>
                    <a href="${declineUrl}" class="btn btn-decline">❌ Decline Invitation</a>
                </div>
                
                <div class="action-buttons">
                    <a href="${viewUrl}" class="btn btn-view">📄 View Full Details</a>
                </div>
                
                <div class="warning">
                    <strong>⏰ Important:</strong> This invitation will expire in 7 days. Please respond as soon as possible.
                </div>
                
                <p>If you have any questions about this invitation or our supplier program, please don't hesitate to contact our procurement team.</p>
                
                <p>We look forward to a successful partnership!</p>
                
                <p><strong>Best regards,</strong><br>
                The Procurement Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${contactEmail}</p>
                <p>If you're having trouble clicking the buttons above, copy and paste this URL into your web browser: ${viewUrl}</p>
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Congratulations! Your Supplier Application Has Been Approved
    
    Dear ${contactName || 'Supplier Representative'},
    
    We are pleased to inform you that ${supplierName} has been approved to join our supplier network!
    
    ${approvalNotes ? `Approval Notes: ${approvalNotes}\n\n` : ''}
    
    What's Next?
    By accepting this invitation, you'll gain access to:
    - Request for Quotations (RFQs)
    - Procurement opportunities  
    - Contract management
    - Streamlined payment processing
    - Dedicated supplier portal
    
    Please choose one of the following options:
    
    ACCEPT INVITATION: ${acceptUrl}
    DECLINE INVITATION: ${declineUrl}
    VIEW DETAILS: ${viewUrl}
    
    IMPORTANT: This invitation will expire in 7 days. Please respond as soon as possible.
    
    If you have any questions, please contact our procurement team.
    
    We look forward to a successful partnership!
    
    Best regards,
    The Procurement Team
    
    ---
    This email was sent to ${contactEmail}
    © ${new Date().getFullYear()} Your Company Name. All rights reserved.
    `;

    return { html, text };
  }
}

module.exports = new EmailService();