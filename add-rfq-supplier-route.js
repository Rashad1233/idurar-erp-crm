const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'index.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Add the RFQ supplier response route after the RFQ routes
content = content.replace(
  "console.log('✅ RFQ routes registered directly');",
  `console.log('✅ RFQ routes registered directly');

// Register RFQ supplier response routes
const rfqSupplierResponseController = require('./controllers/appControllers/procurementControllers/rfqSupplierResponseController');
app.use('/api/rfqSupplierResponse', rfqSupplierResponseController);
console.log('✅ RFQ supplier response routes registered');`
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Added RFQ supplier response routes to server');