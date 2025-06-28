-- First, we need to create a new enum type with the correct values
CREATE TYPE "enum_RequestForQuotations_status_new" AS ENUM ('draft', 'sent', 'in_progress', 'completed', 'cancelled', 'rejected');

-- Update any existing 'approved_by_supplier' values to 'completed' before changing the enum
UPDATE "RequestForQuotations" 
SET status = 'completed' 
WHERE status = 'approved_by_supplier';

-- Change the column to use the new enum type
ALTER TABLE "RequestForQuotations" 
ALTER COLUMN status TYPE "enum_RequestForQuotations_status_new" 
USING status::text::"enum_RequestForQuotations_status_new";

-- Drop the old enum type
DROP TYPE "enum_RequestForQuotations_status";

-- Rename the new enum type to the original name
ALTER TYPE "enum_RequestForQuotations_status_new" RENAME TO "enum_RequestForQuotations_status";
