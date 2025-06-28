-- Add token fields for RFQ responses and PO approvals
-- Run this migration to support standalone approval pages

-- Add response token to RFQ responses
ALTER TABLE RFQResponses 
ADD COLUMN IF NOT EXISTS responseToken VARCHAR(255) UNIQUE;

-- Add approval token and status fields to Purchase Orders
ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approvalToken VARCHAR(255) UNIQUE;

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approvedAt TIMESTAMP NULL;

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approverComments TEXT;

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approverName VARCHAR(255);

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS approverTitle VARCHAR(255);

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS currentApprovalLevel INT DEFAULT 1;

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS totalApprovalLevels INT DEFAULT 1;

ALTER TABLE PurchaseOrders 
ADD COLUMN IF NOT EXISTS businessJustification TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rfq_response_token ON RFQResponses(responseToken);
CREATE INDEX IF NOT EXISTS idx_purchase_order_approval_token ON PurchaseOrders(approvalToken);
CREATE INDEX IF NOT EXISTS idx_purchase_order_approval_status ON PurchaseOrders(approvalStatus);

-- Create approval workflow table for complex approval chains
CREATE TABLE IF NOT EXISTS ApprovalWorkflows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entityType ENUM('purchase_order', 'contract', 'rfq') NOT NULL,
    entityId INT NOT NULL,
    approvalLevel INT NOT NULL,
    approverEmail VARCHAR(255) NOT NULL,
    approverName VARCHAR(255),
    approverTitle VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'skipped') DEFAULT 'pending',
    comments TEXT,
    actionDate TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entity_type_id (entityType, entityId),
    INDEX idx_approval_level (approvalLevel),
    INDEX idx_status (status)
);

-- Add sample approval thresholds
CREATE TABLE IF NOT EXISTS ApprovalThresholds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entityType ENUM('purchase_order', 'contract', 'rfq') NOT NULL,
    minAmount DECIMAL(15,2) DEFAULT 0,
    maxAmount DECIMAL(15,2) DEFAULT 999999999.99,
    requiredApprovalLevel INT DEFAULT 1,
    approverRole VARCHAR(100),
    approverEmail VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entity_amount (entityType, minAmount, maxAmount),
    INDEX idx_approval_level (requiredApprovalLevel)
);

-- Insert default approval thresholds
INSERT INTO ApprovalThresholds (entityType, minAmount, maxAmount, requiredApprovalLevel, approverRole) 
VALUES 
('purchase_order', 0, 1000, 1, 'Supervisor'),
('purchase_order', 1000, 10000, 2, 'Manager'),
('purchase_order', 10000, 50000, 3, 'Director'),
('purchase_order', 50000, 999999999.99, 4, 'VP/CEO')
ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;

-- Create notification log table
CREATE TABLE IF NOT EXISTS NotificationLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entityType ENUM('purchase_order', 'contract', 'rfq', 'supplier_acceptance') NOT NULL,
    entityId INT NOT NULL,
    recipientEmail VARCHAR(255) NOT NULL,
    notificationType ENUM('approval_request', 'status_update', 'reminder') NOT NULL,
    subject VARCHAR(500),
    message TEXT,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deliveryStatus ENUM('sent', 'delivered', 'failed', 'bounced') DEFAULT 'sent',
    INDEX idx_entity_type_id (entityType, entityId),
    INDEX idx_recipient (recipientEmail),
    INDEX idx_sent_date (sentAt)
);