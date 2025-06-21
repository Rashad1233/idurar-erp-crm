const { sequelize } = require('./backend/models/sequelize');

async function checkUsers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Query the database for existing users
    const result = await sequelize.query(`
      SELECT 
        id, 
        email,
        "firstName",
        "lastName",
        "createdAt"
      FROM 
        "Users"
      LIMIT 10;
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('\n🔍 EXISTING USERS:');
    console.table(result);
    console.log('\n');
    
    if (result.length === 0) {
      console.log('No users found. Creating a default user...');
      
      // Create a default user
      const userId = '11111111-1111-1111-1111-111111111111';
      const now = new Date().toISOString();
      
      await sequelize.query(`
        INSERT INTO "Users" (
          "id",
          "email",
          "firstName",
          "lastName",
          "password",
          "role",
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `, {
        bind: [
          userId,
          'system@example.com',
          'System',
          'User',
          'password123', // This would normally be hashed
          'admin',
          now,
          now
        ],
        type: sequelize.QueryTypes.INSERT
      });
      
      console.log('Default user created with ID:', userId);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the function
checkUsers();
