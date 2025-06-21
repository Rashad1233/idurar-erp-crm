const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'postgres', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Define User model directly
    const User = sequelize.define('User', {
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'user'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE
      }
    });
    
    // Force sync all models (CAUTION: This drops all tables!)
    console.log('Syncing database models...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully!');
    
    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await User.create({
        username: 'admin',
        email: 'admin@erp.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created successfully!');
    } catch (userError) {
      console.error('Failed to create user:', userError);
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
}

// Run the initialization
initializeDatabase();

// Run the initialization
initializeDatabase();
