// Backend API endpoint for retrieving item price history from past Purchase Requisitions
const { models, sequelize } = require('../../../models');
const { PurchaseRequisitionItem, PurchaseRequisition, User } = models;
const { QueryTypes } = require('sequelize');

// @desc    Get price history for an item across all PRs
// @route   GET /api/procurement/item-history/:itemId
// @access  Private
exports.getItemPriceHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find the current item to get its identifiers (itemNumber, itemMasterId)
    const currentItem = await PurchaseRequisitionItem.findByPk(itemId);
    
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Build query conditions based on available item identifiers
    const conditions = [];
    const queryParams = {};
    
    if (currentItem.itemNumber) {
      conditions.push(`pri."itemNumber" = :itemNumber`);
      queryParams.itemNumber = currentItem.itemNumber;
    }
    
    if (currentItem.itemMasterId) {
      conditions.push(`pri."itemMasterId" = :itemMasterId`);
      queryParams.itemMasterId = currentItem.itemMasterId;
    }
    
    // If we don't have specific identifiers, use the description for fuzzy matching
    if (conditions.length === 0 && currentItem.description) {
      conditions.push(`LOWER(pri."description") LIKE :description`);
      queryParams.description = `%${currentItem.description.toLowerCase()}%`;
    }
    
    // Exit if we have no way to identify similar items
    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot find price history: Item has no identifiable attributes'
      });
    }
    
    // Get price history from past PRs (exclude the current PR)
    const priceHistory = await sequelize.query(
      `SELECT 
        pri."id",
        pri."unitPrice", 
        pri."uom",
        pri."createdAt" as "date",
        pr."prNumber",
        pr."status",
        pr."currency"
      FROM 
        "PurchaseRequisitionItems" pri
      JOIN 
        "PurchaseRequisitions" pr ON pri."purchaseRequisitionId" = pr."id"
      WHERE 
        (${conditions.join(' OR ')})
        AND pri."purchaseRequisitionId" != :currentPrId
        AND pri."unitPrice" IS NOT NULL
        AND pri."unitPrice" > 0
      ORDER BY 
        pri."createdAt" DESC
      LIMIT 10`,
      {
        replacements: {
          ...queryParams,
          currentPrId: currentItem.purchaseRequisitionId
        },
        type: QueryTypes.SELECT
      }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        item: {
          id: currentItem.id,
          description: currentItem.description,
          itemNumber: currentItem.itemNumber,
          uom: currentItem.uom
        },
        priceHistory
      }
    });
  } catch (error) {
    console.error('Error getting item price history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get item price history',
      error: error.message
    });
  }
};
