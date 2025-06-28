const { Pool } = require('pg');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'erp_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function setupDofaTable() {
  const client = await pool.connect();
  
  try {
    console.log('Starting DoFA table setup...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if the table already exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'DoFAs'
      );
    `;
    
    const tableExists = (await client.query(tableCheckQuery)).rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating DoFAs table...');
      
      // Create enum type for approval types
      await client.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_type_enum') THEN
                CREATE TYPE approval_type_enum AS ENUM ('PR', 'PO', 'Item', 'Invoice');
            END IF;
        END
        $$;
      `);
      
      // Create DoFAs table
      await client.query(`
        CREATE TABLE "DoFAs" (
          "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "userId" UUID NOT NULL REFERENCES "Users"(id),
          "costCenterId" UUID,
          "itemCategoryId" UUID,
          "approvalType" approval_type_enum NOT NULL,
          "thresholdMin" DECIMAL(15, 2) NOT NULL DEFAULT 0,
          "thresholdMax" DECIMAL(15, 2) NOT NULL,
          "isActive" BOOLEAN DEFAULT TRUE,
          "approvalOrder" INTEGER DEFAULT 1,
          "description" TEXT,
          "effectiveFrom" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "effectiveTo" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "deletedAt" TIMESTAMP WITH TIME ZONE
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_dofa_approval_type_user ON "DoFAs" ("approvalType", "userId", "approvalOrder");
        CREATE INDEX idx_dofa_active_dates ON "DoFAs" ("isActive", "effectiveFrom", "effectiveTo");
      `);
      
      console.log('DoFAs table created successfully');
      
      // Get admin user ID
      const adminResult = await client.query(`
        SELECT id FROM "Users" 
        WHERE role = 'admin' 
        LIMIT 1;
      `);
      
      if (adminResult.rows.length > 0) {
        const adminId = adminResult.rows[0].id;
        console.log(`Found admin user with ID: ${adminId}`);
        
        // Insert sample DoFA rules
        console.log('Inserting sample DoFA rules...');
        
        // Sample DoFA for Item approvals
        await client.query(`
          INSERT INTO "DoFAs" (
            "id", "userId", "approvalType", "thresholdMin", "thresholdMax", 
            "approvalOrder", "description", "isActive"
          )
          VALUES 
          ($1, $2, 'Item', 0, 500, 1, 'Item approval up to $500', true),
          ($3, $4, 'Item', 500.01, 3000, 2, 'Item approval $500-$3000', true),
          ($5, $6, 'Item', 3000.01, 10000, 3, 'Item approval $3000-$10000', true),
          ($7, $8, 'Item', 10000.01, 1000000, 4, 'Item approval over $10000', true);
        `, [
          uuidv4(), adminId,
          uuidv4(), adminId,
          uuidv4(), adminId,
          uuidv4(), adminId
        ]);
        
        console.log('Sample DoFA rules inserted');
      } else {
        console.log('No admin user found, skipping sample data');
      }
    } else {
      console.log('DoFAs table already exists');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('DoFA setup completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up DoFA table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the setup
setupDofaTable()
  .then(() => {
    console.log('DoFA setup script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('DoFA setup script failed:', error);
    process.exit(1);
  });
