-- Create UNSPSC Breakdown table for caching AI analysis results
-- This will prevent repeated API calls for the same UNSPSC codes

CREATE TABLE IF NOT EXISTS "UnspscBreakdowns" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "unspscCode" VARCHAR(8) NOT NULL UNIQUE,
    "segmentCode" VARCHAR(2) NOT NULL,
    "segmentName" VARCHAR(255),
    "familyCode" VARCHAR(2) NOT NULL,
    "familyName" VARCHAR(255),
    "commodityCode" VARCHAR(2) NOT NULL,
    "commodityName" VARCHAR(255),
    "businessFunctionCode" VARCHAR(2) NOT NULL,
    "businessFunctionName" VARCHAR(255),
    "isValid" BOOLEAN DEFAULT true,
    "analysis" TEXT,
    "formattedDisplay" VARCHAR(20),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_unspsc_breakdowns_code" ON "UnspscBreakdowns"("unspscCode");
CREATE INDEX IF NOT EXISTS "idx_unspsc_breakdowns_valid" ON "UnspscBreakdowns"("isValid");

-- Verify table creation
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'UnspscBreakdowns' 
ORDER BY ordinal_position;
