-- Create Items table (if not exists)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50),
    price DECIMAL(15,2),
    cost DECIMAL(15,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales Orders table (if not exists)
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales Order Items table (if not exists)
CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO items (name, description, sku, barcode, category, unit, price, cost, stock_quantity) VALUES
('Laptop Computer', 'Dell Latitude 5520', 'LAP-001', '1234567890123', 'Electronics', 'piece', 1200.00, 900.00, 10),
('Office Chair', 'Ergonomic office chair', 'CHR-001', '1234567890124', 'Furniture', 'piece', 250.00, 180.00, 5),
('Printer Paper', 'A4 white paper 500 sheets', 'PPR-001', '1234567890125', 'Office Supplies', 'ream', 15.00, 12.00, 50)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO customers (name, email, phone, address, city, state, country, contact_person) VALUES
('ABC Corporation', 'contact@abc-corp.com', '+1-555-0123', '123 Business Ave', 'New York', 'NY', 'USA', 'John Smith'),
('XYZ Ltd', 'info@xyz-ltd.com', '+1-555-0124', '456 Commerce St', 'Los Angeles', 'CA', 'USA', 'Jane Doe'),
('Global Tech Solutions', 'sales@globaltech.com', '+1-555-0125', '789 Tech Blvd', 'Austin', 'TX', 'USA', 'Mike Johnson')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON sales_order_items(sales_order_id);
