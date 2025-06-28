const { sequelize } = require('../models/sequelize');

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to ItemMasters table...');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters' 
      AND column_name IN ('quantityPerKg', 'quantityPerCubicMeter')
    `);
    
    const existingColumns = results.map(row => row.column_name);
    console.log('📊 Existing columns:', existingColumns);
    
    if (!existingColumns.includes('quantityPerKg')) {
      console.log('➕ Adding quantityPerKg column...');
      await sequelize.query(`
        ALTER TABLE "ItemMasters" 
        ADD COLUMN "quantityPerKg" DECIMAL(10,4) NULL
      `);
      console.log('✅ quantityPerKg column added');
    } else {
      console.log('ℹ️ quantityPerKg column already exists');
    }
    
    if (!existingColumns.includes('quantityPerCubicMeter')) {
      console.log('➕ Adding quantityPerCubicMeter column...');
      await sequelize.query(`
        ALTER TABLE "ItemMasters" 
        ADD COLUMN "quantityPerCubicMeter" DECIMAL(10,4) NULL
      `);
      console.log('✅ quantityPerCubicMeter column added');
    } else {
      console.log('ℹ️ quantityPerCubicMeter column already exists');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();