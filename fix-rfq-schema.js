// Fix RFQ database schema
const { sequelize } = require('./backend/models/sequelize');

async function fixRFQSchema() {
  try {
    console.log('🔧 Fixing RFQ database schema...');
    
    // 1. Create RequestForQuotations table if it doesn't exist
    console.log('\n1. Creating RequestForQuotations table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "RequestForQuotations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "rfqNumber" VARCHAR(255) UNIQUE NOT NULL,
        "description" TEXT NOT NULL,
        "status" VARCHAR(50) DEFAULT 'draft',
        "responseDeadline" TIMESTAMP WITH TIME ZONE NOT NULL,
        "notes" TEXT,
        "attachments" JSONB DEFAULT '[]',
        "purchaseRequisitionId" UUID,
        "createdById" UUID NOT NULL,
        "updatedById" UUID NOT NULL,
        "sentAt" TIMESTAMP WITH TIME ZONE,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ RequestForQuotations table created/verified');
    
    // 2. Add missing columns to RfqSuppliers table
    console.log('\n2. Adding missing columns to RfqSuppliers...');
    
    // Check if responseToken column exists
    const [tokenColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'RfqSuppliers' 
      AND column_name = 'responseToken'
      AND table_schema = 'public';
    `);
    
    if (tokenColumn.length === 0) {
      await sequelize.query(`
        ALTER TABLE "RfqSuppliers" 
        ADD COLUMN "responseToken" VARCHAR(255) UNIQUE;
      `);
      console.log('✅ Added responseToken column to RfqSuppliers');
    } else {
      console.log('✅ responseToken column already exists');
    }
    
    // Check if tokenExpiry column exists
    const [expiryColumn] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'RfqSuppliers' 
      AND column_name = 'tokenExpiry'
      AND table_schema = 'public';
    `);
    
    if (expiryColumn.length === 0) {
      await sequelize.query(`
        ALTER TABLE "RfqSuppliers" 
        ADD COLUMN "tokenExpiry" TIMESTAMP WITH TIME ZONE;
      `);
      console.log('✅ Added tokenExpiry column to RfqSuppliers');
    } else {
      console.log('✅ tokenExpiry column already exists');
    }
    
    // 3. Create status enum if it doesn't exist
    console.log('\n3. Creating RFQ status enum...');
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE rfq_status AS ENUM ('draft', 'sent', 'in_progress', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE rfq_supplier_status AS ENUM ('pending', 'sent', 'responded', 'selected', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ RFQ enums created/verified');
    
    // 4. Update status column types
    console.log('\n4. Updating status column types...');
    try {
      await sequelize.query(`
        ALTER TABLE "RequestForQuotations" 
        ALTER COLUMN "status" TYPE rfq_status USING "status"::rfq_status;
      `);
      console.log('✅ Updated RequestForQuotations status column');
    } catch (error) {
      console.log('⚠️  RequestForQuotations status column update skipped:', error.message);
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE "RfqSuppliers" 
        ALTER COLUMN "status" TYPE rfq_supplier_status USING "status"::rfq_supplier_status;
      `);
      console.log('✅ Updated RfqSuppliers status column');
    } catch (error) {
      console.log('⚠️  RfqSuppliers status column update skipped:', error.message);
    }
    
    console.log('\n🎉 RFQ schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing RFQ schema:', error.message);
    console.error('❌ Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

fixRFQSchema();