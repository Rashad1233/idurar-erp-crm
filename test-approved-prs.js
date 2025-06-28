const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

async function testApprovedPRs() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database:', dbConfig.database);
    
    // Get all Purchase Requisitions
    console.log('\n📊 Fetching all Purchase Requisitions...');
    const allPRs = await client.query(`
      SELECT id, "prNumber", description, status, "totalAmount"
      FROM "PurchaseRequisitions"
      WHERE removed = false OR removed IS NULL
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`\nTotal PRs found: ${allPRs.rows.length}`);
    
    // Group by status
    const prsByStatus = {};
    allPRs.rows.forEach(pr => {
      const status = pr.status || 'unknown';
      if (!prsByStatus[status]) {
        prsByStatus[status] = [];
      }
      prsByStatus[status].push(pr);
    });
    
    console.log('\nPRs by Status:');
    console.log('==============');
    Object.keys(prsByStatus).forEach(status => {
      console.log(`${status}: ${prsByStatus[status].length} PRs`);
      prsByStatus[status].forEach(pr => {
        console.log(`  - ${pr.prNumber}: ${pr.description}`);
      });
    });
    
    // Check for approved PRs specifically
    const approvedPRs = prsByStatus['approved'] || [];
    
    if (approvedPRs.length === 0) {
      console.log('\n⚠️  No approved PRs found!');
      console.log('\n🔧 Creating a sample approved PR for testing...');
      
      // Create a sample approved PR
      const result = await client.query(`
        INSERT INTO "PurchaseRequisitions" (
          id,
          "prNumber",
          description,
          status,
          "totalAmount",
          currency,
          "costCenter",
          "requestorId",
          "approverId",
          "createdById",
          "updatedById",
          "submittedAt",
          "approvedAt",
          removed,
          "createdAt",
          "updatedAt",
          "created_at",
          "updated_at"
        ) VALUES (
          gen_random_uuid(),
          'PR-TEST-001',
          'Test Purchase Requisition for PO Dropdown',
          'approved',
          10000.00,
          'USD',
          'IT-001',
          (SELECT id FROM "Users" LIMIT 1),
          (SELECT id FROM "Users" LIMIT 1),
          (SELECT id FROM "Users" LIMIT 1),
          (SELECT id FROM "Users" LIMIT 1),
          NOW() - INTERVAL '2 days',
          NOW() - INTERVAL '1 day',
          false,
          NOW(),
          NOW(),
          NOW(),
          NOW()
        ) RETURNING *
      `);
      
      console.log('✅ Created sample approved PR:', result.rows[0].prNumber);
      
      // Add some items to the PR
      const prId = result.rows[0].id;
      await client.query(`
        INSERT INTO "PurchaseRequisitionItems" (
          id,
          "purchaseRequisitionId",
          "itemNumber",
          description,
          uom,
          quantity,
          "unitPrice",
          "totalPrice",
          status,
          "createdAt",
          "updatedAt"
        ) VALUES 
        (gen_random_uuid(), $1, 'ITEM-001', 'Laptop Computer', 'each', 5, 1200.00, 6000.00, 'pending', NOW(), NOW()),
        (gen_random_uuid(), $1, 'ITEM-002', 'Office Desk', 'each', 10, 400.00, 4000.00, 'pending', NOW(), NOW())
      `, [prId]);
      
      console.log('✅ Added sample items to the PR');
    } else {
      console.log(`\n✅ Found ${approvedPRs.length} approved PRs available for PO creation`);
    }
    
    // Show final status
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('The Purchase Order dropdown will show approved PRs.');
    console.log('Navigate to http://localhost:3000/purchase-order/create to test the dropdown.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n👋 Disconnected from database');
  }
}

// Run the test
console.log('🚀 Testing Approved Purchase Requisitions for PO Dropdown');
console.log('========================================================\n');
testApprovedPRs();
