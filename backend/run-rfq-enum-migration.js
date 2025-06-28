const { sequelize } = require('./models/sequelize');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running RFQ status enum migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'update-rfq-status-enum.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await sequelize.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('The RFQ status enum has been updated.');
    console.log('- Removed: approved_by_supplier');
    console.log('- Added: rejected');
    console.log('- Any existing "approved_by_supplier" values have been changed to "completed"');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
