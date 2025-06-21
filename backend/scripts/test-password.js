// Password test script
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

async function testPassword() {
  // Connect directly without using the exported sequelize instance
  const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connection established.');

    // Get the admin user
    const [users] = await sequelize.query('SELECT * FROM "Users" WHERE email = :email', {
      replacements: { email: 'admin@erp.com' }
    });

    if (users.length === 0) {
      console.log('Admin user not found.');
      return;
    }

    const user = users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      passwordHash: user.password.substr(0, 10) + '...'
    });

    // Test password with bcrypt
    const passwordToTest = 'admin123';
    console.log(`Testing password: "${passwordToTest}"`);
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    console.log(`Password match result: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

    // If failed, create a new password hash for comparison
    if (!isMatch) {
      console.log('Creating new hash for comparison...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(passwordToTest, salt);
      console.log(`New hash: ${newHash}`);
      console.log(`Stored hash: ${user.password}`);
      
      // Update the user's password for testing
      console.log('Updating user password...');
      await sequelize.query('UPDATE "Users" SET password = :newPassword WHERE id = :id', {
        replacements: { 
          newPassword: newHash,
          id: user.id
        }
      });
      console.log('Password updated successfully.');
    }

    await sequelize.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
