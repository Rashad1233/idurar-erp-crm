const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'controllers', 'appControllers', 'procurementControllers', 'rfqController', 'create.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the createdById line to include updatedById
content = content.replace(
  "createdById: req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60' // Default admin for now",
  "createdById: req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60', // Default admin for now\n      updatedById: req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60' // Required field"
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RFQ create controller - added updatedById field');