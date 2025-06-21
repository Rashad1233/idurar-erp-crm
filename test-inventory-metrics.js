// test-inventory-metrics.js
// A script to test the inventory metrics calculation

// Mock data that should NOT be low stock
const testData = [
  {
    itemNumber: 'ITEM001',
    description: 'Test Item 1',
    currentStock: 10.00,
    minLevel: 5.00,
    maxLevel: 20.00
  },
  {
    itemNumber: 'ITEM002',
    description: 'Test Item 2',
    currentStock: 15.00,
    minLevel: 10.00,
    maxLevel: 30.00
  }
];

// Properly calculate stock status
function calculateStockStatus(items) {
  return items.map(item => {
    const currentStock = Number(item.currentStock);
    const minLevel = Number(item.minLevel);
    const maxLevel = Number(item.maxLevel);
    
    console.log(`Testing item ${item.itemNumber}: currentStock=${currentStock} (${typeof currentStock}), minLevel=${minLevel} (${typeof minLevel})`);
    
    let stockStatus = 'normal';
    if (currentStock < minLevel) {
      console.log(`  Item ${item.itemNumber} is LOW STOCK: ${currentStock} < ${minLevel}`);
      stockStatus = 'low';
    } else if (currentStock >= maxLevel) {
      console.log(`  Item ${item.itemNumber} is OVERSTOCK: ${currentStock} >= ${maxLevel}`);
      stockStatus = 'over';
    } else {
      console.log(`  Item ${item.itemNumber} has NORMAL stock: ${minLevel} <= ${currentStock} < ${maxLevel}`);
    }
    
    return {
      ...item,
      stockStatus
    };
  });
}

// Calculate metrics
function calculateMetrics(items) {
  const itemsWithStatus = calculateStockStatus(items);
  
  const lowStockCount = itemsWithStatus.filter(item => item.stockStatus === 'low').length;
  const overStockCount = itemsWithStatus.filter(item => item.stockStatus === 'over').length;
  const totalItems = items.length;
  
  console.log('==== Inventory Status Test Results ====');
  console.log(`Total items: ${totalItems}`);
  console.log(`Low stock items: ${lowStockCount}`);
  console.log(`Overstock items: ${overStockCount}`);
  console.log('Items with status:');
  console.table(itemsWithStatus.map(item => ({
    itemNumber: item.itemNumber,
    currentStock: item.currentStock,
    minLevel: item.minLevel,
    stockStatus: item.stockStatus
  })));
  
  return {
    lowStockCount,
    overStockCount,
    totalItems,
    itemsWithStatus
  };
}

// Run the test
const results = calculateMetrics(testData);

// Validate test results
if (results.lowStockCount === 0) {
  console.log('✅ TEST PASSED: No items are incorrectly flagged as low stock');
} else {
  console.log('❌ TEST FAILED: Some items are incorrectly flagged as low stock');
}

// Export the test functions for use elsewhere
module.exports = {
  calculateStockStatus,
  calculateMetrics
};
