const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

/**
 * Simple list controller for Purchase Requisitions
 * Uses direct SQL queries to avoid Sequelize association issues
 */
async function listSimple(req, res) {
  const client = new Client(dbConfig);
  
  try {
    const { page = 1, limit = 10, status, removed = false } = req.query;
    const offset = (page - 1) * limit;

    console.log('🔍 [LIST SIMPLE] Purchase Requisition list called with params:', { page, limit, status, removed });

    // Connect to database
    await client.connect();

    // Build where clause
    let whereConditions = ['pr.removed = $1'];
    let queryParams = [removed === 'true' || removed === true];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`pr.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM "PurchaseRequisitions" pr
      WHERE ${whereClause}
    `;
    
    const countResult = await client.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10);

    // Add limit and offset to params
    queryParams.push(parseInt(limit, 10));
    queryParams.push(parseInt(offset, 10));

    // Get purchase requisitions
    const query = `
      SELECT 
        pr.id,
        pr."prNumber",
        pr.description,
        pr.status,
        pr."totalAmount",
        pr."requestedBy",
        pr.department,
        pr."dateRequired",
        pr."dateSubmitted",
        pr."currentApproval",
        pr.removed,
        pr."createdAt",
        pr."updatedAt"
      FROM "PurchaseRequisitions" pr
      WHERE ${whereClause}
      ORDER BY pr."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await client.query(query, queryParams);

    // Format the response for frontend compatibility
    const purchaseRequisitions = result.rows.map(pr => ({
      _id: pr.id, // Add _id for frontend compatibility
      id: pr.id,
      prNumber: pr.prNumber,
      description: pr.description,
      status: pr.status,
      totalAmount: pr.totalAmount,
      requestedBy: pr.requestedBy,
      department: pr.department,
      dateRequired: pr.dateRequired,
      dateSubmitted: pr.dateSubmitted,
      currentApproval: pr.currentApproval,
      removed: pr.removed,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      items: [] // Empty array for now, can be loaded separately if needed
    }));

    console.log('🔍 [LIST SIMPLE] Returning PR list, count:', purchaseRequisitions.length, 'total:', total);

    res.status(200).json({
      success: true,
      result: purchaseRequisitions,
      data: purchaseRequisitions, // Also include as 'data' for compatibility
      pagination: {
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('❌ [LIST SIMPLE] Error listing purchase requisitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list Purchase Requisitions',
      error: error.message
    });
  } finally {
    // Always close the database connection
    await client.end();
  }
}

module.exports = listSimple;
