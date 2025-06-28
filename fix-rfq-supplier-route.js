const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'index.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the import path for RfqSupplier model
content = content.replace(
  "const { RfqSupplier } = require('./models/sequelize');",
  "const { RfqSupplier } = require('../models/sequelize');"
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RfqSupplier model import path');