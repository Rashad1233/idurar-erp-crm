-- Create item_master table
CREATE TABLE IF NOT EXISTS item_master (
    id UUID PRIMARY KEY,
    item_number VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    uom VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    subcategory VARCHAR(255),
    specifications TEXT,
    minimum_order_quantity DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    lead_time INTEGER,
    status VARCHAR(50) DEFAULT 'DRAFT',
    unspsc_code_id UUID,
    created_by_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create UNSPSC table if it doesn't exist
CREATE TABLE IF NOT EXISTS unspsc_codes (
    id UUID PRIMARY KEY,
    code VARCHAR(8) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint
ALTER TABLE item_master 
ADD CONSTRAINT fk_item_master_unspsc_code 
FOREIGN KEY (unspsc_code_id) 
REFERENCES unspsc_codes(id) 
ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_item_master_unspsc_code 
ON item_master(unspsc_code_id);
