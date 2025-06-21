const sequelize = require('./config/postgresql');

async function addItemIdColumn() {
  try {
    console.log('Adding itemId column to Inventories table...');
    
    // Add itemId column as an alias
    await sequelize.query(`
      ALTER TABLE "Inventories" ADD COLUMN IF NOT EXISTS "itemId" UUID;
    `);
    
    // Copy data from itemMasterId to itemId
    await sequelize.query(`
      UPDATE "Inventories" SET "itemId" = "itemMasterId" WHERE "itemId" IS NULL;
    `);
    
    console.log('✅ itemId column added and populated!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addItemIdColumn();
