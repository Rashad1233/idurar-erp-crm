GETconst db = require('../../../../../models/sequelize');
const sequelize = db.sequelize;

/**
 * List RFQs filtered by purchase requisition ID.
 */
async function listByPurchaseRequisition(req, res) {
  try {
    const prId = req.params.prId;
    if (!prId) {
      return res.status(400).json({ success: false, message: 'Purchase Requisition ID is required' });
    }

    const sql = `
      SELECT rfq.*
      FROM "RFQs" rfq
      WHERE rfq."purchaseRequisitionId" = :prId
      ORDER BY rfq."createdAt" DESC
    `;

    const rfqs = await sequelize.query(sql, {
      replacements: { prId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ success: true, result: rfqs });
  } catch (error) {
    console.error('Error listing RFQs by Purchase Requisition:', error);
    res.status(500).json({ success: false, message: 'Failed to list RFQs by Purchase Requisition', error: error.message });
  }
}

module.exports = listByPurchaseRequisition;
