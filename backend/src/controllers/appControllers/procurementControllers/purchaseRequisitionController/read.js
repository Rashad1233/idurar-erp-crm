const db = require('../../../../../models/sequelize');
const { Op } = require('sequelize');

const sequelize = db.sequelize;

console.log('RAW SQL PR CONTROLLER ACTIVE');

/**
 * Controller to read purchase requisitions with optional filters and pagination.
 * Returns purchase requisitions with associated items and user info.
 */
async function readPurchaseRequisitions(req, res) {
  try {
    // Accept id from either route param or query param
    const id = req.params.id || req.query.id;
    const { status, limit = 20, offset = 0 } = req.query;
    console.log('🔍 [TEST] readPurchaseRequisition controller called! id:', id, 'query:', req.query, 'params:', req.params);

    // Build where clause based on query params
    let whereClause = '';
    let replacements = {};
    if (id) {
      whereClause += 'WHERE pr.id = :id ';
      replacements.id = id;
    } else if (status) {
      whereClause += 'WHERE pr.status = :status ';
      replacements.status = status;
    }

    // Raw SQL query for PurchaseRequisitions with items
    const sql = `
      SELECT pr.*, pri.id as item_id, pri."itemNumber", pri.description as item_description, pri.uom, pri.quantity, pri.unitPrice, pri.totalPrice, pri.status as item_status
      FROM "PurchaseRequisitions" pr
      LEFT JOIN "PurchaseRequisitionItems" pri ON pri."purchaseRequisitionId" = pr.id
      ${whereClause}
      ORDER BY pr."createdAt" DESC
      LIMIT :limit OFFSET :offset
    `;
    const results = await sequelize.query(sql, {
      replacements: { ...replacements, limit: parseInt(limit, 10), offset: parseInt(offset, 10) },
      type: sequelize.QueryTypes.SELECT,
    });
    console.log('🔍 SQL results:', results);
    console.log('🔍 [TEST] SQL results length:', results.length, 'First row:', results[0]);

    // Group items by PR
    const prMap = {};
    results.forEach(row => {
      const prId = row.id;
      if (!prMap[prId]) {
        prMap[prId] = {
          ...row,
          items: [],
        };
        // Remove item fields from PR root
        delete prMap[prId].item_id;
        delete prMap[prId].itemNumber;
        delete prMap[prId].item_description;
        delete prMap[prId].uom;
        delete prMap[prId].quantity;
        delete prMap[prId].unitPrice;
        delete prMap[prId].totalPrice;
        delete prMap[prId].item_status;
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
          status: row.item_status,
        });
      }
    });

    let responseData;
    if (id) {
      // Return a single PR object
      responseData = Object.values(prMap)[0] || null;
      console.log('🔍 [TEST] Returning single PR:', responseData);
    } else {
      // Return an array of PRs
      responseData = Object.values(prMap);
      console.log('🔍 [TEST] Returning PR array, count:', responseData.length);
    }

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('❌ [TEST] Error reading purchase requisitions:', error, error?.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch Purchase Requisition', error: error.message, stack: error.stack });
  }
}

module.exports = {
  readPurchaseRequisitions,
};
