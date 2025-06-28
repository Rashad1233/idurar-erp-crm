const db = require('../../../../../models/sequelize');
const { Op } = require('sequelize');

const sequelize = db.sequelize;

/**
 * Simple list controller for Purchase Requisitions dropdown
 * Returns only approved PRs with basic information
 */
async function listForDropdown(req, res) {
  try {
    console.log('🔍 [LIST-DROPDOWN] Purchase Requisition list for dropdown called');

    // Simple query without complex includes
    const sql = `
      SELECT 
        pr.id,
        pr."prNumber",
        pr.description,
        pr.status,
        pr."totalAmount",
        pr."dateRequired",
        pr."createdAt"
      FROM "PurchaseRequisitions" pr
      WHERE pr.removed = false
      ORDER BY pr."createdAt" DESC
    `;

    const results = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Format results for frontend compatibility
    const formattedResults = results.map(pr => ({
      _id: pr.id,
      id: pr.id,
      prNumber: pr.prNumber,
      description: pr.description,
      status: pr.status,
      totalAmount: pr.totalAmount,
      dateRequired: pr.dateRequired,
      createdAt: pr.createdAt
    }));

    console.log('✅ [LIST-DROPDOWN] Returning PR list, count:', formattedResults.length);

    res.status(200).json({
      success: true,
      result: formattedResults,
      data: formattedResults, // Some frontend code expects 'data' instead of 'result'
      pagination: {
        page: 1,
        pages: 1,
        count: formattedResults.length
      }
    });
  } catch (error) {
    console.error('❌ [LIST-DROPDOWN] Error listing purchase requisitions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchase Requisitions',
      error: error.message
    });
  }
}

module.exports = listForDropdown;
