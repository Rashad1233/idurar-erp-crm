const { RfqSupplier, Supplier } = require('./backend/models/sequelize');

async function fixExistingRFQSuppliers() {
  try {
    console.log('🔍 Fixing existing RFQ supplier data...');
    
    // Get all RFQ suppliers that have a supplierId but missing contact info
    const rfqSuppliers = await RfqSupplier.findAll({
      where: {
        supplierId: { [require('sequelize').Op.ne]: null }
      }
    });
    
    console.log(`📋 Found ${rfqSuppliers.length} RFQ suppliers to update`);
    
    for (const rfqSupplier of rfqSuppliers) {
      try {
        // Get the original supplier data
        const originalSupplier = await Supplier.findByPk(rfqSupplier.supplierId);
        
        if (originalSupplier) {
          // Update the RFQ supplier with correct contact info
          await rfqSupplier.update({
            contactEmail: originalSupplier.contactEmail,
            contactEmailSecondary: originalSupplier.contactEmailSecondary,
            contactPhone: originalSupplier.contactPhone,
            contactName: originalSupplier.contactName
          });
          
          console.log(`✅ Updated RFQ supplier: ${rfqSupplier.supplierName}`);
          console.log(`   Email: ${originalSupplier.contactEmail}`);
          console.log(`   Phone: ${originalSupplier.contactPhone}`);
        }
      } catch (updateError) {
        console.error(`❌ Error updating RFQ supplier ${rfqSupplier.id}:`, updateError.message);
      }
    }
    
    console.log('✅ Finished updating RFQ suppliers');
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedSuppliers = await RfqSupplier.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    updatedSuppliers.forEach(supplier => {
      console.log(`📄 ${supplier.supplierName}:`);
      console.log(`   Email: ${supplier.contactEmail || 'No email'}`);
      console.log(`   Phone: ${supplier.contactPhone || 'No phone'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing RFQ suppliers:', error);
  } finally {
    process.exit(0);
  }
}

fixExistingRFQSuppliers();