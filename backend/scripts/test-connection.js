// Simplified test authentication script
require('dotenv').config();
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Try a simple query
    const [results] = await sequelize.query('SELECT * FROM "Users" WHERE email = :email', {
      replacements: { email: 'admin@erp.com' }
    });
    
    console.log('Query results:', results);
    
    if (results.length > 0) {
      const user = results[0];
      console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Test direct bcrypt comparison
      console.log('Testing direct bcrypt comparison...');
      const directMatch = await bcrypt.compare('admin123', user.password);
      console.log(`Password comparison result: ${directMatch ? 'Matched' : 'Failed'}`);
    } else {
      console.log('No user found with email admin@erp.com');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

testConnection();
