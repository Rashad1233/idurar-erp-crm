const { sequelize } = require('./backend/models/sequelize');
const { v4: uuidv4 } = require('uuid');

async function createItemMasterDirectSQL() {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const itemNumber = `FX-${Math.floor(100000 + Math.random() * 900000)}`;
    const unspscCode = '14160708';
    
    // Using direct SQL with camelCase column names as they appear in the database
    const query = `
      INSERT INTO "ItemMasters" (
        "id", "itemNumber", "shortDescription", "longDescription", 
        "manufacturerName", "manufacturerPartNumber", 
        "equipmentCategory", "equipmentSubCategory", 
        "unspscCode", "uom", "serialNumber", "criticality", 
        "stockItem", "plannedStock", "status", 
        "createdById", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING "id", "itemNumber";
    `;
    
    const values = [
      id,                             // id
      itemNumber,                     // itemNumber
      'Fixed Item Description',       // shortDescription
      'This is a test item created with direct SQL', // longDescription
      'Test Manufacturer',            // manufacturerName
      'MPN-12345',                    // manufacturerPartNumber
      'OTHER',                        // equipmentCategory
      'MISC',                         // equipmentSubCategory
      unspscCode,                     // unspscCode
      'EA',                           // uom
      'N',                            // serialNumber
      'NO',                           // criticality
      'Y',                            // stockItem
      'N',                            // plannedStock
      'DRAFT',                        // status
      '0b4afa3e-8582-452b-833c-f8bf695c4d60', // createdById (admin user)
      now,                            // createdAt
      now                             // updatedAt
    ];
    
    const result = await sequelize.query(query, { 
      replacements: values,
      type: sequelize.QueryTypes.INSERT 
    });
    
    console.log('Direct SQL Item Creation Result:', result);
    console.log(`✅ Item created successfully with ID: ${id} and item number: ${itemNumber}`);
    
  } catch (error) {
    console.error('❌ Error creating item with direct SQL:', error);
  } finally {
    await sequelize.close();
  }
}

createItemMasterDirectSQL();
