// Reorder Request Controller
const { Inventory, ItemMaster, ReorderRequest, ReorderRequestItem, User, UnspscCode } = require('../models/sequelize');
// Create models object with both capitalized and lowercase aliases
const models = {
  Inventory,
  inventory: Inventory,
  ItemMaster,
  itemmaster: ItemMaster,
  ReorderRequest,
  reorderrequest: ReorderRequest,
  ReorderRequestItem,
  reorderrequestitem: ReorderRequestItem,
  User,
  user: User,
  UnspscCode,
  unspsccode: UnspscCode
};
const { generateRandomId } = require('../utils/idGenerator');
const { sequelize } = require('../config/db');
const { Model } = require('sequelize');

// @desc    Scan inventory for items below minimum stock level
// @route   POST /api/inventory/reorder-request/scan
// @access  Private
exports.scanReorderItems = async (req, res) => {
  try {
    const { warehouseId } = req.body;
    
    if (!warehouseId) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse ID is required'
      });
    }
    
    // Find all inventory items in the specified warehouse that need reordering
    const inventoryItems = await models.Inventory.findAll({
      where: {
        warehouse: warehouseId,
        physicalBalance: { [sequelize.Op.lt]: sequelize.col('minimumLevel') } // Physical balance less than minimum level
      },
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['itemNumber', 'shortDescription', 'unspscCodeId', 'manufacturerName', 'manufacturerPartNumber']
        }
      ]
    });
    
    if (inventoryItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No items need reordering in this warehouse',
        data: []
      });
    }
    
    // Create reorder items array
    const reorderItems = inventoryItems.map(item => {
      const reorderQty = item.maximumLevel - item.physicalBalance;
      
      return {
        inventory: item.id,
        currentQuantity: item.physicalBalance,
        minimumLevel: item.minimumLevel,
        maximumLevel: item.maximumLevel,
        reorderQuantity: reorderQty > 0 ? reorderQty : 0
      };
    });
    
    // Generate a request number
    const requestNumber = await generateRequestNumber();
    
    // Create reorder request (we don't save it yet, just prepare the data)
    const reorderRequestData = {
      requestNumber,
      warehouseId,
      items: reorderItems.filter(item => item.reorderQuantity > 0),
      status: 'DRAFT',
      createdBy: req.user.id
    };
    
    return res.status(200).json({
      success: true,
      message: 'Reorder items identified',
      data: {
        reorderRequestData,
        inventoryItems: inventoryItems.map((item, index) => {
          return {
            id: item.id,
            itemNumber: item.itemMaster?.itemNumber || 'N/A',
            description: item.itemMaster?.shortDescription || 'N/A',
            physicalBalance: item.physicalBalance,
            minimumLevel: item.minimumLevel,
            maximumLevel: item.maximumLevel,
            reorderQty: reorderItems[index].reorderQuantity,
            adjustedQty: reorderItems[index].reorderQuantity,
            uom: item.uom,
            contractNumber: '' // This would be filled in from a contracts table
          };
        })
      }
    });
  } catch (error) {
    console.error('Error creating reorder request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reorder request',
      error: error.message
    });
  }
};

// @desc    Submit reorder request
// @route   POST /api/inventory/reorder-request/submit
// @access  Private
exports.submitReorderRequest = async (req, res) => {
  try {
    const { requestData, adjustedItems } = req.body;
    
    if (!requestData || !adjustedItems || !Array.isArray(adjustedItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
    
    // Create the reorder request
    const reorderRequest = await ReorderRequest.create({
      requestNumber: requestData.requestNumber,
      warehouseId: requestData.warehouseId,
      status: 'PENDING_APPROVAL',
      createdBy: req.user.id,
      notes: requestData.notes || ''
    });
    
    // Create reorder items
    const reorderItems = adjustedItems.map(item => {
      return {
        reorderRequestId: reorderRequest.id,
        inventoryId: item.id,
        currentQuantity: item.physicalBalance,
        minimumLevel: item.minimumLevel,
        maximumLevel: item.maximumLevel,
        reorderQuantity: item.adjustedQty
      };
    });
    
    // Bulk create items
    await ReorderRequestItem.bulkCreate(reorderItems);
    
    return res.status(200).json({
      success: true,
      message: 'Reorder request submitted successfully',
      data: {
        requestNumber: reorderRequest.requestNumber,
        id: reorderRequest.id
      }
    });
  } catch (error) {
    console.error('Error submitting reorder request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit reorder request',
      error: error.message
    });
  }
};

// @desc    Approve reorder request and create PR
// @route   PUT /api/inventory/reorder-request/:id/approve
// @access  Private (Inventory Authority with DOFA)
exports.approveReorderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the reorder request
    const reorderRequest = await ReorderRequest.findByPk(id, {
      include: [
        {
          model: ReorderRequestItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster'
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found'
      });
    }
    
    if (reorderRequest.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request in ${reorderRequest.status} status`
      });
    }
    
    // Generate PR number
    const prNumber = await generatePRNumber();
    
    // Update reorder request
    await reorderRequest.update({
      status: 'APPROVED',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      purchaseRequisition: prNumber
    });
    
    // In a real system, here we would:
    // 1. Create a purchase requisition
    // 2. Check items for existing contracts
    // 3. Route non-contract items to buyers
    // 4. Create automatic POs for contract items
    
    return res.status(200).json({
      success: true,
      message: 'Reorder request approved and PR created',
      data: {
        requestNumber: reorderRequest.requestNumber,
        prNumber
      }
    });
  } catch (error) {
    console.error('Error approving reorder request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve reorder request',
      error: error.message
    });
  }
};

// @desc    Cancel reorder request
// @route   PUT /api/inventory/reorder-request/:id/cancel
// @access  Private
exports.cancelReorderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the reorder request
    const reorderRequest = await ReorderRequest.findByPk(id);
    
    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found'
      });
    }
    
    if (reorderRequest.status === 'APPROVED' || reorderRequest.status === 'CONVERTED_TO_PR') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request in ${reorderRequest.status} status`
      });
    }
    
    // Update reorder request status to CANCELLED
    await reorderRequest.update({
      status: 'CANCELLED'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Reorder request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling reorder request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel reorder request',
      error: error.message
    });
  }
};

// Helper function to generate request number
async function generateRequestNumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  const prefix = 'IRC';
  const datePart = `${year}${month}${day}`;
  
  // Find the highest request number for today
  const latestRequest = await ReorderRequest.findOne({
    where: {
      requestNumber: {
        $like: `${prefix}${datePart}%`
      }
    },
    order: [['requestNumber', 'DESC']]
  });
  
  let sequence = 1;
  if (latestRequest) {
    const sequencePart = latestRequest.requestNumber.slice(-3);
    sequence = parseInt(sequencePart, 10) + 1;
  }
  
  return `${prefix}${datePart}${sequence.toString().padStart(3, '0')}`;
}

// Helper function to generate PR number
async function generatePRNumber() {
  // In a real system, we would check the database for existing PR numbers
  const prefix = 'PR';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNum}`;
}
