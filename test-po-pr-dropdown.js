const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

async function testPurchaseRequisitionDropdown() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database:', dbConfig.database);
    
    // Test 1: Check if PurchaseRequisitions table exists
    console.log('\n📋 Checking PurchaseRequisitions table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PurchaseRequisitions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ PurchaseRequisitions table does not exist!');
      return;
    }
    console.log('✅ PurchaseRequisitions table exists');
    
    // Test 2: Get all Purchase Requisitions
    console.log('\n📊 Fetching all Purchase Requisitions...');
    const allPRs = await client.query(`
      SELECT id, "prNumber", description, status, "totalAmount", "dateRequired"
      FROM "PurchaseRequisitions"
      WHERE removed = false
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`Found ${allPRs.rows.length} Purchase Requisitions:`);
    allPRs.rows.forEach(pr => {
      console.log(`  - ${pr.prNumber}: ${pr.description} (Status: ${pr.status})`);
    });
    
    // Test 3: Get only approved Purchase Requisitions (for PO dropdown)
    console.log('\n✅ Fetching approved Purchase Requisitions for PO dropdown...');
    const approvedPRs = await client.query(`
      SELECT id, "prNumber", description, status, "totalAmount", "dateRequired"
      FROM "PurchaseRequisitions"
      WHERE removed = false AND status = 'approved'
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`Found ${approvedPRs.rows.length} approved Purchase Requisitions:`);
    if (approvedPRs.rows.length === 0) {
      console.log('  ⚠️  No approved PRs found. You need to approve some PRs first!');
    } else {
      approvedPRs.rows.forEach(pr => {
        console.log(`  - ${pr.prNumber}: ${pr.description}`);
      });
    }
    
    // Test 4: Create a sample approved PR if none exist
    if (approvedPRs.rows.length === 0) {
      console.log('\n🔧 Creating a sample approved Purchase Requisition...');
      
      // First, get the next PR number
      const counterResult = await client.query(`
        SELECT value FROM "Settings" WHERE key = 'pr_counter'
      `);
      
      let prNumber;
      if (counterResult.rows.length > 0) {
        const nextNumber = parseInt(counterResult.rows[0].value) + 1;
        prNumber = `PR-${String(nextNumber).padStart(6, '0')}`;
        
        await client.query(`
          UPDATE "Settings" SET value = $1 WHERE key = 'pr_counter'
        `, [nextNumber]);
      } else {
        prNumber = 'PR-000001';
        await client.query(`
          INSERT INTO "Settings" (key, value, "createdAt", "updatedAt")
          VALUES ('pr_counter', '1', NOW(), NOW())
        `);
      }
      
      // Create the PR
      const newPR = await client.query(`
        INSERT INTO "PurchaseRequisitions" (
          "prNumber", description, status, "totalAmount", 
          "requestedBy", department, "dateRequired", "dateSubmitted",
          removed, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        ) RETURNING *
      `, [
        prNumber,
        'Sample Purchase Requisition for Testing',
        'approved',
        5000.00,
        1, // Assuming admin user ID is 1
        'IT Department',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        new Date(),
        false
      ]);
      
      console.log(`✅ Created sample PR: ${newPR.rows[0].prNumber}`);
      
      // Add some items to the PR
      const prId = newPR.rows[0].id;
      await client.query(`
        INSERT INTO "PurchaseRequisitionItems" (
          "purchaseRequisitionId", "itemNumber", description, 
          uom, quantity, "unitPrice", "totalPrice", status,
          "createdAt", "updatedAt"
        ) VALUES 
        ($1, 'ITEM-001', 'Laptop Computer', 'each', 2, 1500.00, 3000.00, 'pending', NOW(), NOW()),
        ($1, 'ITEM-002', 'Office Chair', 'each', 5, 400.00, 2000.00, 'pending', NOW(), NOW())
      `, [prId]);
      
      console.log('✅ Added sample items to the PR');
    }
    
    // Test 5: Verify the API endpoint format
    console.log('\n🌐 API Endpoint Information:');
    console.log('The frontend will call: GET /api/purchase-requisition');
    console.log('Expected response format:');
    console.log(JSON.stringify({
      success: true,
      result: [
        {
          _id: 'id',
          id: 'id',
          prNumber: 'PR-000001',
          description: 'Description',
          status: 'approved',
          // ... other fields
        }
      ],
      pagination: {
        page: 1,
        pages: 1,
        count: 1
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n👋 Disconnected from database');
  }
}

// Run the test
console.log('🚀 Testing Purchase Order - Purchase Requisition Dropdown Configuration');
console.log('================================================================\n');
testPurchaseRequisitionDropdown();
