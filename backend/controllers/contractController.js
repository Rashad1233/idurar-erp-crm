const { ItemMaster, Contract, ContractItem, Supplier, sequelize } = require('../models/sequelize');

// Get contracts for an item
exports.getItemContracts = async (req, res) => {
  console.log('📄 getItemContracts CALLED');
  try {
    const { itemId } = req.params;
    
    const contracts = await sequelize.query(`
      SELECT c.*, ci.*, s.name as "supplierName", s.email as "supplierEmail"
      FROM "ContractItems" ci
      LEFT JOIN "Contracts" c ON ci."contractId" = c.id
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      WHERE ci."itemNumber" = (
        SELECT "itemNumber" FROM "ItemMasters" WHERE id = $1
      )
      ORDER BY c."startDate" DESC
    `, {
      bind: [itemId]
    });
    
    console.log(`✅ Found ${contracts[0].length} contracts for item`);
    
    res.status(200).json({
      success: true,
      data: contracts[0],
      message: `${contracts[0].length} contracts found`
    });
    
  } catch (error) {
    console.error('❌ Error getting item contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};

// Add item to contract
exports.addItemToContract = async (req, res) => {
  console.log('📝 addItemToContract CALLED');
  try {
    const { itemId } = req.params;
    const { contractId, unitPrice, leadTime, minimumOrderQuantity, notes } = req.body;
    
    // Get item details
    const item = await ItemMaster.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    if (item.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved items can be added to contracts'
      });
    }
    
    // Check if item already exists in contract
    const existingContractItem = await sequelize.query(`
      SELECT id FROM "ContractItems" 
      WHERE "contractId" = $1 AND "itemNumber" = $2
    `, {
      bind: [contractId, item.itemNumber]
    });
    
    if (existingContractItem[0].length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Item already exists in this contract'
      });
    }
    
    // Add item to contract
    const contractItem = await sequelize.query(`
      INSERT INTO "ContractItems" 
      ("contractId", "itemNumber", "description", "uom", "unitPrice", "leadTime", "minimumOrderQuantity", "notes", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, {
      bind: [
        contractId,
        item.itemNumber,
        item.shortDescription,
        item.uom,
        unitPrice,
        leadTime || null,
        minimumOrderQuantity || null,
        notes || null
      ]
    });
    
    console.log(`✅ Item ${item.itemNumber} added to contract ${contractId}`);
    
    res.status(201).json({
      success: true,
      data: contractItem[0][0],
      message: 'Item added to contract successfully'
    });
    
  } catch (error) {
    console.error('❌ Error adding item to contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to contract',
      error: error.message
    });
  }
};

// Get all contracts with suppliers
exports.getActiveContracts = async (req, res) => {
  console.log('📋 getActiveContracts CALLED');
  try {
    const contracts = await sequelize.query(`
      SELECT c.*, s.name as "supplierName", s.email as "supplierEmail",
             COUNT(ci.id) as "itemCount"
      FROM "Contracts" c
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      LEFT JOIN "ContractItems" ci ON c.id = ci."contractId"
      WHERE c.status = 'active' AND c."endDate" > NOW()
      GROUP BY c.id, s.id, s.name, s.email
      ORDER BY c."startDate" DESC
    `);
    
    console.log(`✅ Found ${contracts[0].length} active contracts`);
    
    res.status(200).json({
      success: true,
      data: contracts[0],
      message: `${contracts[0].length} active contracts found`
    });
    
  } catch (error) {
    console.error('❌ Error getting active contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};

// Remove item from contract
exports.removeItemFromContract = async (req, res) => {
  console.log('🗑️ removeItemFromContract CALLED');
  try {
    const { contractItemId } = req.params;
    
    const result = await sequelize.query(`
      DELETE FROM "ContractItems" WHERE id = $1
      RETURNING "itemNumber", "contractId"
    `, {
      bind: [contractItemId]
    });
    
    if (result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contract item not found'
      });
    }
    
    console.log(`✅ Item removed from contract successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from contract successfully'
    });
    
  } catch (error) {
    console.error('❌ Error removing item from contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from contract',
      error: error.message
    });
  }
};
