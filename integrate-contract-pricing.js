// Integration script to update procurement routes with contract pricing
const fs = require('fs');
const path = require('path');

// Path to the procurement routes file
const procurementRoutesPath = path.join(__dirname, 'backend', 'routes', 'procurementRoutes.js');

// Read the file
let content = fs.readFileSync(procurementRoutesPath, 'utf8');

// Check if contract-prices routes are already integrated
if (!content.includes('contract-prices')) {
  // Update the imports section
  let updatedContent = content.replace(
    '// Import individual procurement route files',
    '// Import individual procurement route files\n' +
    'const contractPriceRoutes = require(\'./contractPriceRoutes\');'
  );
  
  // Update the routes mounting section
  updatedContent = updatedContent.replace(
    '// Mount procurement routes',
    '// Mount procurement routes\n' +
    'router.use(\'/contract-prices\', contractPriceRoutes);'
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(procurementRoutesPath, updatedContent, 'utf8');
  
  console.log('Successfully integrated contract-prices routes into procurement routes!');
} else {
  console.log('Contract-prices routes are already integrated.');
}

// Check if we need to create a relationship in the models
const sequelizeModelsPath = path.join(__dirname, 'backend', 'models', 'sequelize', 'index.js');

if (fs.existsSync(sequelizeModelsPath)) {
  let modelsContent = fs.readFileSync(sequelizeModelsPath, 'utf8');
  
  // Check if relationships between Contract, ContractItem, and ItemMaster are already defined
  if (!modelsContent.includes('Contract.hasMany(ContractItem')) {
    // Find the section where associations are defined
    const associationsSection = modelsContent.indexOf('// Define associations');
    
    if (associationsSection !== -1) {
      const insertIndex = modelsContent.indexOf('\n', associationsSection) + 1;
      
      // Define the relationships to add
      const relationships = `
// Contract relationships
Contract.hasMany(ContractItem, { foreignKey: 'contractId', as: 'items' });
ContractItem.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });

// Contract Item relationships with ItemMaster
ContractItem.belongsTo(ItemMaster, { foreignKey: 'itemId', as: 'item' });
ItemMaster.hasMany(ContractItem, { foreignKey: 'itemId', as: 'contractItems' });

// Contract relationship with Supplier
Contract.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Contract, { foreignKey: 'supplierId', as: 'contracts' });

// Add contract relationship to PurchaseRequisitionItem
PurchaseRequisitionItem.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });
PurchaseRequisitionItem.belongsTo(ContractItem, { foreignKey: 'contractItemId', as: 'contractItem' });
`;
      
      // Insert the relationships
      const updatedModelsContent = 
        modelsContent.slice(0, insertIndex) + 
        relationships + 
        modelsContent.slice(insertIndex);
      
      // Write the updated content back to the file
      fs.writeFileSync(sequelizeModelsPath, updatedModelsContent, 'utf8');
      
      console.log('Successfully added contract relationships to sequelize models!');
    } else {
      console.log('Could not find associations section in sequelize models file.');
    }
  } else {
    console.log('Contract relationships are already defined in sequelize models.');
  }
} else {
  console.log('Sequelize models index file not found.');
}

console.log('Integration completed!');
