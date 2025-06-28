// Debug models import
console.log('🔍 Testing model imports...\n');

try {
  const models = require('./models/sequelize');
  
  console.log('📦 Available models:');
  Object.keys(models).forEach(key => {
    console.log(`  ✅ ${key}: ${typeof models[key]}`);
  });
  
  console.log('\n🔍 Specific model checks:');
  console.log('  PurchaseOrder:', !!models.PurchaseOrder, typeof models.PurchaseOrder);
  console.log('  PurchaseOrderItem:', !!models.PurchaseOrderItem, typeof models.PurchaseOrderItem);
  console.log('  RequestForQuotation:', !!models.RequestForQuotation, typeof models.RequestForQuotation);
  console.log('  RfqSupplier:', !!models.RfqSupplier, typeof models.RfqSupplier);
  console.log('  Supplier:', !!models.Supplier, typeof models.Supplier);
  console.log('  User:', !!models.User, typeof models.User);
  
  if (models.PurchaseOrder) {
    console.log('\n🔍 Testing PurchaseOrder methods:');
    console.log('  findAndCountAll:', typeof models.PurchaseOrder.findAndCountAll);
    console.log('  findByPk:', typeof models.PurchaseOrder.findByPk);
    console.log('  create:', typeof models.PurchaseOrder.create);
    console.log('  count:', typeof models.PurchaseOrder.count);
  }
  
} catch (error) {
  console.error('❌ Error importing models:', error.message);
  console.error('Stack:', error.stack);
}