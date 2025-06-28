-- Migration: Add Approval Workflow Tables and Update Existing Models
-- Date: 2024-12-20
-- Description: Add missing fields for RFQ/PO approval workflow functionality

-- 1. Add missing columns to RfqSuppliers table
ALTER TABLE "RfqSuppliers" 
ADD COLUMN IF NOT EXISTS "responseToken" VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP WITH TIME ZONE;

-- 2. Add missing columns to PurchaseOrders table  
ALTER TABLE "PurchaseOrders"
ADD COLUMN IF NOT EXISTS "approvalToken" VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS "approvalStatus" VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "approverName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "approverTitle" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "approverComments" TEXT,
ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "urgency" VARCHAR(20) DEFAULT 'medium';

-- 3. Update RfqQuoteItems table structure (recreate if needed)
DROP TABLE IF EXISTS "RfqQuoteItems" CASCADE;
CREATE TABLE "RfqQuoteItems" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "rfqItemId" UUID REFERENCES "RfqItems"("id") ON DELETE CASCADE,
    "rfqSupplierId" UUID NOT NULL REFERENCES "RfqSuppliers"("id") ON DELETE CASCADE,
    "itemDescription" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL DEFAULT 1.00,
    "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "totalPrice" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "leadTime" INTEGER,
    "deliveryDate" TIMESTAMP WITH TIME ZONE,
    "notes" TEXT,
    "isSelected" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create ApprovalWorkflows table
CREATE TABLE IF NOT EXISTS "ApprovalWorkflows" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL CHECK ("entityType" IN ('purchase_order', 'contract', 'rfq')),
    "description" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdBy" VARCHAR(255),
    "createdById" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "updatedById" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create ApprovalThresholds table
CREATE TABLE IF NOT EXISTS "ApprovalThresholds" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "approvalWorkflowId" UUID NOT NULL REFERENCES "ApprovalWorkflows"("id") ON DELETE CASCADE,
    "level" INTEGER NOT NULL,
    "minAmount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "maxAmount" DECIMAL(15,2) NOT NULL DEFAULT 999999999.99,
    "role" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create NotificationLogs table
CREATE TABLE IF NOT EXISTS "NotificationLogs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entityType" VARCHAR(50) NOT NULL CHECK ("entityType" IN ('rfq', 'purchase_order', 'contract', 'supplier')),
    "entityId" UUID NOT NULL,
    "recipientEmail" VARCHAR(255) NOT NULL,
    "notificationType" VARCHAR(50) NOT NULL CHECK ("notificationType" IN ('approval_request', 'reminder', 'status_update', 'invitation')),
    "subject" VARCHAR(500) NOT NULL,
    "message" TEXT,
    "deliveryStatus" VARCHAR(20) DEFAULT 'sent' CHECK ("deliveryStatus" IN ('sent', 'failed', 'bounced', 'opened')),
    "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "openedAt" TIMESTAMP WITH TIME ZONE,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_rfq_suppliers_response_token" ON "RfqSuppliers"("responseToken");
CREATE INDEX IF NOT EXISTS "idx_rfq_suppliers_token_expiry" ON "RfqSuppliers"("tokenExpiry");
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_approval_token" ON "PurchaseOrders"("approvalToken");
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_approval_status" ON "PurchaseOrders"("approvalStatus");
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_token_expiry" ON "PurchaseOrders"("tokenExpiry");
CREATE INDEX IF NOT EXISTS "idx_rfq_quote_items_supplier" ON "RfqQuoteItems"("rfqSupplierId");
CREATE INDEX IF NOT EXISTS "idx_approval_thresholds_workflow" ON "ApprovalThresholds"("approvalWorkflowId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_entity" ON "NotificationLogs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_recipient" ON "NotificationLogs"("recipientEmail");

-- 8. Add sample data for testing (optional)
INSERT INTO "ApprovalWorkflows" ("name", "entityType", "description", "isActive") 
VALUES 
    ('Purchase Order Approval', 'purchase_order', 'Standard purchase order approval workflow', true),
    ('Contract Approval', 'contract', 'Contract approval workflow', true),
    ('RFQ Management', 'rfq', 'RFQ supplier invitation workflow', true)
ON CONFLICT DO NOTHING;

-- Get the workflow IDs for sample data
DO $$
DECLARE
    po_workflow_id UUID;
    contract_workflow_id UUID;
BEGIN
    SELECT "id" INTO po_workflow_id FROM "ApprovalWorkflows" WHERE "entityType" = 'purchase_order' LIMIT 1;
    SELECT "id" INTO contract_workflow_id FROM "ApprovalWorkflows" WHERE "entityType" = 'contract' LIMIT 1;
    
    IF po_workflow_id IS NOT NULL THEN
        INSERT INTO "ApprovalThresholds" ("approvalWorkflowId", "level", "minAmount", "maxAmount", "role", "email")
        VALUES 
            (po_workflow_id, 1, 0.00, 5000.00, 'Department Manager', 'manager@company.com'),
            (po_workflow_id, 2, 5000.01, 25000.00, 'Finance Director', 'finance@company.com'),
            (po_workflow_id, 3, 25000.01, 999999999.99, 'Chief Executive', 'ceo@company.com')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF contract_workflow_id IS NOT NULL THEN
        INSERT INTO "ApprovalThresholds" ("approvalWorkflowId", "level", "minAmount", "maxAmount", "role", "email")
        VALUES 
            (contract_workflow_id, 1, 0.00, 50000.00, 'Legal Counsel', 'legal@company.com'),
            (contract_workflow_id, 2, 50000.01, 999999999.99, 'Chief Executive', 'ceo@company.com')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 9. Update existing data (if any)
UPDATE "RfqSuppliers" SET "tokenExpiry" = "createdAt" + INTERVAL '30 days' WHERE "tokenExpiry" IS NULL;
UPDATE "PurchaseOrders" SET "tokenExpiry" = "createdAt" + INTERVAL '30 days' WHERE "tokenExpiry" IS NULL;

COMMIT;