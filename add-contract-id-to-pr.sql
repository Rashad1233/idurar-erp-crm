-- Add contractId column to PurchaseRequisitions table
-- This allows PRs to be associated with contracts for streamlined procurement

BEGIN;

-- Add contractId column to PurchaseRequisitions table
ALTER TABLE "PurchaseRequisitions" 
ADD COLUMN "contractId" UUID DEFAULT NULL;

-- Add foreign key constraint to reference Contracts table
ALTER TABLE "PurchaseRequisitions" 
ADD CONSTRAINT fk_purchase_requisition_contract 
FOREIGN KEY ("contractId") REFERENCES "Contracts"(id) ON DELETE SET NULL;

-- Add index for better performance on contract lookups
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_contract_id 
ON "PurchaseRequisitions"("contractId");

-- Add comment to explain the purpose
COMMENT ON COLUMN "PurchaseRequisitions"."contractId" IS 'Reference to contract if PR is created under an existing contract (allows bypassing RFQ process)';

COMMIT;

-- Verify the change
\d "PurchaseRequisitions"
