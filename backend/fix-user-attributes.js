// Fix firstName/lastName references in warehouseController.js
const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'warehouseController.js');
const content = fs.readFileSync(controllerPath, 'utf8');

// Replace all occurrences of the firstName/lastName attributes with name
const updatedContent = content.replace(
  /attributes: \['id', 'firstName', 'lastName', 'email'\]/g, 
  "attributes: ['id', 'name', 'email']"
);

// Write back to the file
fs.writeFileSync(controllerPath, updatedContent, 'utf8');

console.log('Updated all firstName/lastName references in warehouseController.js');
