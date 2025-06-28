-- Create Contract Management Tables
-- Run this script to create the required tables for contract management

-- Create Contracts table
CREATE TABLE IF NOT EXISTS "Contracts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractNumber" VARCHAR(255) UNIQUE NOT NULL,
    "contractName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "supplierId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'draft' CHECK ("status" IN ('draft', 'active', 'expired', 'terminated')),
    "incoterms" VARCHAR(50),
    "paymentTerms" VARCHAR(100),
    "currency" VARCHAR(10) DEFAULT 'USD',
    "totalValue" DECIMAL(15,2) DEFAULT 0.00,
    "attachments" JSONB DEFAULT '[]',
    "notes" TEXT,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("id") ON DELETE RESTRICT,
    FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT,
    FOREIGN KEY ("updatedById") REFERENCES "Users"("id") ON DELETE RESTRICT
);

-- Create ContractItems table
CREATE TABLE IF NOT EXISTS "ContractItems" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contractId" UUID NOT NULL,
    "itemNumber" VARCHAR(255),
    "description" TEXT NOT NULL,
    "uom" VARCHAR(50) NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "leadTime" INTEGER, -- Days
    "minimumOrderQuantity" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("contractId") REFERENCES "Contracts"("id") ON DELETE CASCADE,
    FOREIGN KEY ("itemNumber") REFERENCES "ItemMasters"("itemNumber") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "contracts_supplier_id_idx" ON "Contracts"("supplierId");
CREATE INDEX IF NOT EXISTS "contracts_status_idx" ON "Contracts"("status");
CREATE INDEX IF NOT EXISTS "contracts_start_date_idx" ON "Contracts"("startDate");
CREATE INDEX IF NOT EXISTS "contracts_end_date_idx" ON "Contracts"("endDate");
CREATE INDEX IF NOT EXISTS "contract_items_contract_id_idx" ON "ContractItems"("contractId");
CREATE INDEX IF NOT EXISTS "contract_items_item_number_idx" ON "ContractItems"("itemNumber");

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to Contracts table
DROP TRIGGER IF EXISTS update_contracts_updated_at ON "Contracts";
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON "Contracts" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to ContractItems table
DROP TRIGGER IF EXISTS update_contract_items_updated_at ON "ContractItems";
CREATE TRIGGER update_contract_items_updated_at 
    BEFORE UPDATE ON "ContractItems" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add contractId to PurchaseRequisitions table if it doesn't exist
ALTER TABLE "PurchaseRequisitions" 
ADD COLUMN IF NOT EXISTS "contractId" UUID,
ADD CONSTRAINT fk_purchase_requisitions_contract 
FOREIGN KEY ("contractId") REFERENCES "Contracts"("id") ON DELETE SET NULL;

-- Insert some sample contract statuses if needed
COMMENT ON COLUMN "Contracts"."status" IS 'Contract status: draft, active, expired, terminated';
COMMENT ON COLUMN "Contracts"."incoterms" IS 'Delivery terms: DDP, FCA, CIP, EXW, FOB, CFR, CIF, etc.';
COMMENT ON COLUMN "Contracts"."paymentTerms" IS 'Payment terms: Net 30 days, Net 45 days, Prepayment, etc.';
COMMENT ON COLUMN "ContractItems"."leadTime" IS 'Lead time in days';
COMMENT ON COLUMN "ContractItems"."minimumOrderQuantity" IS 'Minimum order quantity for this item';

-- Show tables created
SELECT 'Contracts table created' as message;
SELECT 'ContractItems table created' as message;
SELECT 'Contract management tables setup complete' as message;
