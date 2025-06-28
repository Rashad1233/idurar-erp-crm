// Script to add sample contracts linking suppliers with items and their prices
const { sequelize, Supplier, ItemMaster, Contract, ContractItem } = require('./backend/models/sequelize');
const { v4: uuidv4 } = require('uuid');

// Function to create sample contracts
async function createSampleContracts() {
  try {
    console.log('Starting to create sample contracts...');
    
    // Get all suppliers
    const suppliers = await Supplier.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    if (suppliers.length === 0) {
      console.error('No suppliers found. Please run add-sample-suppliers.js first.');
      return;
    }
    
    // Get all items
    const items = await ItemMaster.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    
    if (items.length === 0) {
      console.error('No items found. Please run add-sample-items.js first.');
      return;
    }
    
    console.log(`Found ${suppliers.length} suppliers and ${items.length} items.`);
    
    // Create contracts for each supplier with some of the items
    for (const supplier of suppliers) {
      // Create 1-2 contracts per supplier
      const contractCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < contractCount; i++) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // One year contract
        
        const contract = await Contract.create({
          id: uuidv4(),
          contractNumber: `CT-${supplier.supplierNumber}-${String(i+1).padStart(3, '0')}`,
          contractName: `${supplier.legalName} Standard Supply Agreement ${i+1}`,
          description: `Supply agreement with ${supplier.legalName} for various products and services.`,
          supplierId: supplier.id,
          startDate,
          endDate,
          status: 'active',
          incoterms: ['DDP', 'FCA', 'CIP', 'EXW'][Math.floor(Math.random() * 4)],
          paymentTerms: ['30 days', '45 days', '60 days', 'prepayment'][Math.floor(Math.random() * 4)],
          currency: ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
          createdBy: '00000000-0000-0000-0000-000000000001', // System user
          updatedBy: '00000000-0000-0000-0000-000000000001'  // System user
        });
        
        console.log(`Created contract: ${contract.contractNumber} for ${supplier.legalName}`);
        
        // Assign 3-8 items to each contract with pricing
        const itemCount = Math.floor(Math.random() * 6) + 3;
        const contractItems = items.slice(0, itemCount).map(item => {
          // Generate a reasonable price based on item type
          let basePrice;
          if (item.itemType === 'inventory') {
            basePrice = Math.random() * 500 + 50; // $50-$550
          } else if (item.itemType === 'service') {
            basePrice = Math.random() * 200 + 100; // $100-$300
          } else {
            basePrice = Math.random() * 1000 + 200; // $200-$1200
          }
          
          // Add some variation between different suppliers (±20%)
          const priceVariation = 0.8 + (Math.random() * 0.4); // 0.8-1.2
          const finalPrice = basePrice * priceVariation;
          
          return {
            id: uuidv4(),
            contractId: contract.id,
            itemId: item.id,
            itemNumber: item.itemNumber,
            unitPrice: parseFloat(finalPrice.toFixed(2)),
            currency: contract.currency,
            minimumOrderQuantity: Math.floor(Math.random() * 5) + 1,
            leadTime: Math.floor(Math.random() * 14) + 1, // 1-14 days
            notes: `Contract pricing for ${item.name}`,
            createdBy: '00000000-0000-0000-0000-000000000001',
            updatedBy: '00000000-0000-0000-0000-000000000001'
          };
        });
        
        // Bulk create the contract items
        await ContractItem.bulkCreate(contractItems);
        console.log(`Added ${contractItems.length} items to contract ${contract.contractNumber}`);
      }
    }
    
    console.log('Successfully created sample contracts with items and pricing!');
    
  } catch (error) {
    console.error('Error creating sample contracts:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
createSampleContracts();
