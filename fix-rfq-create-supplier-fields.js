const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'controllers', 'appControllers', 'procurementControllers', 'rfqController', 'create.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the supplier field mappings
content = content.replace(
  'contactEmail: supplier.email,',
  'contactEmail: supplier.contactEmail,'
);

content = content.replace(
  'contactEmailSecondary: supplier.emailSecondary,',
  'contactEmailSecondary: supplier.contactEmailSecondary,'
);

content = content.replace(
  'contactPhone: supplier.phone,',
  'contactPhone: supplier.contactPhone,'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed supplier field mappings in RFQ create controller');