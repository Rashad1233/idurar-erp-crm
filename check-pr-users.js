// Database verification script for Purchase Requisitions
const { Pool } = require('pg');
require('dotenv').config();

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'erp_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkPurchaseRequisitions() {
  try {
    console.log('Checking Purchase Requisitions in database...');
    
    // Query to select all purchase requisitions with user info
    const query = `
      SELECT 
        pr.id, 
        pr."prNumber", 
        pr."approverId", 
        pr."currentApproverId", 
        pr."requestorId",
        approver.name AS approver_name,
        current_approver.name AS current_approver_name,
        requestor.name AS requestor_name
      FROM 
        public."PurchaseRequisitions" pr
      LEFT JOIN 
        public."Users" approver ON pr."approverId" = approver.id
      LEFT JOIN 
        public."Users" current_approver ON pr."currentApproverId" = current_approver.id
      LEFT JOIN 
        public."Users" requestor ON pr."requestorId" = requestor.id
      ORDER BY 
        pr."createdAt" DESC
      LIMIT 5;
    `;
    
    // Execute query
    const { rows } = await pool.query(query);
    
    console.log('Results:');
    console.table(rows);
    
    // More detailed logging
    rows.forEach(row => {
      console.log('\n--- PR Number:', row.prNumber, '---');
      console.log('Approver ID:', row.approverId);
      console.log('Approver Name:', row.approver_name || 'Not Found');
      console.log('Current Approver ID:', row.currentApproverId);
      console.log('Current Approver Name:', row.current_approver_name || 'Not Found');
      console.log('Requestor ID:', row.requestorId);
      console.log('Requestor Name:', row.requestor_name || 'Not Found');
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run the check
checkPurchaseRequisitions();
