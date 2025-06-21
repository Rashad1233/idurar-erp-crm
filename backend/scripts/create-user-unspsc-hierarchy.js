// Script to create the user_unspsc_hierarchy table in the database
require('dotenv').config();
const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

async function createUserUnspscHierarchyTable() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Define the UserUnspscHierarchy model directly (not using the model file to avoid circular dependencies)
    const UserUnspscHierarchy = sequelize.define('UserUnspscHierarchy', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      unspscCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      level: {
        type: DataTypes.ENUM('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true
      },
      segmentTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      family: {
        type: DataTypes.STRING,
        allowNull: true
      },
      familyTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      class: {
        type: DataTypes.STRING,
        allowNull: true
      },
      classTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      commodity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      commodityTitle: {
        type: DataTypes.STRING,
        allowNull: true
      },
      useFrequency: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      lastUsed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'user_unspsc_hierarchy',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'unspscCode']
        }
      ]
    });

    // Sync the model with the database
    console.log('Creating UserUnspscHierarchy table...');
    await UserUnspscHierarchy.sync({ force: false, alter: true });
    console.log('UserUnspscHierarchy table created or updated successfully');    // Add initial data from user favorites
    console.log('Populating initial data from user favorites...');
    
    try {
      // First, fetch all favorites
      const [favorites] = await sequelize.query(
        `SELECT "userId", "unspscCode", level, title, segment, "segmentTitle", 
         family, "familyTitle", class, "classTitle", commodity, "commodityTitle"
         FROM user_unspsc_favorites`
      );
      
      console.log(`Found ${favorites.length} favorites to import into hierarchy`);
      
      // Now insert them one by one using the model's create method to handle UUID generation
      let importedCount = 0;
      
      for (const favorite of favorites) {
        try {
          await UserUnspscHierarchy.findOrCreate({
            where: {
              userId: favorite.userId,
              unspscCode: favorite.unspscCode
            },
            defaults: {
              ...favorite,
              useFrequency: 1,
              lastUsed: new Date()
            }
          });
          importedCount++;
        } catch (err) {
          console.error(`Error importing favorite ${favorite.unspscCode}:`, err.message);
        }
      }
      
      console.log(`✅ Imported ${importedCount} favorites into hierarchy`);
    } catch (error) {
      console.error('Error importing favorites into hierarchy:', error);
    }

    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating UserUnspscHierarchy table:', error);
    if (sequelize) {
      await sequelize.close();
    }
    process.exit(1);
  }
}

// Run the migration
createUserUnspscHierarchyTable()
  .then(() => {
    console.log('✅ UserUnspscHierarchy table setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
