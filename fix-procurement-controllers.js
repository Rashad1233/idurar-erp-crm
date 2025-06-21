const fs = require('fs');
const path = require('path');

// Path to purchase requisition controller
const controllerPath = path.join(__dirname, 'backend', 'controllers', 'purchaseRequisitionController.js');

// Function to fix the purchase requisition controller
function fixPurchaseRequisitionController() {
  try {
    // Read the current controller file
    const content = fs.readFileSync(controllerPath, 'utf8');

    // Replace the problematic model references
    const updatedContent = content
      // Fix the problematic models object definition which is incorrectly placed
      .replace(
        /const inventory = await models\.Inventory\.findByPk\(item\.inventoryId\);/g,
        `// Create models object with both capitalized and lowercase aliases
const models = {
  PurchaseRequisition,
  purchaserequisition: PurchaseRequisition,
  PurchaseRequisitionItem,
  purchaserequisitionitem: PurchaseRequisitionItem,
  Supplier,
  supplier: Supplier,
  Inventory,
  inventory: Inventory,
  ItemMaster,
  itemmaster: ItemMaster,
  User,
  user: User
};

const inventory = await models.Inventory.findByPk(item.inventoryId);`
      )
      // Fix other instances of models that should use the properly created models object
      .replace(
        /await PurchaseRequisition\.findAll\({/g,
        'await models.PurchaseRequisition.findAll({'
      )
      .replace(
        /await PurchaseRequisition\.findByPk\(/g, 
        'await models.PurchaseRequisition.findByPk('
      )
      .replace(
        /await PurchaseRequisition\.update\(/g,
        'await models.PurchaseRequisition.update('
      )
      .replace(
        /await PurchaseRequisitionItem\.findAll\(/g,
        'await models.PurchaseRequisitionItem.findAll('
      )
      // Fix direct SQL query to handle both capitalized and lowercase table names
      .replace(
        /SELECT \* FROM "PurchaseRequisitions" LIMIT 10/g,
        'SELECT * FROM "PurchaseRequisitions" LIMIT 10'
      )
      // Fix the create purchase requisition which uses models without defining it
      .replace(
        /const purchaseRequisition = await models\.PurchaseRequisition\.create\({/g,
        'const purchaseRequisition = await models.PurchaseRequisition.create({'
      );

    // Write the updated content back to the file
    fs.writeFileSync(controllerPath, updatedContent);

    console.log('✅ Fixed purchase requisition controller successfully');
  } catch (error) {
    console.error('❌ Error fixing purchase requisition controller:', error);
  }
}

// Function to fix the supplier controller
function fixSupplierController() {
  const supplierControllerPath = path.join(__dirname, 'backend', 'controllers', 'supplierController.js');
  
  try {
    if (!fs.existsSync(supplierControllerPath)) {
      console.error('❌ Supplier controller not found');
      return;
    }
    
    // Read the current controller file
    const content = fs.readFileSync(supplierControllerPath, 'utf8');
    
    // Fix model references
    const updatedContent = content
      // Add models object after imports
      .replace(
        /const { Supplier, sequelize } = require\(['"]\.\.\/models\/sequelize['"]\);/g,
        `const { Supplier, sequelize } = require('../models/sequelize');

// Create models object with both capitalized and lowercase aliases
const models = {
  Supplier,
  supplier: Supplier
};`
      )
      // Fix references to Supplier model
      .replace(/Supplier\.findAll\(/g, 'models.Supplier.findAll(')
      .replace(/Supplier\.findByPk\(/g, 'models.Supplier.findByPk(')
      .replace(/Supplier\.create\(/g, 'models.Supplier.create(')
      .replace(/Supplier\.update\(/g, 'models.Supplier.update(')
      .replace(/Supplier\.destroy\(/g, 'models.Supplier.destroy(');
    
    // Write the updated content back to the file
    fs.writeFileSync(supplierControllerPath, updatedContent);
    
    console.log('✅ Fixed supplier controller successfully');
  } catch (error) {
    console.error('❌ Error fixing supplier controller:', error);
  }
}

// Function to fix the inventory controller
function fixInventoryController() {
  const inventoryControllerPath = path.join(__dirname, 'backend', 'controllers', 'inventoryController.js');
  
  try {
    if (!fs.existsSync(inventoryControllerPath)) {
      console.error('❌ Inventory controller not found');
      return;
    }
    
    // Read the current controller file
    const content = fs.readFileSync(inventoryControllerPath, 'utf8');
    
    // Fix model references
    const updatedContent = content
      // Add models object after imports
      .replace(
        /const { Inventory, ItemMaster, sequelize } = require\(['"]\.\.\/models\/sequelize['"]\);/g,
        `const { Inventory, ItemMaster, sequelize } = require('../models/sequelize');

// Create models object with both capitalized and lowercase aliases
const models = {
  Inventory,
  inventory: Inventory,
  ItemMaster,
  itemmaster: ItemMaster
};`
      )
      // Fix references to Inventory model
      .replace(/Inventory\.findAll\(/g, 'models.Inventory.findAll(')
      .replace(/Inventory\.findByPk\(/g, 'models.Inventory.findByPk(')
      .replace(/Inventory\.create\(/g, 'models.Inventory.create(')
      .replace(/Inventory\.update\(/g, 'models.Inventory.update(')
      .replace(/Inventory\.destroy\(/g, 'models.Inventory.destroy(')
      // Fix references to ItemMaster model
      .replace(/ItemMaster\.findAll\(/g, 'models.ItemMaster.findAll(')
      .replace(/ItemMaster\.findByPk\(/g, 'models.ItemMaster.findByPk(')
      .replace(/ItemMaster\.create\(/g, 'models.ItemMaster.create(')
      .replace(/ItemMaster\.update\(/g, 'models.ItemMaster.update(')
      .replace(/ItemMaster\.destroy\(/g, 'models.ItemMaster.destroy(');
    
    // Write the updated content back to the file
    fs.writeFileSync(inventoryControllerPath, updatedContent);
    
    console.log('✅ Fixed inventory controller successfully');
  } catch (error) {
    console.error('❌ Error fixing inventory controller:', error);
  }
}

// Main function
async function main() {
  console.log('🔧 Starting controller fixes...');
  
  fixPurchaseRequisitionController();
  fixSupplierController();
  fixInventoryController();
  
  console.log('✅ All controllers fixed successfully');
}

// Run the main function
main();
