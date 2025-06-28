const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mimiapp',
  user: 'postgres',
  password: 'UHm8g167'
});

async function testDatabaseSetup() {
  try {
    console.log('🔍 Testing Database Setup...\n');

    // Test connection
    console.log('1️⃣ Testing database connection...');
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('   ✅ Connected successfully at:', connectionTest.rows[0].now);

    // Test tables exist
    console.log('\n2️⃣ Checking tables...');
    const tables = ['users', 'suppliers', 'contracts', 'contract_items', 'purchase_requisitions', 'purchase_requisition_items'];
    
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );
      console.log(`   ${result.rows[0].exists ? '✅' : '❌'} Table '${table}' exists`);
    }

    // Test data counts
    console.log('\n3️⃣ Checking data counts...');
    const counts = {
      users: await pool.query('SELECT COUNT(*) FROM users'),
      suppliers: await pool.query('SELECT COUNT(*) FROM suppliers'),
      contracts: await pool.query('SELECT COUNT(*) FROM contracts'),
      contract_items: await pool.query('SELECT COUNT(*) FROM contract_items'),
      purchase_requisitions: await pool.query('SELECT COUNT(*) FROM purchase_requisitions'),
      purchase_requisition_items: await pool.query('SELECT COUNT(*) FROM purchase_requisition_items')
    };

    for (const [table, result] of Object.entries(counts)) {
      console.log(`   📊 ${table}: ${result.rows[0].count} records`);
    }

    // Test admin user
    console.log('\n4️⃣ Testing admin user...');
    const adminUser = await pool.query("SELECT * FROM users WHERE email = 'admin@example.com'");
    if (adminUser.rows.length > 0) {
      console.log('   ✅ Admin user found:');
      console.log(`      - ID: ${adminUser.rows[0].id}`);
      console.log(`      - Name: ${adminUser.rows[0].name}`);
      console.log(`      - Email: ${adminUser.rows[0].email}`);
      console.log(`      - Role: ${adminUser.rows[0].role}`);
    } else {
      console.log('   ❌ Admin user not found');
    }

    // Test sample data relationships
    console.log('\n5️⃣ Testing data relationships...');
    
    // Test contracts with suppliers
    const contractsWithSuppliers = await pool.query(`
      SELECT c.contract_number, c.title, s.name as supplier_name
      FROM contracts c
      JOIN suppliers s ON c.supplier_id = s.id
      LIMIT 3
    `);
    
    console.log('   📄 Contracts with suppliers:');
    contractsWithSuppliers.rows.forEach(row => {
      console.log(`      - ${row.contract_number}: ${row.title} (${row.supplier_name})`);
    });

    // Test contract items
    const contractItems = await pool.query(`
      SELECT ci.item_code, ci.item_description, c.contract_number
      FROM contract_items ci
      JOIN contracts c ON ci.contract_id = c.id
      LIMIT 3
    `);
    
    console.log('\n   📋 Contract items:');
    contractItems.rows.forEach(row => {
      console.log(`      - ${row.item_code}: ${row.item_description} (${row.contract_number})`);
    });

    // Test purchase requisitions
    const prWithContract = await pool.query(`
      SELECT pr.pr_number, pr.department, c.contract_number
      FROM purchase_requisitions pr
      LEFT JOIN contracts c ON pr.contract_id = c.id
      LIMIT 1
    `);
    
    if (prWithContract.rows.length > 0) {
      console.log('\n   📝 Purchase requisition:');
      const pr = prWithContract.rows[0];
      console.log(`      - ${pr.pr_number} from ${pr.department}`);
      if (pr.contract_number) {
        console.log(`      - Linked to contract: ${pr.contract_number}`);
      }
    }

    console.log('\n✅ Database setup test completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Start backend: cd backend && npm start');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Login with: admin@example.com / admin123');

  } catch (error) {
    console.error('❌ Error testing database setup:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check database credentials');
    console.error('   3. Run setup scripts if tables are missing');
  } finally {
    await pool.end();
  }
}

testDatabaseSetup();
