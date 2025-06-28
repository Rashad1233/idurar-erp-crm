const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mimiapp',
  user: 'postgres',
  password: 'UHm8g167'  // Updated to match the configuration
});

async function checkAndCreateAdminUser() {
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin user exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@example.com'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('User ID:', checkResult.rows[0].id);
      console.log('Email:', checkResult.rows[0].email);
    } else {
      console.log('❌ Admin user not found. Creating...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user
      const insertResult = await pool.query(
        `INSERT INTO users (
          name, email, password, role, enabled, 
          created, updated, removed
        ) VALUES (
          'Admin User', 'admin@example.com', $1, 'admin', true,
          NOW(), NOW(), false
        ) RETURNING *`,
        [hashedPassword]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('User ID:', insertResult.rows[0].id);
      console.log('Email:', insertResult.rows[0].email);
    }
    
    // Also check if we have any suppliers
    const supplierResult = await pool.query("SELECT COUNT(*) FROM suppliers");
    console.log('\n📊 Supplier count:', supplierResult.rows[0].count);
    
    // Check if we have any contracts
    const contractResult = await pool.query("SELECT COUNT(*) FROM contracts");
    console.log('📊 Contract count:', contractResult.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateAdminUser();
