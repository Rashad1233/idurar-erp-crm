const { generateText } = require('../services/aiService');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const { generateRFQResponseToken, generatePOApprovalToken } = require('../utils/tokenGenerator');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Send contract approval email to supplier
exports.sendContractEmail = async (req, res) => {
  try {
    const { to, subject, contractId, contractNumber, supplierName, type } = req.body;

    // Generate AI-powered email content
    const emailPrompt = `
    Generate a professional HTML email template to request contract acceptance from a supplier.
    
    Context:
    - Supplier Name: ${supplierName}
    - Contract Number: ${contractNumber}
    - Subject: ${subject}
    - Email Type: ${type}
    
    IMPORTANT: This email is asking the supplier to ACCEPT a contract offer, NOT congratulating them on approval.
    
    Requirements:
    1. Create a complete HTML email with professional styling
    2. Use a professional but inviting tone (NOT congratulatory)
    3. Clearly explain that we have prepared a contract for them
    4. Request them to review and accept the contract terms
    5. Emphasize that their acceptance is required to proceed
    6. Use modern email-safe CSS styling with inline styles
    7. Include proper headers and structure
    8. Make it clear this is a contract offer awaiting their acceptance
    9. Add a professional business header
    
    The email should:
    - Inform that a contract has been prepared for them to review
    - Request their review and acceptance of the contract terms
    - Explain that their acceptance will activate the contract
    - Be professional and clear about the action needed from them
    
    IMPORTANT: 
    - DO NOT congratulate them on any approval
    - DO NOT say the contract is already approved/active
    - DO NOT include any URLs, links, or buttons in the generated content
    - DO NOT include placeholder URLs like "yourcompany.com" or "example.com"
    - DO NOT include "click here" or "accept contract" buttons
    - The acceptance button will be added separately
    - Focus on requesting their acceptance of the contract offer
    
    Generate ONLY the HTML content for the email body with inline CSS styling. Do not include DOCTYPE or html/body tags.
    `;

    let emailContent;
    
    try {
      emailContent = await generateText(emailPrompt);
    } catch (aiError) {
      console.log('⚠️ AI service unavailable, using fallback email template');
      // Fallback email template if AI service is not available
      emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📋 Contract Acceptance Required</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${supplierName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We have prepared a contract for your review and acceptance. Please review the contract terms below and accept to proceed with our partnership.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #1890ff; margin: 0 0 15px 0;">Contract Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Contract Number:</strong> ${contractNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Supplier:</strong> ${supplierName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Awaiting Your Acceptance</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your acceptance of this contract will activate our agreement and begin our business collaboration. Please review the terms carefully before accepting.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions about this contract, please contact our procurement team before accepting.
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Best regards,<br>
            <strong>Contract Management Team</strong>
          </p>
        </div>
      </div>
      `;
    }

    // Create email with embedded acceptance button
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
    const acceptanceUrl = `${frontendUrl}/contract-acceptance/${contractId}`;
    
    const htmlContent = `
    ${emailContent}
    
    <div style="background-color: #f8f9fa; padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <h3 style="color: #1890ff; margin-bottom: 20px; font-size: 18px;">Action Required</h3>
      <p style="color: #666; margin-bottom: 25px; font-size: 14px;">
        Please click the button below to review and accept the contract terms.
      </p>
      <a href="${acceptanceUrl}" 
         style="background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                font-weight: bold; 
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
                transition: all 0.3s ease;">
        🤝 Accept Contract & Start Collaboration
      </a>
      <p style="color: #999; margin-top: 20px; font-size: 12px;">
        This link will remain active for 30 days from the date of this email.
      </p>
    </div>
    
    <div style="border-top: 1px solid #e8e8e8; margin-top: 40px; padding-top: 20px;">
      <p style="color: #666; font-size: 12px; line-height: 1.5;">
        <strong>Important:</strong> This email was automatically generated by our Contract Management System.
        If you have any questions about this contract or need assistance, please contact our procurement team.
      </p>
      <p style="color: #999; font-size: 11px; margin-top: 15px;">
        Contract Management System | ${new Date().getFullYear()} | All rights reserved
      </p>
    </div>
    `;

    // Send email (using configured email service)
    await sendEmail({
      to,
      subject,
      html: htmlContent,
      from: process.env.EMAIL_FROM || process.env.COMPANY_EMAIL || 'procurement@company.com'
    });

    // Log the email activity
    console.log(`📧 Contract approval email sent to supplier: ${to}`);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: { emailSent: true, recipient: to }
    });

  } catch (error) {
    console.error('❌ Error sending contract email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Send RFQ invitation email to supplier
exports.sendRFQEmail = async (req, res) => {
  try {
    const { to, subject, rfqId, rfqNumber, supplierName, submissionDeadline, description, token } = req.body;

    // Generate AI-powered email content
    const emailPrompt = `
    Generate a professional HTML email template to invite a supplier to respond to a Request for Quotation (RFQ).
    
    Context:
    - Supplier Name: ${supplierName}
    - RFQ Number: ${rfqNumber}
    - Subject: ${subject}
    - Submission Deadline: ${submissionDeadline}
    - Description: ${description}
    
    Requirements:
    1. Create a complete HTML email with professional styling
    2. Use a professional and inviting tone
    3. Clearly explain that we are requesting a quotation from them
    4. Emphasize the submission deadline
    5. Use modern email-safe CSS styling with inline styles
    6. Include proper headers and structure
    7. Make it clear this is an RFQ invitation requiring their response
    8. Add a professional business header
    
    The email should:
    - Inform that they have been selected to quote on this RFQ
    - Request their quotation for the specified items/services
    - Emphasize the importance of meeting the submission deadline
    - Be professional and clear about the action needed from them
    
    IMPORTANT: 
    - DO NOT include any URLs, links, or buttons in the generated content
    - DO NOT include placeholder URLs
    - DO NOT include "click here" or "submit quote" buttons
    - The quotation button will be added separately
    - Focus on requesting their quotation response
    
    Generate ONLY the HTML content for the email body with inline CSS styling. Do not include DOCTYPE or html/body tags.
    `;

    let emailContent;
    
    try {
      emailContent = await generateText(emailPrompt);
    } catch (aiError) {
      console.log('⚠️ AI service unavailable, using fallback email template');
      // Fallback email template if AI service is not available
      emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🛒 Request for Quotation</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${supplierName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We are pleased to invite you to submit a quotation for the following procurement opportunity. Your expertise and services align well with our requirements.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #52c41a; margin: 0 0 15px 0;">RFQ Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>RFQ Number:</strong> ${rfqNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Submission Deadline:</strong> ${submissionDeadline}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Description:</strong> ${description}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Awaiting Your Quotation</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Please review the requirements carefully and submit your competitive quotation by the deadline. Your response will be evaluated fairly alongside other qualified suppliers.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions about this RFQ, please contact our procurement team before submitting your response.
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Best regards,<br>
            <strong>Procurement Team</strong>
          </p>
        </div>
      </div>
      `;
    }

    // Create email with embedded quotation button
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
    const responseUrl = `${frontendUrl}/rfq-response/${token}`;
    
    const htmlContent = `
    ${emailContent}
    
    <div style="background-color: #f8f9fa; padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <h3 style="color: #52c41a; margin-bottom: 20px; font-size: 18px;">Action Required</h3>
      <p style="color: #666; margin-bottom: 25px; font-size: 14px;">
        Please click the button below to review the requirements and submit your quotation.
      </p>
      <a href="${responseUrl}" 
         style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                font-weight: bold; 
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
                transition: all 0.3s ease;">
        💼 Submit Your Quotation
      </a>
      <p style="color: #999; margin-top: 20px; font-size: 12px;">
        Deadline: ${submissionDeadline}
      </p>
    </div>
    
    <div style="border-top: 1px solid #e8e8e8; margin-top: 40px; padding-top: 20px;">
      <p style="color: #666; font-size: 12px; line-height: 1.5;">
        <strong>Important:</strong> This email was automatically generated by our Procurement Management System.
        If you have any questions about this RFQ or need assistance, please contact our procurement team.
      </p>
      <p style="color: #999; font-size: 11px; margin-top: 15px;">
        Procurement Management System | ${new Date().getFullYear()} | All rights reserved
      </p>
    </div>
    `;

    // Send email
    await sendEmail({
      to,
      subject,
      html: htmlContent,
      from: process.env.EMAIL_FROM || process.env.COMPANY_EMAIL || 'procurement@company.com'
    });

    console.log(`📧 RFQ invitation email sent to supplier: ${to}`);

    res.status(200).json({
      success: true,
      message: 'RFQ invitation email sent successfully',
      data: { emailSent: true, recipient: to }
    });

  } catch (error) {
    console.error('❌ Error sending RFQ email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send RFQ email',
      error: error.message
    });
  }
};

