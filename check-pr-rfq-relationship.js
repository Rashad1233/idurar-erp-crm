// Script to check PR and RFQ relationship
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'root'
});

async function checkPRRFQRelationship() {
  try {
    console.log('=== Checking PR and RFQ Relationship ===\n');
    
    // 1. Check RFQ table structure
    console.log('1. RFQ Table Structure:');
    const rfqColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rfqs'
      ORDER BY ordinal_position
    `);
    
    console.log('RFQ columns:');
    rfqColumns.rows.forEach(col => {
      if (col.column_name.toLowerCase().includes('pr') || 
          col.column_name.toLowerCase().includes('requisition')) {
        console.log(`  - ${col.column_name}: ${col.data_type} *** PR RELATED ***`);
      } else {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      }
    });
    
    // 2. Check sample RFQs with PR references
    console.log('\n2. Sample RFQs with PR references:');
    const rfqs = await pool.query(`
      SELECT id, "rfqNumber", status, "purchaseRequisitionId", description
      FROM rfqs
      LIMIT 5
    `);
    
    console.log('RFQs:');
    rfqs.rows.forEach(rfq => {
      console.log(`  - RFQ ${rfq.rfqNumber}: PR ID = ${rfq.purchaseRequisitionId}, Status = ${rfq.status}`);
    });
    
    // 3. Check if there's a direct relationship
    console.log('\n3. Checking RFQs grouped by PR:');
    const rfqsByPR = await pool.query(`
      SELECT 
        "purchaseRequisitionId",
        COUNT(*) as rfq_count,
        STRING_AGG("rfqNumber", ', ') as rfq_numbers,
        STRING_AGG(status, ', ') as statuses
      FROM rfqs
      WHERE "purchaseRequisitionId" IS NOT NULL
      GROUP BY "purchaseRequisitionId"
      LIMIT 10
    `);
    
    console.log('RFQs by PR:');
    rfqsByPR.rows.forEach(row => {
      console.log(`  - PR ${row.purchaseRequisitionId}: ${row.rfq_count} RFQs (${row.rfq_numbers}) - Statuses: ${row.statuses}`);
    });
    
    // 4. Check PR table for any RFQ references
    console.log('\n4. PR Table Structure (checking for RFQ references):');
    const prColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'purchaserequisitions'
      AND (column_name ILIKE '%rfq%' OR column_name ILIKE '%request%')
      ORDER BY ordinal_position
    `);
    
    if (prColumns.rows.length > 0) {
      console.log('PR columns with RFQ references:');
      prColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('No RFQ-related columns found in PR table');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPRRFQRelationship();
