const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mimiapp',
  user: 'postgres',
  password: 'UHm8g167'
});

async function setupDatabaseTables() {
  try {
    console.log('🔧 Setting up database tables...\n');

    // Create users table
    console.log('📋 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        enabled BOOLEAN DEFAULT true,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        removed BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Users table created\n');

    // Create suppliers table
    console.log('📋 Creating suppliers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        contact_person VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        removed BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Suppliers table created\n');

    // Create contracts table
    console.log('📋 Creating contracts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        contract_number VARCHAR(100) UNIQUE NOT NULL,
        supplier_id INTEGER REFERENCES suppliers(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        total_value DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'draft',
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        removed BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Contracts table created\n');

    // Create contract_items table
    console.log('📋 Creating contract_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contract_items (
        id SERIAL PRIMARY KEY,
        contract_id INTEGER REFERENCES contracts(id),
        item_code VARCHAR(100),
        item_description TEXT,
        unit_price DECIMAL(15,2),
        quantity INTEGER,
        total_price DECIMAL(15,2),
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contract items table created\n');

    // Create purchase_requisitions table
    console.log('📋 Creating purchase_requisitions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_requisitions (
        id SERIAL PRIMARY KEY,
        pr_number VARCHAR(100) UNIQUE NOT NULL,
        requester_id INTEGER REFERENCES users(id),
        department VARCHAR(255),
        request_date DATE DEFAULT CURRENT_DATE,
        required_date DATE,
        status VARCHAR(50) DEFAULT 'draft',
        total_amount DECIMAL(15,2),
        contract_id INTEGER REFERENCES contracts(id),
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        removed BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Purchase requisitions table created\n');

    // Create purchase_requisition_items table
    console.log('📋 Creating purchase_requisition_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_requisition_items (
        id SERIAL PRIMARY KEY,
        pr_id INTEGER REFERENCES purchase_requisitions(id),
        item_code VARCHAR(100),
        item_description TEXT,
        quantity INTEGER,
        unit_price DECIMAL(15,2),
        total_price DECIMAL(15,2),
        contract_item_id INTEGER REFERENCES contract_items(id),
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Purchase requisition items table created\n');

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabaseTables();
