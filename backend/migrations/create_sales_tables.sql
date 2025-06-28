-- PostgreSQL migration script to create basic sales tables and associations

-- 1. Customer Table
CREATE TABLE IF NOT EXISTS "Customer" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customerNumber VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    customerType VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- 2. ItemMaster Table (for items)
CREATE TABLE IF NOT EXISTS "ItemMaster" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itemNumber VARCHAR(50) UNIQUE NOT NULL,
    shortDescription VARCHAR(255),
    longDescription TEXT,
    equipmentCategory VARCHAR(100),
    equipmentSubCategory VARCHAR(100),
    uom VARCHAR(20),
    manufacturerName VARCHAR(100),
    manufacturerPartNumber VARCHAR(100),
    status VARCHAR(50) DEFAULT 'APPROVED',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- 3. SalesOrder Table
CREATE TABLE IF NOT EXISTS "SalesOrder" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    soNumber VARCHAR(50) UNIQUE NOT NULL,
    customerId UUID REFERENCES "Customer"(id),
    customerName VARCHAR(255),
    subtotal NUMERIC(15,2) DEFAULT 0.00,
    vatRate NUMERIC(5,2) DEFAULT 18.00,
    discountType VARCHAR(50),
    discountValue NUMERIC(15,2) DEFAULT 0.00,
    seasonalDiscount NUMERIC(15,2) DEFAULT 0.00,
    specialDiscount NUMERIC(15,2) DEFAULT 0.00,
    paymentMethod VARCHAR(50),
    paymentStatus VARCHAR(50) DEFAULT 'pending',
    orderStatus VARCHAR(50) DEFAULT 'draft',
    currency VARCHAR(10) DEFAULT 'USD',
    notes TEXT,
    salesPersonId UUID,
    storeLocation VARCHAR(100),
    barcodeScanned JSONB DEFAULT '[]',
    createdById UUID,
    updatedById UUID,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- 4. SalesOrderItem Table
CREATE TABLE IF NOT EXISTS "SalesOrderItem" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salesOrderId UUID REFERENCES "SalesOrder"(id) ON DELETE CASCADE,
    itemMasterId UUID REFERENCES "ItemMaster"(id),
    itemNumber VARCHAR(50),
    itemDescription VARCHAR(255),
    barcode VARCHAR(100),
    quantity NUMERIC(15,2) DEFAULT 1.00,
    uom VARCHAR(20),
    unitPrice NUMERIC(15,2) DEFAULT 0.00,
    discount NUMERIC(15,2) DEFAULT 0.00,
    discountPercent NUMERIC(5,2) DEFAULT 0.00,
    category VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    brand VARCHAR(50),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- Associations for your system
-- If you have a users table, you can add foreign keys for salesPersonId, createdById, updatedById as needed.
-- If you have a store/branch table, you can add a foreign key for storeLocation.

-- Add user and branch associations (if you have these tables)
-- Example assumes you have a "User" table and a "Branch" table

-- 1. Add foreign key for salesPersonId, createdById, updatedById in SalesOrder
ALTER TABLE "SalesOrder"
  ADD CONSTRAINT fk_salesorder_salesperson FOREIGN KEY ("salesPersonId") REFERENCES "User"(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_salesorder_createdby FOREIGN KEY ("createdById") REFERENCES "User"(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_salesorder_updatedby FOREIGN KEY ("updatedById") REFERENCES "User"(id) ON DELETE SET NULL;

-- 2. Add foreign key for storeLocation if you have a Branch table
-- Uncomment and adjust the following if you have a Branch table:
-- ALTER TABLE "SalesOrder"
--   ADD CONSTRAINT fk_salesorder_branch FOREIGN KEY ("storeLocation") REFERENCES "Branch"(code) ON DELETE SET NULL;

-- 3. Add foreign key for createdAt/updatedAt if you want to track user actions in other tables as well
-- (Optional, based on your system's audit requirements)

-- 4. Add any additional associations as needed for your ERP system

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_salesorder_customerId ON "SalesOrder"(customerId);
CREATE INDEX IF NOT EXISTS idx_salesorderitem_salesOrderId ON "SalesOrderItem"(salesOrderId);
CREATE INDEX IF NOT EXISTS idx_salesorderitem_itemMasterId ON "SalesOrderItem"(itemMasterId);

-- You can further customize these tables to match your ERP's user, branch, or other system tables.
