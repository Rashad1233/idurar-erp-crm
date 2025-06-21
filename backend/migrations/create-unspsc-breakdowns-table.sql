-- Create UNSPSC breakdown cache table
-- This will store AI-generated UNSPSC analysis to avoid repeated API calls

CREATE TABLE IF NOT EXISTS "UnspscBreakdowns" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "unspscCode" VARCHAR(8) UNIQUE NOT NULL,
    "segmentCode" VARCHAR(2) NOT NULL,
    "segmentName" VARCHAR(255),
    "familyCode" VARCHAR(2) NOT NULL,
    "familyName" VARCHAR(255),
    "commodityCode" VARCHAR(2) NOT NULL,
    "commodityName" VARCHAR(255),
    "businessFunctionCode" VARCHAR(2) NOT NULL,
    "businessFunctionName" VARCHAR(255),
    "isValid" BOOLEAN DEFAULT true,
    "fullAnalysis" TEXT,
    "formattedDisplay" VARCHAR(20),
    "aiModel" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unspsc_code ON "UnspscBreakdowns"("unspscCode");
CREATE INDEX IF NOT EXISTS idx_unspsc_segment ON "UnspscBreakdowns"("segmentCode");
CREATE INDEX IF NOT EXISTS idx_unspsc_valid ON "UnspscBreakdowns"("isValid");

-- Add some sample data for testing (common UNSPSC codes)
INSERT INTO "UnspscBreakdowns" (
    "unspscCode", "segmentCode", "segmentName", "familyCode", "familyName", 
    "commodityCode", "commodityName", "businessFunctionCode", "businessFunctionName",
    "isValid", "fullAnalysis", "formattedDisplay", "aiModel"
) VALUES 
(
    '40000000', '40', 'Distribution and Conditional Services', '00', 'Distribution and Conditional Services', 
    '00', 'Distribution and Conditional Services', '00', 'Distribution and Conditional Services',
    true, 'This segment covers distribution and conditional services including logistics, warehousing, and related services.',
    '40-00-00-00', 'system-default'
),
(
    '31000000', '31', 'Manufacturing Components and Supplies', '00', 'Manufacturing Components and Supplies',
    '00', 'Manufacturing Components and Supplies', '00', 'Manufacturing Components and Supplies',
    true, 'This segment covers manufacturing components and supplies including industrial equipment, tools, and materials.',
    '31-00-00-00', 'system-default'
)
ON CONFLICT ("unspscCode") DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as total_cached_codes FROM "UnspscBreakdowns";
