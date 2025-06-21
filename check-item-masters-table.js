const { sequelize } = require('./backend/models/sequelize');

async function checkItemMastersTable() {
  try {
    console.log('Checking ItemMasters table structure...');
    
    // Get table structure
    const [tableInfo] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ItemMasters'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable Structure:');
    console.table(tableInfo);
    
    // Check if unspsc column exists
    const unspscColumn = tableInfo.find(col => col.column_name === 'unspsc');
    if (unspscColumn) {
      console.log('\n✅ unspsc column exists with data type:', unspscColumn.data_type);
    } else {
      console.log('\n❌ unspsc column does not exist in the table!');
    }
      // Check actual data in the table
    console.log('\nChecking ItemMasters data...');
    const [items] = await sequelize.query(`
      SELECT id, "itemNumber", "shortDescription", "unspscCode", "unspscCodeId"
      FROM "ItemMasters"
      LIMIT 10
    `);
    
    console.log('\nSample Items:');
    console.table(items);
      // Check if any items have UNSPSC codes
    const itemsWithUnspscCode = items.filter(item => item.unspscCode);
    const itemsWithUnspscCodeId = items.filter(item => item.unspscCodeId);
    console.log(`\n${itemsWithUnspscCode.length} out of ${items.length} items have unspscCode.`);
    console.log(`\n${itemsWithUnspscCodeId.length} out of ${items.length} items have unspscCodeId.`);
    
    // Check for UNSPSC codes table
    try {
      const [unspscCodes] = await sequelize.query(`
        SELECT code, title, description
        FROM "UnspscCodes"
        LIMIT 5
      `);
      
      console.log('\nSample UNSPSC Codes:');
      console.table(unspscCodes);
    } catch (error) {
      console.log('\n❌ Error checking UnspscCodes table:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkItemMastersTable();
