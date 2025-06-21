const sequelize = require('./config/postgresql');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to ItemMasters table...');
    
    // Add all the missing columns that the SQL is trying to access
    const missingColumns = [
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "item_number" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "short_description" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "long_description" TEXT DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "standard_description" TEXT DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "manufacturer_name" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "manufacturer_part_number" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "equipment_category" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "equipment_sub_category" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "unspsc_code" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "equipment_tag" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "serial_number" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "stock_item" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "planned_stock" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "category" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "subcategory" VARCHAR DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "specifications" TEXT DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "minimum_order_quantity" NUMERIC DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "reorder_point" NUMERIC DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "lead_time" INTEGER DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "unspsc_code_id" UUID DEFAULT NULL;',
      'ALTER TABLE "ItemMasters" ADD COLUMN IF NOT EXISTS "created_by_id" UUID DEFAULT NULL;'
    ];
    
    for (const sql of missingColumns) {
      await sequelize.query(sql);
      console.log('✅ Executed:', sql.substring(0, 50) + '...');
    }
    
    // Copy data from camelCase columns to snake_case columns
    const copyData = [
      'UPDATE "ItemMasters" SET "item_number" = "itemNumber" WHERE "item_number" IS NULL;',
      'UPDATE "ItemMasters" SET "short_description" = "shortDescription" WHERE "short_description" IS NULL;',
      'UPDATE "ItemMasters" SET "long_description" = "longDescription" WHERE "long_description" IS NULL;',
      'UPDATE "ItemMasters" SET "standard_description" = "standardDescription" WHERE "standard_description" IS NULL;',
      'UPDATE "ItemMasters" SET "manufacturer_name" = "manufacturerName" WHERE "manufacturer_name" IS NULL;',
      'UPDATE "ItemMasters" SET "manufacturer_part_number" = "manufacturerPartNumber" WHERE "manufacturer_part_number" IS NULL;',
      'UPDATE "ItemMasters" SET "equipment_category" = "equipmentCategory" WHERE "equipment_category" IS NULL;',
      'UPDATE "ItemMasters" SET "equipment_sub_category" = "equipmentSubCategory" WHERE "equipment_sub_category" IS NULL;',
      'UPDATE "ItemMasters" SET "unspsc_code" = "unspscCode" WHERE "unspsc_code" IS NULL;',
      'UPDATE "ItemMasters" SET "equipment_tag" = "equipmentTag" WHERE "equipment_tag" IS NULL;',
      'UPDATE "ItemMasters" SET "serial_number" = "serialNumber" WHERE "serial_number" IS NULL;',
      'UPDATE "ItemMasters" SET "stock_item" = "stockItem" WHERE "stock_item" IS NULL;',
      'UPDATE "ItemMasters" SET "planned_stock" = "plannedStock" WHERE "planned_stock" IS NULL;',
      'UPDATE "ItemMasters" SET "unspsc_code_id" = "unspscCodeId" WHERE "unspsc_code_id" IS NULL;',
      'UPDATE "ItemMasters" SET "created_by_id" = "createdById" WHERE "created_by_id" IS NULL;'
    ];
    
    for (const sql of copyData) {
      await sequelize.query(sql);
      console.log('✅ Copied data:', sql.substring(0, 50) + '...');
    }
    
    console.log('✅ All missing columns added and data copied!');
    
  } catch (error) {
    console.error('Error adding columns:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();
