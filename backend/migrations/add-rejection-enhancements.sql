-- Add columns for enhanced rejection functionality
ALTER TABLE "RejectionNotifications" 
ADD COLUMN IF NOT EXISTS "rejectionType" VARCHAR(50) DEFAULT 'DELETE';

ALTER TABLE "RejectionNotifications" 
ADD COLUMN IF NOT EXISTS "originalItemData" JSONB;

-- Update existing records to have default rejection type
UPDATE "RejectionNotifications" 
SET "rejectionType" = 'DELETE' 
WHERE "rejectionType" IS NULL;
