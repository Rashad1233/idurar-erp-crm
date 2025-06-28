-- First, create a new type with the additional value
CREATE TYPE enum_RequestForQuotations_status_new AS ENUM ('draft', 'sent', 'in_progress', 'completed', 'cancelled', 'approved_by_supplier');

-- Update existing data to use the new type
ALTER TABLE "RequestForQuotations" 
  ALTER COLUMN status TYPE enum_RequestForQuotations_status_new 
  USING (status::text::enum_RequestForQuotations_status_new);

-- Drop the old type
DROP TYPE enum_RequestForQuotations_status;

-- Rename the new type to the original name
ALTER TYPE enum_RequestForQuotations_status_new RENAME TO enum_RequestForQuotations_status;
