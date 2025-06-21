const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Query to check existing tables and their schemas
    const [results] = await sequelize.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name IN ('Suppliers', 'Contracts', 'PurchaseRequisitions', 'PurchaseOrders', 'RequestForQuotations')
      ORDER BY table_name, ordinal_position;
    `);
    
    console.log('\nExisting procurement-related tables and their columns:');
    console.table(results);
    
    // Also check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%uppl%' 
        OR table_name LIKE '%urchase%' 
        OR table_name LIKE '%ontract%'
        OR table_name LIKE '%fq%'
      ORDER BY table_name;
    `);
    
    console.log('\nAll procurement-related tables:');
    console.table(tables);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
