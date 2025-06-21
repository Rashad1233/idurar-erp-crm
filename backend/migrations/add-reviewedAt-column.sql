-- Add reviewedAt column to ItemMasters table
-- This column is needed for the approval workflow

-- First check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ItemMasters' 
        AND column_name = 'reviewedAt'
    ) THEN
        -- Add the reviewedAt column
        ALTER TABLE "ItemMasters" 
        ADD COLUMN "reviewedAt" TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added reviewedAt column to ItemMasters table';
    ELSE
        RAISE NOTICE 'reviewedAt column already exists in ItemMasters table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ItemMasters' 
AND column_name = 'reviewedAt';
