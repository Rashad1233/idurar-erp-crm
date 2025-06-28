const { sequelize } = require('./models/sequelize');

async function runMigration() {
  try {
    console.log('Running RFQ status enum migration...');
    
    // Run the migration in a transaction
    await sequelize.transaction(async (t) => {
      // First, drop the default constraint
      await sequelize.query(`
        ALTER TABLE "RequestForQuotations" 
        ALTER COLUMN status DROP DEFAULT;
      `, { transaction: t });
      
      // Create a new enum type with the correct values
      await sequelize.query(`
        CREATE TYPE "enum_RequestForQuotations_status_new" AS ENUM ('draft', 'sent', 'in_progress', 'completed', 'cancelled', 'rejected');
      `, { transaction: t });
      
      // Update any existing 'approved_by_supplier' values to 'completed'
      await sequelize.query(`
        UPDATE "RequestForQuotations" 
        SET status = 'completed' 
        WHERE status = 'approved_by_supplier';
      `, { transaction: t });
      
      // Change the column to use the new enum type
      await sequelize.query(`
        ALTER TABLE "RequestForQuotations" 
        ALTER COLUMN status TYPE "enum_RequestForQuotations_status_new" 
        USING status::text::"enum_RequestForQuotations_status_new";
      `, { transaction: t });
      
      // Drop the old enum type
      await sequelize.query(`
        DROP TYPE "enum_RequestForQuotations_status";
      `, { transaction: t });
      
      // Rename the new enum type to the original name
      await sequelize.query(`
        ALTER TYPE "enum_RequestForQuotations_status_new" RENAME TO "enum_RequestForQuotations_status";
      `, { transaction: t });
      
      // Re-add the default constraint
      await sequelize.query(`
        ALTER TABLE "RequestForQuotations" 
        ALTER COLUMN status SET DEFAULT 'draft';
      `, { transaction: t });
    });
    
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
