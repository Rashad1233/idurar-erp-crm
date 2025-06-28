const { sequelize } = require('./backend/models/sequelize');

async function addContractIdToPR() {
  try {
    console.log('🔄 Adding contractId column to PurchaseRequisitions table...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'PurchaseRequisitions' 
      AND column_name = 'contractId'
    `);
    
    if (results.length > 0) {
      console.log('✅ contractId column already exists in PurchaseRequisitions table');
      return;
    }
    
    // Add contractId column
    await sequelize.query(`
      ALTER TABLE "PurchaseRequisitions" 
      ADD COLUMN "contractId" UUID DEFAULT NULL
    `);
    
    console.log('✅ Added contractId column to PurchaseRequisitions table');
    
    // Add foreign key constraint (if Contracts table exists)
    try {
      await sequelize.query(`
        ALTER TABLE "PurchaseRequisitions" 
        ADD CONSTRAINT fk_purchase_requisition_contract 
        FOREIGN KEY ("contractId") REFERENCES "Contracts"(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint to Contracts table');
    } catch (error) {
      console.log('⚠️ Could not add foreign key constraint (Contracts table may not exist yet)');
    }
    
    // Add index for performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_contract_id 
      ON "PurchaseRequisitions"("contractId")
    `);
    
    console.log('✅ Added index for contractId column');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addContractIdToPR()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