// Send Purchase Order approval email
exports.sendPOApprovalEmail = async (req, res) => {
  try {
    const { to, subject, poId, poNumber, supplierName, totalAmount, currency, approverName, token } = req.body;

    // Generate AI-powered email content
    const emailPrompt = `
    Generate a professional HTML email template to request approval for a Purchase Order.
    
    Context:
    - PO Number: ${poNumber}
    - Supplier Name: ${supplierName}
    - Total Amount: ${currency} ${totalAmount}
    - Approver Name: ${approverName}
    - Subject: ${subject}
    
    Requirements:
    1. Create a complete HTML email with professional styling
    2. Use a professional and urgent tone (but not pushy)
    3. Clearly explain that a purchase order requires their approval
    4. Emphasize the importance of timely approval
    5. Use modern email-safe CSS styling with inline styles
    6. Include proper headers and structure
    7. Make it clear this is a PO approval request requiring their action
    8. Add a professional business header
    
    The email should:
    - Inform that a purchase order requires their approval
    - Show key details like PO number, supplier, and amount
    - Request their approval or rejection with comments
    - Emphasize the importance of their decision for the procurement process
    - Be professional and clear about the action needed from them
    
    IMPORTANT: 
    - DO NOT include any URLs, links, or buttons in the generated content
    - DO NOT include placeholder URLs
    - DO NOT include "click here" or "approve" buttons
    - The approval buttons will be added separately
    - Focus on requesting their approval decision
    
    Generate ONLY the HTML content for the email body with inline CSS styling. Do not include DOCTYPE or html/body tags.
    `;

    let emailContent;
    
    try {
      emailContent = await generateText(emailPrompt);
    } catch (aiError) {
      console.log('⚠️ AI service unavailable, using fallback email template');
      // Fallback email template if AI service is not available
      emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📋 Purchase Order Approval Required</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${approverName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            A purchase order has been submitted and requires your approval. Please review the details below and take appropriate action.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #fa8c16; margin: 0 0 15px 0;">Purchase Order Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>PO Number:</strong> ${poNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Supplier:</strong> ${supplierName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ${currency} ${totalAmount}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Awaiting Your Approval</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your approval is required to proceed with this purchase order. Please review the line items, supplier details, and business justification before making your decision.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions about this purchase order, please contact the procurement team before approving or rejecting.
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Best regards,<br>
            <strong>Procurement Management System</strong>
          </p>
        </div>
      </div>
      `;
    }

    // Create email with embedded approval buttons
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
    const approvalUrl = `${frontendUrl}/po-approval/${token}`;
    
    const htmlContent = `
    ${emailContent}
    
    <div style="background-color: #f8f9fa; padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center;">
      <h3 style="color: #fa8c16; margin-bottom: 20px; font-size: 18px;">Action Required</h3>
      <p style="color: #666; margin-bottom: 25px; font-size: 14px;">
        Please click the button below to review and approve or reject this purchase order.
      </p>
      <a href="${approvalUrl}" 
         style="background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                font-weight: bold; 
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);
                transition: all 0.3s ease;">
        ✅ Review & Approve Purchase Order
      </a>
      <p style="color: #999; margin-top: 20px; font-size: 12px;">
        PO Number: ${poNumber} | Amount: ${currency} ${totalAmount}
      </p>
    </div>
    
    <div style="border-top: 1px solid #e8e8e8; margin-top: 40px; padding-top: 20px;">
      <p style="color: #666; font-size: 12px; line-height: 1.5;">
        <strong>Important:</strong> This email was automatically generated by our Procurement Management System.
        Your approval or rejection will be recorded with a timestamp and any comments you provide.
      </p>
      <p style="color: #999; font-size: 11px; margin-top: 15px;">
        Procurement Management System | ${new Date().getFullYear()} | All rights reserved
      </p>
    </div>
    `;

    // Send email
    await sendEmail({
      to,
      subject,
      html: htmlContent,
      from: process.env.EMAIL_FROM || process.env.COMPANY_EMAIL || 'procurement@company.com'
    });

    console.log(`📧 PO approval email sent to approver: ${to}`);

    res.status(200).json({
      success: true,
      message: 'PO approval email sent successfully',
      data: { emailSent: true, recipient: to }
    });

  } catch (error) {
    console.error('❌ Error sending PO approval email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send PO approval email',
      error: error.message
    });
  }
};

// Helper function to send email using nodemailer
async function sendEmail({ to, subject, html, from }) {
  try {
    console.log('📧 SENDING EMAIL:');
    console.log('To:', to);
    console.log('From:', from);
    console.log('Subject:', subject);
    
    const mailOptions = {
      from: from || config.email.from,
      to: to,
      subject: subject,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}
