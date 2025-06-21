const { Sequelize } = require('sequelize');

// Configure database connection
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: false
});

async function fixModelAssociations() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Check table associations by examining foreign keys
    const [foreignKeys] = await sequelize.query(`
      SELECT
        tc.table_name as table_name,
        kcu.column_name as column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    
    console.log('\n📊 Foreign key relationships in the database:');
    console.table(foreignKeys);
    
    // Check if ItemMasters has the right associations
    const itemMasterFKs = foreignKeys.filter(fk => fk.table_name === 'ItemMasters');
    console.log('\n📊 ItemMasters foreign keys:');
    console.table(itemMasterFKs);
    
    // Check Users table
    const [userColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Users columns:');
    console.table(userColumns);
    
    // Fix createdById and updatedById in ItemMasters if needed
    const [itemMasterColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 ItemMasters columns:');
    console.table(itemMasterColumns);
    
    // Check if the association is properly defined
    const hasCreatedById = itemMasterColumns.some(col => col.column_name === 'createdById');
    const hasUpdatedById = itemMasterColumns.some(col => col.column_name === 'updatedById');
    
    if (!hasCreatedById || !hasUpdatedById) {
      console.log('\n⚠️ Adding missing foreign key columns to ItemMasters...');
      
      if (!hasCreatedById) {
        await sequelize.query(`
          ALTER TABLE "ItemMasters" 
          ADD COLUMN "createdById" UUID 
          REFERENCES "Users"(id)
        `);
      }
      
      if (!hasUpdatedById) {
        await sequelize.query(`
          ALTER TABLE "ItemMasters" 
          ADD COLUMN "updatedById" UUID 
          REFERENCES "Users"(id)
        `);
      }
      
      console.log('✅ Added missing columns');
    } else {
      console.log('✅ Required columns already exist');
    }
    
    // Update the database models file to ensure associations are properly defined
    console.log('\n📝 Checking model definitions...');
    
    // Test the associations with a query
    try {
      const [testQuery] = await sequelize.query(`
        SELECT i.id, i."itemNumber", i.description, 
               u1.name AS created_by_name, 
               u2.name AS updated_by_name
        FROM "ItemMasters" i
        LEFT JOIN "Users" u1 ON i."createdById" = u1.id
        LEFT JOIN "Users" u2 ON i."updatedById" = u2.id
        LIMIT 5
      `);
      
      console.log('\n✅ Association query works:');
      console.table(testQuery);
    } catch (error) {
      console.error('❌ Error testing associations:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sequelize.close();
  }
}

fixModelAssociations();
