const { 
  RequestForQuotation, 
  RfqSupplier,
  RfqItem,
  RfqQuoteItem,
  PurchaseOrder, 
  PurchaseOrderItem,
  Supplier,
  ApprovalWorkflow,
  ApprovalThreshold,
  NotificationLog
} = require('../models/sequelize');
const { 
  generateRFQResponseToken, 
  generatePOApprovalToken,
  generateApprovalWorkflowTokens,
  isTokenExpired
} = require('../utils/tokenGenerator');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Email transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

/**
 * Send RFQ invitations to suppliers with response tokens
 */
const sendRFQToSuppliers = async (rfqId, supplierIds, submissionDeadline, customMessage = '') => {
  try {
    const rfq = await RequestForQuotation.findByPk(rfqId, {
      include: [
        {
          model: RfqItem,
          as: 'items'
        }
      ]
    });

    if (!rfq) {
      throw new Error('RFQ not found');
    }

    const results = [];

    for (const supplierId of supplierIds) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        console.warn(`Supplier ${supplierId} not found, skipping...`);
        continue;
      }

      // Generate response token
      const responseToken = generateRFQResponseToken(rfqId, supplierId);

      // Create or update RFQ supplier record
      const [rfqSupplier, created] = await RfqSupplier.findOrCreate({
        where: {
          requestForQuotationId: rfqId,
          supplierId: supplierId
        },
        defaults: {
          supplierName: supplier.legalName,
          contactName: supplier.contactName,
          contactEmail: supplier.contactEmail,
          responseToken: responseToken,
          tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'sent',
          sentAt: new Date()
        }
      });

      if (!created) {
        await rfqSupplier.update({
          responseToken: responseToken,
          tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'sent',
          sentAt: new Date()
        });
      }

      // Send email notification
      const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
      const responseUrl = `${frontendUrl}/rfq-response/${responseToken}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🛒 Request for Quotation</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${supplier.legalName},</p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We are pleased to invite you to submit a quotation for the following procurement opportunity.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #52c41a; margin: 0 0 15px 0;">RFQ Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>RFQ Number:</strong> ${rfq.rfqNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Submission Deadline:</strong> ${new Date(submissionDeadline).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Description:</strong> ${rfq.description}</p>
            </div>

            ${customMessage ? `
              <div style="background: #e6f7ff; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1890ff;">
                <h4 style="margin: 0 0 8px 0; color: #1890ff;">Special Instructions</h4>
                <p style="margin: 0; color: #333;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${responseUrl}" 
                 style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        display: inline-block; 
                        font-weight: bold; 
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);">
                💼 Submit Your Quotation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions about this RFQ, please contact our procurement team.
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'procurement@company.com',
        to: supplier.contactEmail,
        subject: `Request for Quotation - ${rfq.rfqNumber}`,
        html: emailContent
      };

      try {
        await transporter.sendMail(mailOptions);
        
        // Log notification
        await NotificationLog.create({
          entityType: 'rfq',
          entityId: rfqId,
          recipientEmail: supplier.contactEmail,
          notificationType: 'approval_request',
          subject: mailOptions.subject,
          message: 'RFQ invitation sent',
          deliveryStatus: 'sent'
        });

        results.push({
          supplierId: supplierId,
          supplierName: supplier.legalName,
          email: supplier.contactEmail,
          status: 'sent',
          token: responseToken
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${supplier.contactEmail}:`, emailError);
        results.push({
          supplierId: supplierId,
          supplierName: supplier.legalName,
          email: supplier.contactEmail,
          status: 'failed',
          error: emailError.message
        });
      }
    }

    // Update RFQ status
    await rfq.update({
      status: 'sent',
      submissionDeadline: submissionDeadline,
      sentAt: new Date()
    });

    return {
      success: true,
      rfqNumber: rfq.rfqNumber,
      supplierCount: results.filter(r => r.status === 'sent').length,
      results: results
    };

  } catch (error) {
    console.error('Error sending RFQ to suppliers:', error);
    throw error;
  }
};

/**
 * Send Purchase Order for approval with approval tokens
 */
const sendPOForApproval = async (poId, approverEmails, urgency = 'medium', customMessage = '') => {
  try {
    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        {
          model: PurchaseOrderItem,
          as: 'items'
        },
        {
          model: Supplier,
          as: 'supplier'
        }
      ]
    });

    if (!po) {
      throw new Error('Purchase Order not found');
    }

    const results = [];

    for (const approverEmail of approverEmails) {
      // Generate approval token
      const approvalToken = generatePOApprovalToken(poId, approverEmail);

      // Update PO with approval token and expiry
      await po.update({
        approvalToken: approvalToken,
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        approvalStatus: 'pending',
        urgency: urgency
      });

      // Send approval email
      const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
      const approvalUrl = `${frontendUrl}/po-approval/${approvalToken}`;

      const urgencyColors = {
        high: '#ff4d4f',
        medium: '#faad14',
        low: '#52c41a'
      };

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📋 Purchase Order Approval Required</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear Approver,</p>
            
            <div style="background: ${urgencyColors[urgency]}22; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${urgencyColors[urgency]};">
              <p style="margin: 0; color: #333; font-weight: bold;">
                🚨 Priority: ${urgency.toUpperCase()} 
              </p>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              A purchase order has been submitted and requires your approval.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #fa8c16; margin: 0 0 15px 0;">Purchase Order Details</h3>
              <p style="margin: 5px 0; color: #666;"><strong>PO Number:</strong> ${po.poNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Supplier:</strong> ${po.supplier?.legalName || 'Not specified'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ${po.currency || 'USD'} ${parseFloat(po.totalAmount || 0).toLocaleString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Requested By:</strong> ${po.requestedBy || 'Not specified'}</p>
            </div>

            ${customMessage ? `
              <div style="background: #e6f7ff; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1890ff;">
                <h4 style="margin: 0 0 8px 0; color: #1890ff;">Additional Information</h4>
                <p style="margin: 0; color: #333;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalUrl}" 
                 style="background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        display: inline-block; 
                        font-weight: bold; 
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(250, 140, 22, 0.3);">
                ✅ Review & Approve Purchase Order
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Your approval or rejection will be recorded with a timestamp and any comments you provide.
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'procurement@company.com',
        to: approverEmail,
        subject: `${urgency.toUpperCase()} PRIORITY: Purchase Order Approval Required - ${po.poNumber}`,
        html: emailContent
      };

      try {
        await transporter.sendMail(mailOptions);
        
        // Log notification
        await NotificationLog.create({
          entityType: 'purchase_order',
          entityId: poId,
          recipientEmail: approverEmail,
          notificationType: 'approval_request',
          subject: mailOptions.subject,
          message: 'PO approval request sent',
          deliveryStatus: 'sent'
        });

        results.push({
          approverEmail: approverEmail,
          status: 'sent',
          token: approvalToken
        });
      } catch (emailError) {
        console.error(`Failed to send approval email to ${approverEmail}:`, emailError);
        results.push({
          approverEmail: approverEmail,
          status: 'failed',
          error: emailError.message
        });
      }
    }

    return {
      success: true,
      poNumber: po.poNumber,
      approverCount: results.filter(r => r.status === 'sent').length,
      results: results
    };

  } catch (error) {
    console.error('Error sending PO for approval:', error);
    throw error;
  }
};

