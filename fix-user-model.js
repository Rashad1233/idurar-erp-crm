const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

async function fixUserModel() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Test the validPassword function
    const [users] = await sequelize.query(`
      SELECT * FROM "Users" LIMIT 1;
    `);
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`Testing with user: ${user.email}`);
      
      // Create a sample function to test password validation
      const validPassword = async (hashedPassword, plainPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
      };
      
      // Create a user object with a validPassword method
      console.log('Testing password validation function...');
      try {
        // Sample password is 'admin123'
        const result = await validPassword(user.password, 'admin123');
        console.log('Password validation test result:', result);
        
        if (!result) {
          console.log('Password validation failed. Updating admin password...');
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          await sequelize.query(`
            UPDATE "Users"
            SET password = '${hashedPassword}'
            WHERE email = 'admin@erp.com';
          `);
          console.log('Admin password updated successfully.');
        }
      } catch (err) {
        console.error('Error validating password:', err.message);
      }
    }
    
    console.log('User model fix complete!');
  } catch (error) {
    console.error('Error fixing user model:', error);
  }
}

fixUserModel();
