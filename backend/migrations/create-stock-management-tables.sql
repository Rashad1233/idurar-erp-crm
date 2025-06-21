-- Create StockLevels table for min/max inventory management
CREATE TABLE IF NOT EXISTS "StockLevels" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "itemId" UUID NOT NULL,
    "itemNumber" VARCHAR(255) NOT NULL,
    "minimumStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maximumStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reorderPoint" DECIMAL(10,2),
    "safetyStock" DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(100) DEFAULT 'MAIN',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_stock_levels_item FOREIGN KEY ("itemId") REFERENCES "ItemMasters"(id) ON DELETE CASCADE,
    
    -- Unique constraint for item and location combination
    CONSTRAINT unique_item_location UNIQUE ("itemId", location),
    
    -- Check constraints
    CONSTRAINT check_stock_levels CHECK ("maximumStock" > "minimumStock"),
    CONSTRAINT check_reorder_point CHECK ("reorderPoint" IS NULL OR ("reorderPoint" >= "minimumStock" AND "reorderPoint" <= "maximumStock"))
);

-- Create StockTransactions table for stock movement history
CREATE TABLE IF NOT EXISTS "StockTransactions" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "itemId" UUID NOT NULL,
    "itemNumber" VARCHAR(255) NOT NULL,
    "transactionType" VARCHAR(50) NOT NULL, -- 'ADD', 'SUBTRACT', 'ADJUSTMENT', 'RECEIPT', 'ISSUE'
    quantity DECIMAL(10,2) NOT NULL,
    "previousQuantity" DECIMAL(10,2),
    "newQuantity" DECIMAL(10,2),
    location VARCHAR(100) DEFAULT 'MAIN',
    "referenceNumber" VARCHAR(255), -- PO number, requisition number, etc.
    notes TEXT,
    "createdBy" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_stock_transactions_item FOREIGN KEY ("itemId") REFERENCES "ItemMasters"(id) ON DELETE CASCADE,
    CONSTRAINT fk_stock_transactions_user FOREIGN KEY ("createdBy") REFERENCES "Users"(id) ON DELETE SET NULL
);

-- Update Inventories table to support locations better
DO $$ 
BEGIN
    -- Add location column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Inventories' AND column_name = 'location'
    ) THEN
        ALTER TABLE "Inventories" ADD COLUMN location VARCHAR(100) DEFAULT 'MAIN';
    END IF;
    
    -- Add currentStock column for easier querying
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Inventories' AND column_name = 'currentStock'
    ) THEN
        ALTER TABLE "Inventories" ADD COLUMN "currentStock" DECIMAL(10,2) DEFAULT 0;
        -- Update currentStock to match quantity
        UPDATE "Inventories" SET "currentStock" = quantity WHERE "currentStock" IS NULL;
    END IF;
    
    -- Drop and recreate unique constraint to include location
    BEGIN
        ALTER TABLE "Inventories" DROP CONSTRAINT IF EXISTS unique_item_inventory;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    -- Add unique constraint for itemId and location
    BEGIN
        ALTER TABLE "Inventories" ADD CONSTRAINT unique_item_location_inventory UNIQUE ("itemId", location);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_levels_item_id ON "StockLevels"("itemId");
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON "StockLevels"(location);
CREATE INDEX IF NOT EXISTS idx_stock_levels_reorder ON "StockLevels"("reorderPoint") WHERE "isActive" = true;

CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id ON "StockTransactions"("itemId");
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON "StockTransactions"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON "StockTransactions"("transactionType");

-- Create a view for stock status
CREATE OR REPLACE VIEW "StockStatus" AS
SELECT 
    im."itemNumber",
    im."shortDescription",
    im."manufacturerName",
    im."plannedStock",
    im."stockItem",
    sl."minimumStock",
    sl."maximumStock", 
    sl."reorderPoint",
    sl."safetyStock",
    sl.location,
    COALESCE(i.quantity, 0) as "currentStock",
    CASE 
        WHEN COALESCE(i.quantity, 0) <= sl."reorderPoint" THEN 'REORDER_NEEDED'
        WHEN COALESCE(i.quantity, 0) <= sl."minimumStock" THEN 'LOW_STOCK'
        WHEN COALESCE(i.quantity, 0) >= sl."maximumStock" THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as "stockStatus",
    (sl."maximumStock" - COALESCE(i.quantity, 0)) as "suggestedOrderQuantity"
FROM "ItemMasters" im
LEFT JOIN "StockLevels" sl ON im.id = sl."itemId" AND sl."isActive" = true
LEFT JOIN "Inventories" i ON im.id = i."itemId" AND (i.location = sl.location OR i.location IS NULL)
WHERE im.status = 'APPROVED' AND (im."plannedStock" = 'Y' OR im."stockItem" = 'Y');

-- Verify the creation
SELECT 'StockLevels table created' as message, COUNT(*) as row_count FROM "StockLevels"
UNION ALL
SELECT 'StockTransactions table created' as message, COUNT(*) as row_count FROM "StockTransactions"
UNION ALL  
SELECT 'StockStatus view created' as message, COUNT(*) as row_count FROM "StockStatus";
