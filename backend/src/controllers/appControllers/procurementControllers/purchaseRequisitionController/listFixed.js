const db = require('../../../../../models/sequelize');
const { Op } = require('sequelize');

const sequelize = db.sequelize;

/**
 * Controller to list all purchase requisitions with pagination.
 * Returns purchase requisitions with associated items.
 */
async function list(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    console.log('🔍 [LIST] Purchase Requisition list called with params:', { page, limit, status });

    // Build where clause - no removed column in this table
    let whereClause = 'WHERE 1=1';
    let replacements = { 
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };

    if (status) {
      whereClause += ' AND pr.status = :status';
      replacements.status = status;
    }

    // Get total count
    const countSql = `
      SELECT COUNT(DISTINCT pr.id) as total
      FROM "PurchaseRequisitions" pr
      ${whereClause}
    `;
    
    const countResult = await sequelize.query(countSql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0].total, 10);

    // Get purchase requisitions with items
    const sql = `
      SELECT 
        pr.*,
        pri.id as item_id,
        pri."itemNumber",
        pri.description as item_description,
        pri.uom,
        pri.quantity,
        pri.unitPrice,
        pri.totalPrice,
        pri.status as item_status
      FROM "PurchaseRequisitions" pr
      LEFT JOIN "PurchaseRequisitionItems" pri ON pri."purchaseRequisitionId" = pr.id
      ${whereClause}
      ORDER BY pr."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `;

    const results = await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Group items by PR
    const prMap = {};
    results.forEach(row => {
      const prId = row.id;
      if (!prMap[prId]) {
        prMap[prId] = {
          _id: row.id, // Add _id for frontend compatibility
          id: row.id,
          prNumber: row.prNumber,
          description: row.description,
          status: row.status,
          totalAmount: row.totalAmount,
          requestedBy: row.requestorId,
          requestorId: row.requestorId,
          approverId: row.approverId,
          department: row.costCenter,
          costCenter: row.costCenter,
          dateRequired: row.submittedAt,
          dateSubmitted: row.submittedAt,
          currentApproval: row.currentApproverId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          items: []
        };
      }
      
      if (row.item_id) {
        prMap[prId].items.push({
          id: row.item_id,
          itemNumber: row.itemNumber,
          description: row.item_description,
          uom: row.uom,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          totalPrice: row.totalPrice,
          status: row.item_status
        });
      }
    });

    const result = Object.values(prMap);

    console.log('🔍 [LIST] Returning PR list, count:', result.length, 'total:', total);

    res.status(200).json({
      success: true,
      result,
      pagination: {
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('❌ [LIST] Error listing purchase requisitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list Purchase Requisitions',
      error: error.message
    });
  }
}

module.exports = list;