/**
 * Bulk approve/reject purchase orders
 */
const bulkApprovePOs = async (poIds, action, comments, approverInfo) => {
  try {
    const results = [];

    for (const poId of poIds) {
      const po = await PurchaseOrder.findByPk(poId);
      if (!po) {
        results.push({
          poId: poId,
          status: 'failed',
          error: 'Purchase Order not found'
        });
        continue;
      }

      const updateData = {
        approvalStatus: action,
        approvedAt: new Date(),
        approverComments: comments,
        approverName: approverInfo?.name || '',
        approverTitle: approverInfo?.title || ''
      };

      await po.update(updateData);

      results.push({
        poId: poId,
        poNumber: po.poNumber,
        status: 'success',
        action: action
      });
    }

    return {
      success: true,
      processedCount: results.filter(r => r.status === 'success').length,
      results: results
    };

  } catch (error) {
    console.error('Error in bulk PO approval:', error);
    throw error;
  }
};

/**
 * Get approval workflow for amount and entity type
 */
const getApprovalWorkflow = async (entityType, amount) => {
  try {
    const thresholds = await ApprovalThresholds.findAll({
      where: {
        entityType: entityType,
        isActive: true,
        minAmount: { [Op.lte]: amount },
        maxAmount: { [Op.gte]: amount }
      },
      order: [['requiredApprovalLevel', 'ASC']]
    });

    return thresholds;
  } catch (error) {
    console.error('Error getting approval workflow:', error);
    throw error;
  }
};

/**
 * Send reminder emails for overdue approvals
 */
const sendApprovalReminders = async () => {
  try {
    // Find overdue RFQs
    const overdueRFQs = await RequestForQuotation.findAll({
      where: {
        status: 'sent',
        submissionDeadline: { [Op.lt]: new Date() }
      },
      include: [
        {
          model: RFQResponse,
          as: 'responses',
          where: { status: 'sent' },
          include: [
            {
              model: Supplier,
              as: 'supplier'
            }
          ]
        }
      ]
    });

    // Find pending PO approvals
    const pendingPOs = await PurchaseOrder.findAll({
      where: {
        approvalStatus: 'pending',
        createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours old
      }
    });

    // Send reminders...
    const results = {
      rfqReminders: overdueRFQs.length,
      poReminders: pendingPOs.length
    };

    return results;
  } catch (error) {
    console.error('Error sending approval reminders:', error);
    throw error;
  }
};

module.exports = {
  sendRFQToSuppliers,
  sendPOForApproval,
  bulkApprovePOs,
  getApprovalWorkflow,
  sendApprovalReminders
};