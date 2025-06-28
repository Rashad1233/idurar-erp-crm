// Controller for contract price functionality
const { 
  Contract, 
  ContractItem, 
  Supplier, 
  ItemMaster,
  sequelize
} = require('../models/sequelize');
const { Op } = require('sequelize');

// @desc    Get contract prices for an item across all suppliers
// @route   GET /api/procurement/contract-prices/item/:itemId/prices
// @access  Private
exports.getItemContractPrices = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // First check if the item exists
    const item = await ItemMaster.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Get all active contract prices for this item
    const contractPrices = await ContractItem.findAll({
      where: {
        itemId
      },
      include: [
        {
          model: Contract,
          as: 'contract',
          where: {
            status: 'active',
            endDate: {
              [Op.gte]: new Date()
            }
          },
          include: [
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['id', 'supplierNumber', 'legalName', 'tradeName']
            }
          ]
        }
      ],
      order: [
        ['unitPrice', 'ASC']
      ]
    });
    
    // Format the response
    const formattedPrices = contractPrices.map(cp => ({
      contractItemId: cp.id,
      contractId: cp.contractId,
      contractNumber: cp.contract.contractNumber,
      contractName: cp.contract.contractName,
      supplier: {
        id: cp.contract.supplier.id,
        supplierNumber: cp.contract.supplier.supplierNumber,
        name: cp.contract.supplier.legalName || cp.contract.supplier.tradeName
      },
      unitPrice: cp.unitPrice,
      currency: cp.currency || cp.contract.currency,
      minimumOrderQuantity: cp.minimumOrderQuantity,
      leadTime: cp.leadTime,
      startDate: cp.contract.startDate,
      endDate: cp.contract.endDate
    }));
    
    return res.status(200).json({
      success: true,
      count: formattedPrices.length,
      data: formattedPrices
    });
    
  } catch (error) {
    console.error('Error getting item contract prices:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching contract prices',
      error: error.message
    });
  }
};

// @desc    Get contract prices for all items from a specific supplier
// @route   GET /api/procurement/contract-prices/supplier/:supplierId/prices
// @access  Private
exports.getSupplierContractPrices = async (req, res) => {
  try {
    const { supplierId } = req.params;
    
    // Check if the supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Get all active contracts for this supplier
    const contracts = await Contract.findAll({
      where: {
        supplierId,
        status: 'active',
        endDate: {
          [Op.gte]: new Date()
        }
      }
    });
    
    if (contracts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active contracts found for this supplier',
        data: []
      });
    }
    
    // Get all contract items from these contracts
    const contractItems = await ContractItem.findAll({
      where: {
        contractId: {
          [Op.in]: contracts.map(c => c.id)
        }
      },
      include: [
        {
          model: ItemMaster,
          as: 'item',
          attributes: ['id', 'itemNumber', 'name', 'description', 'uom']
        }
      ]
    });
    
    // Group items by contract
    const result = contracts.map(contract => {
      const items = contractItems
        .filter(ci => ci.contractId === contract.id)
        .map(ci => ({
          contractItemId: ci.id,
          itemId: ci.itemId,
          itemNumber: ci.item ? ci.item.itemNumber : ci.itemNumber,
          itemName: ci.item ? ci.item.name : 'Unknown Item',
          unitPrice: ci.unitPrice,
          currency: ci.currency || contract.currency,
          minimumOrderQuantity: ci.minimumOrderQuantity,
          leadTime: ci.leadTime
        }));
      
      return {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        contractName: contract.contractName,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        currency: contract.currency,
        itemCount: items.length,
        items
      };
    });
    
    return res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
    
  } catch (error) {
    console.error('Error getting supplier contract prices:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching supplier contract prices',
      error: error.message
    });
  }
};

// @desc    Get all active contracts for a supplier
// @route   GET /api/procurement/contract-prices/supplier/:supplierId/contracts
// @access  Private
exports.getActiveContractsForSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    
    // Check if the supplier exists
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Get all active contracts
    const contracts = await Contract.findAll({
      where: {
        supplierId,
        status: 'active',
        endDate: {
          [Op.gte]: new Date()
        }
      },
      order: [
        ['startDate', 'DESC']
      ]
    });
    
    // For each contract, get a count of items
    const contractsWithCounts = await Promise.all(contracts.map(async (contract) => {
      const itemCount = await ContractItem.count({
        where: {
          contractId: contract.id
        }
      });
      
      return {
        id: contract.id,
        contractNumber: contract.contractNumber,
        contractName: contract.contractName,
        startDate: contract.startDate,
        endDate: contract.endDate,
        status: contract.status,
        currency: contract.currency,
        itemCount
      };
    }));
    
    return res.status(200).json({
      success: true,
      count: contractsWithCounts.length,
      data: contractsWithCounts
    });
    
  } catch (error) {
    console.error('Error getting supplier contracts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching supplier contracts',
      error: error.message
    });
  }
};

// @desc    Get contract details including items
// @route   GET /api/procurement/contract-prices/contract/:contractId
// @access  Private
exports.getContractDetails = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Get contract with related data
    const contract = await Contract.findByPk(contractId, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplierNumber', 'legalName', 'tradeName', 'contactEmail', 'contactPhone']
        }
      ]
    });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Get contract items
    const contractItems = await ContractItem.findAll({
      where: {
        contractId
      },
      include: [
        {
          model: ItemMaster,
          as: 'item',
          attributes: ['id', 'itemNumber', 'name', 'description', 'uom', 'itemType', 'category']
        }
      ]
    });
    
    // Format items
    const items = contractItems.map(ci => ({
      id: ci.id,
      itemId: ci.itemId,
      itemNumber: ci.item ? ci.item.itemNumber : ci.itemNumber,
      name: ci.item ? ci.item.name : 'Unknown Item',
      description: ci.item ? ci.item.description : '',
      uom: ci.item ? ci.item.uom : '',
      itemType: ci.item ? ci.item.itemType : '',
      category: ci.item ? ci.item.category : '',
      unitPrice: ci.unitPrice,
      currency: ci.currency || contract.currency,
      minimumOrderQuantity: ci.minimumOrderQuantity,
      leadTime: ci.leadTime,
      notes: ci.notes
    }));
    
    // Format response
    const response = {
      id: contract.id,
      contractNumber: contract.contractNumber,
      contractName: contract.contractName,
      description: contract.description,
      supplier: {
        id: contract.supplier.id,
        supplierNumber: contract.supplier.supplierNumber,
        name: contract.supplier.legalName || contract.supplier.tradeName,
        email: contract.supplier.contactEmail,
        phone: contract.supplier.contactPhone
      },
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      incoterms: contract.incoterms,
      paymentTerms: contract.paymentTerms,
      currency: contract.currency,
      itemCount: items.length,
      items
    };
    
    return res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error getting contract details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching contract details',
      error: error.message
    });
  }
};
