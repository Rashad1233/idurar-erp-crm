-- Add new status and approval fields to suppliers table
-- Migration to add supplier approval workflow fields

-- Add the new status to the enum
ALTER TYPE "enum_Suppliers_status" ADD VALUE 'pending_supplier_acceptance';

-- Add approval tracking fields
ALTER TABLE "Suppliers" 
ADD COLUMN "approvedById" UUID REFERENCES "Users"(id),
ADD COLUMN "approvedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN "supplierAcceptedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN "acceptanceToken" VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_suppliers_status ON "Suppliers"(status);
CREATE INDEX idx_suppliers_acceptance_token ON "Suppliers"("acceptanceToken");

-- Add comments for documentation
COMMENT ON COLUMN "Suppliers"."approvedById" IS 'User who approved the supplier';
COMMENT ON COLUMN "Suppliers"."approvedAt" IS 'Timestamp when supplier was approved';
COMMENT ON COLUMN "Suppliers"."supplierAcceptedAt" IS 'Timestamp when supplier accepted our offer';
COMMENT ON COLUMN "Suppliers"."acceptanceToken" IS 'Unique token for supplier acceptance link';