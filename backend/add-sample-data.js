const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mimiapp',
  user: 'postgres',
  password: 'UHm8g167'
});

async function addSampleData() {
  try {
    console.log('📦 Adding sample data...\n');

    // Add sample suppliers
    console.log('🏢 Creating sample suppliers...');
    const suppliers = [
      {
        name: 'ABC Office Supplies Ltd',
        email: 'contact@abcoffice.com',
        phone: '+1-555-0101',
        address: '123 Business Park, New York, NY 10001',
        contact_person: 'John Smith',
        status: 'active'
      },
      {
        name: 'Tech Solutions Inc',
        email: 'sales@techsolutions.com',
        phone: '+1-555-0102',
        address: '456 Tech Avenue, San Francisco, CA 94105',
        contact_person: 'Sarah Johnson',
        status: 'active'
      },
      {
        name: 'Global Furniture Co',
        email: 'info@globalfurniture.com',
        phone: '+1-555-0103',
        address: '789 Industrial Road, Chicago, IL 60601',
        contact_person: 'Michael Brown',
        status: 'active'
      }
    ];

    const supplierIds = [];
    for (const supplier of suppliers) {
      const result = await pool.query(
        `INSERT INTO suppliers (name, email, phone, address, contact_person, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [supplier.name, supplier.email, supplier.phone, supplier.address, supplier.contact_person, supplier.status]
      );
      supplierIds.push(result.rows[0].id);
      console.log(`  ✅ Created supplier: ${supplier.name} (ID: ${result.rows[0].id})`);
    }

    // Add sample contracts
    console.log('\n📄 Creating sample contracts...');
    const contracts = [
      {
        contract_number: 'CTR-2024-001',
        supplier_id: supplierIds[0],
        title: 'Office Supplies Annual Contract',
        description: 'Annual contract for office supplies including stationery, paper, and general office items',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        total_value: 50000.00,
        status: 'active'
      },
      {
        contract_number: 'CTR-2024-002',
        supplier_id: supplierIds[1],
        title: 'IT Equipment and Services',
        description: 'Contract for IT equipment, software licenses, and support services',
        start_date: '2024-02-01',
        end_date: '2025-01-31',
        total_value: 150000.00,
        status: 'active'
      },
      {
        contract_number: 'CTR-2024-003',
        supplier_id: supplierIds[2],
        title: 'Office Furniture Supply',
        description: 'Contract for office furniture including desks, chairs, and storage units',
        start_date: '2024-03-01',
        end_date: '2025-02-28',
        total_value: 75000.00,
        status: 'pending_approval'
      }
    ];

    const contractIds = [];
    for (const contract of contracts) {
      const result = await pool.query(
        `INSERT INTO contracts (contract_number, supplier_id, title, description, start_date, end_date, total_value, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [contract.contract_number, contract.supplier_id, contract.title, contract.description, 
         contract.start_date, contract.end_date, contract.total_value, contract.status]
      );
      contractIds.push(result.rows[0].id);
      console.log(`  ✅ Created contract: ${contract.contract_number} - ${contract.title}`);
    }

    // Add sample contract items
    console.log('\n📋 Creating sample contract items...');
    const contractItems = [
      // Items for Office Supplies contract
      {
        contract_id: contractIds[0],
        item_code: 'OFF-001',
        item_description: 'A4 Paper (500 sheets)',
        unit_price: 5.99,
        quantity: 1000,
        total_price: 5990.00
      },
      {
        contract_id: contractIds[0],
        item_code: 'OFF-002',
        item_description: 'Blue Ballpoint Pens (Box of 12)',
        unit_price: 3.50,
        quantity: 200,
        total_price: 700.00
      },
      // Items for IT Equipment contract
      {
        contract_id: contractIds[1],
        item_code: 'IT-001',
        item_description: 'Laptop - Dell Latitude 5520',
        unit_price: 1200.00,
        quantity: 50,
        total_price: 60000.00
      },
      {
        contract_id: contractIds[1],
        item_code: 'IT-002',
        item_description: 'Microsoft Office 365 License',
        unit_price: 150.00,
        quantity: 100,
        total_price: 15000.00
      },
      // Items for Furniture contract
      {
        contract_id: contractIds[2],
        item_code: 'FUR-001',
        item_description: 'Executive Desk',
        unit_price: 500.00,
        quantity: 20,
        total_price: 10000.00
      },
      {
        contract_id: contractIds[2],
        item_code: 'FUR-002',
        item_description: 'Ergonomic Office Chair',
        unit_price: 250.00,
        quantity: 50,
        total_price: 12500.00
      }
    ];

    for (const item of contractItems) {
      await pool.query(
        `INSERT INTO contract_items (contract_id, item_code, item_description, unit_price, quantity, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.contract_id, item.item_code, item.item_description, item.unit_price, item.quantity, item.total_price]
      );
      console.log(`  ✅ Added item: ${item.item_code} - ${item.item_description}`);
    }

    // Add a sample purchase requisition
    console.log('\n📝 Creating sample purchase requisition...');
    const prResult = await pool.query(
      `INSERT INTO purchase_requisitions (pr_number, requester_id, department, request_date, required_date, status, total_amount, contract_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      ['PR-2024-001', 1, 'IT Department', '2024-01-15', '2024-02-01', 'draft', 2400.00, contractIds[1]]
    );
    const prId = prResult.rows[0].id;
    console.log(`  ✅ Created purchase requisition: PR-2024-001`);

    // Add items to the purchase requisition
    const prItems = [
      {
        pr_id: prId,
        item_code: 'IT-001',
        item_description: 'Laptop - Dell Latitude 5520',
        quantity: 2,
        unit_price: 1200.00,
        total_price: 2400.00
      }
    ];

    for (const item of prItems) {
      await pool.query(
        `INSERT INTO purchase_requisition_items (pr_id, item_code, item_description, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.pr_id, item.item_code, item.item_description, item.quantity, item.unit_price, item.total_price]
      );
      console.log(`  ✅ Added PR item: ${item.item_code} - ${item.item_description}`);
    }

    console.log('\n🎉 Sample data added successfully!');

    // Display summary
    const supplierCount = await pool.query('SELECT COUNT(*) FROM suppliers');
    const contractCount = await pool.query('SELECT COUNT(*) FROM contracts');
    const prCount = await pool.query('SELECT COUNT(*) FROM purchase_requisitions');

    console.log('\n📊 Database Summary:');
    console.log(`  - Suppliers: ${supplierCount.rows[0].count}`);
    console.log(`  - Contracts: ${contractCount.rows[0].count}`);
    console.log(`  - Purchase Requisitions: ${prCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleData();
