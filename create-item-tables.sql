-- Create the uuid-ossp extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create unspsc_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS unspsc_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) NOT NULL UNIQUE,
  title VARCHAR(255),
  description TEXT,
  segment VARCHAR(10),
  family VARCHAR(10),
  class VARCHAR(10),
  commodity VARCHAR(10),
  parent_id UUID,
  level VARCHAR(10),
  is_leaf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES unspsc_codes(id) ON DELETE SET NULL
);

-- Create item_master table if it doesn't exist
CREATE TABLE IF NOT EXISTS item_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_number VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  short_description VARCHAR(255),
  long_description TEXT,
  standard_description VARCHAR(255),
  uom VARCHAR(10) NOT NULL,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  manufacturer_name VARCHAR(255),
  manufacturer_part_number VARCHAR(100),
  equipment_category VARCHAR(50),
  equipment_sub_category VARCHAR(50),
  equipment_tag VARCHAR(50),
  serial_number CHAR(1) DEFAULT 'N',
  criticality VARCHAR(10) DEFAULT 'NO',
  stock_item CHAR(1) DEFAULT 'N',
  planned_stock CHAR(1) DEFAULT 'N',
  unspsc_code VARCHAR(10),
  unspsc_code_id UUID,
  status VARCHAR(20) DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID,
  FOREIGN KEY (unspsc_code_id) REFERENCES unspsc_codes(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_item_master_item_number ON item_master(item_number);
CREATE INDEX IF NOT EXISTS idx_item_master_description ON item_master(description);
CREATE INDEX IF NOT EXISTS idx_item_master_category ON item_master(category);
CREATE INDEX IF NOT EXISTS idx_item_master_unspsc_code ON item_master(unspsc_code);
CREATE INDEX IF NOT EXISTS idx_item_master_status ON item_master(status);
