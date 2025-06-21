-- Create the UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the unspsc_codes table
CREATE TABLE IF NOT EXISTS unspsc_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(8) NOT NULL UNIQUE,
    segment VARCHAR(2) NOT NULL,
    family VARCHAR(2) NOT NULL,
    class VARCHAR(2) NOT NULL,
    commodity VARCHAR(2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    definition TEXT,
    level VARCHAR(10) NOT NULL CHECK (level IN ('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to ensure UUID extension is available
CREATE OR REPLACE FUNCTION create_uuid_extension()
RETURNS VOID AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'uuid-ossp extension might already exist';
END;
$$ LANGUAGE plpgsql;

-- Call the function to create UUID extension if needed
SELECT create_uuid_extension();

-- Add sample data
INSERT INTO unspsc_codes (code, segment, family, class, commodity, title, definition, level)
VALUES 
('14000000', '14', '00', '00', '00', 'Paper Materials and Products', 'Paper products and materials', 'SEGMENT'),
('14160000', '14', '16', '00', '00', 'Office supplies', 'Office supplies and materials', 'FAMILY'),
('14160700', '14', '16', '07', '00', 'Office machine supplies', 'Supplies for office machines including printers', 'CLASS'),
('14160704', '14', '16', '07', '04', 'Printer or photocopier toner', 'Toner for printers and photocopiers', 'COMMODITY')
ON CONFLICT (code) DO NOTHING;
