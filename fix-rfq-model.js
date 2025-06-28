const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'models', 'sequelize', 'RfqItem.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Comment out the problematic ItemMaster association
content = content.replace(
  "RfqItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' });",
  "// RfqItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' }); // Commented out to avoid FK constraint issues"
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RfqItem model - removed ItemMaster association to avoid FK constraint');