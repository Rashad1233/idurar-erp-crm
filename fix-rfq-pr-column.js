// Fix purchaseRequisitionId column to allow null
const { sequelize } = require('./backend/models/sequelize');

async function fixPRColumn() {
  try {
    console.log('🔧 Fixing purchaseRequisitionId column...');
    
    await sequelize.query(`
      ALTER TABLE "RequestForQuotations" 
      ALTER COLUMN "purchaseRequisitionId" DROP NOT NULL;
    `);
    
    console.log('✅ purchaseRequisitionId column updated to allow null values');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixPRColumn();