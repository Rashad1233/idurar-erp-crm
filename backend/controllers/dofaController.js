const { DoFA, User, sequelize } = require('../models/sequelize/index');
const { Op } = require('sequelize');

// Get all DoFA records
exports.getAllDoFAs = async (req, res) => {
  try {
    const dofas = await DoFA.findAll({
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [
        ['approvalType', 'ASC'],
        ['thresholdMin', 'ASC'],
        ['approvalOrder', 'ASC']
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'DoFA records retrieved successfully',
      data: dofas
    });
  } catch (error) {
    console.error('Error retrieving DoFA records:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving DoFA records',
      error: error.message
    });
  }
};

// Get DoFA records by type (PR, PO, Item, Invoice)
exports.getDoFAsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['PR', 'PO', 'Item', 'Invoice'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval type'
      });
    }
    
    const dofas = await DoFA.findAll({
      where: {
        approvalType: type,
        isActive: true,
        [Op.or]: [
          { effectiveTo: null },
          { effectiveTo: { [Op.gt]: new Date() } }
        ],
        effectiveFrom: { [Op.lte]: new Date() }
      },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [
        ['thresholdMin', 'ASC'],
        ['approvalOrder', 'ASC']
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: `DoFA records for ${type} retrieved successfully`,
      data: dofas
    });
  } catch (error) {
    console.error(`Error retrieving DoFA records for ${req.params.type}:`, error);
    return res.status(500).json({
      success: false,
      message: `Error retrieving DoFA records for ${req.params.type}`,
      error: error.message
    });
  }
};

// Create a new DoFA record
exports.createDoFA = async (req, res) => {
  try {
    const {
      userId, costCenterId, itemCategoryId, approvalType,
      thresholdMin, thresholdMax, approvalOrder, description,
      effectiveFrom, effectiveTo
    } = req.body;
    
    // Basic validation
    if (!userId || !approvalType || thresholdMax === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (thresholdMin >= thresholdMax) {
      return res.status(400).json({
        success: false,
        message: 'Threshold minimum must be less than threshold maximum'
      });
    }
    
    // Create DoFA record
    const dofa = await DoFA.create({
      userId,
      costCenterId: costCenterId || null,
      itemCategoryId: itemCategoryId || null,
      approvalType,
      thresholdMin: thresholdMin || 0,
      thresholdMax,
      approvalOrder: approvalOrder || 1,
      description: description || null,
      effectiveFrom: effectiveFrom || new Date(),
      effectiveTo: effectiveTo || null
    });
    
    // Get the complete DoFA record with related data
    const completeDoFA = await DoFA.findByPk(dofa.id, {
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'DoFA record created successfully',
      data: completeDoFA
    });
  } catch (error) {
    console.error('Error creating DoFA record:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating DoFA record',
      error: error.message
    });
  }
};

// Update a DoFA record
exports.updateDoFA = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the DoFA record
    const dofa = await DoFA.findByPk(id);
    
    if (!dofa) {
      return res.status(404).json({
        success: false,
        message: 'DoFA record not found'
      });
    }
    
    // Update validation
    if (updateData.thresholdMin !== undefined && updateData.thresholdMax !== undefined) {
      if (updateData.thresholdMin >= updateData.thresholdMax) {
        return res.status(400).json({
          success: false,
          message: 'Threshold minimum must be less than threshold maximum'
        });
      }
    } else if (updateData.thresholdMin !== undefined) {
      if (updateData.thresholdMin >= dofa.thresholdMax) {
        return res.status(400).json({
          success: false,
          message: 'Threshold minimum must be less than threshold maximum'
        });
      }
    } else if (updateData.thresholdMax !== undefined) {
      if (dofa.thresholdMin >= updateData.thresholdMax) {
        return res.status(400).json({
          success: false,
          message: 'Threshold minimum must be less than threshold maximum'
        });
      }
    }
    
    // Update the DoFA record
    await dofa.update(updateData);
    
    // Get the updated DoFA record with related data
    const updatedDoFA = await DoFA.findByPk(id, {
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'DoFA record updated successfully',
      data: updatedDoFA
    });
  } catch (error) {
    console.error('Error updating DoFA record:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating DoFA record',
      error: error.message
    });
  }
};

// Delete a DoFA record
exports.deleteDoFA = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the DoFA record
    const dofa = await DoFA.findByPk(id);
    
    if (!dofa) {
      return res.status(404).json({
        success: false,
        message: 'DoFA record not found'
      });
    }
    
    // Delete (soft delete) the DoFA record
    await dofa.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'DoFA record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting DoFA record:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting DoFA record',
      error: error.message
    });
  }
};

// Get next approvers in chain based on amount and type
exports.getNextApprovers = async (req, res) => {
  try {
    const { type, amount, costCenterId, itemCategoryId } = req.query;
    
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Type and amount are required parameters'
      });
    }
    
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid number'
      });
    }
    
    // Query conditions
    let whereConditions = {
      approvalType: type,
      isActive: true,
      thresholdMin: { [Op.lte]: parsedAmount },
      thresholdMax: { [Op.gte]: parsedAmount },
      [Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [Op.gt]: new Date() } }
      ],
      effectiveFrom: { [Op.lte]: new Date() }
    };
    
    // Add optional filters if provided
    if (costCenterId) {
      whereConditions = {
        ...whereConditions,
        [Op.or]: [
          { costCenterId },
          { costCenterId: null }
        ]
      };
    }
    
    if (itemCategoryId) {
      whereConditions = {
        ...whereConditions,
        [Op.or]: [
          { itemCategoryId },
          { itemCategoryId: null }
        ]
      };
    }
    
    const approvers = await DoFA.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [
        ['approvalOrder', 'ASC']
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Next approvers retrieved successfully',
      data: approvers
    });
  } catch (error) {
    console.error('Error retrieving next approvers:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving next approvers',
      error: error.message
    });
  }
};

// Function to determine next approvers (for internal use)
exports.determineNextApprovers = async (type, amount, costCenterId = null, itemCategoryId = null, currentApprover = null) => {
  try {
    // Query conditions
    let whereConditions = {
      approvalType: type,
      isActive: true,
      thresholdMin: { [Op.lte]: amount },
      thresholdMax: { [Op.gte]: amount },
      [Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [Op.gt]: new Date() } }
      ],
      effectiveFrom: { [Op.lte]: new Date() }
    };
    
    // Add optional filters if provided
    const orConditions = [];
    if (costCenterId) {
      orConditions.push(
        { costCenterId },
        { costCenterId: null }
      );
    }
    
    if (itemCategoryId) {
      orConditions.push(
        { itemCategoryId },
        { itemCategoryId: null }
      );
    }
    
    if (orConditions.length > 0) {
      whereConditions = {
        ...whereConditions,
        [Op.or]: orConditions
      };
    }
    
    const approvers = await DoFA.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [
        ['approvalOrder', 'ASC']
      ]
    });
    
    // If currentApprover is provided, filter to only include next approvers in the chain
    if (currentApprover) {
      const currentApproverIndex = approvers.findIndex(a => a.userId === currentApprover);
      if (currentApproverIndex !== -1) {
        return approvers.slice(currentApproverIndex + 1);
      }
    }
    
    return approvers;
  } catch (error) {
    console.error('Error determining next approvers:', error);
    throw error;
  }
};
