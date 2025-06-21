const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

// Configure database connection
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: false
});

async function checkUsers() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Get all users
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, "isActive", "createdAt"
      FROM "Users"
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`Found ${users.length} users in the database:`);
    console.table(users);
    
    // Create sample admin user if none exists
    if (users.length === 0) {
      console.log('Creating sample admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sequelize.query(`
        INSERT INTO "Users" (
          id, name, email, password, role, "isActive", "createdAt", "updatedAt"
        ) VALUES (
          :id, :name, :email, :password, :role, :isActive, :createdAt, :updatedAt
        )
      `, {
        replacements: {
          id: require('uuid').v4(),
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Verify user was created
      const [newUsers] = await sequelize.query(`
        SELECT id, name, email, role, "isActive", "createdAt"
        FROM "Users"
        ORDER BY "createdAt" DESC
      `);
      
      console.log('✅ Created sample admin user:');
      console.table(newUsers);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
