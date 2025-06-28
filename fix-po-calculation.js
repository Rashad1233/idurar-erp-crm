const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'backend', 'routes', 'purchaseOrderRoutes.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of the problematic calculation
content = content.replace(
  /totalPrice: item\.quantity \* item\.unitPrice,/g,
  'totalPrice: (Number(item.quantity) || 0) * (Number(item.price || item.unitPrice) || 0),'
);

// Also fix the unitPrice and quantity fields
content = content.replace(
  /quantity: item\.quantity,/g,
  'quantity: Number(item.quantity) || 0,'
);

content = content.replace(
  /unitPrice: item\.unitPrice,/g,
  'unitPrice: Number(item.price || item.unitPrice) || 0,'
);

content = content.replace(
  /uom: item\.uom,/g,
  'uom: item.uom || item.unit,'
);

// Write the file back
fs.writeFileSync(filePath, content);
console.log('✅ Fixed PO calculation in purchaseOrderRoutes.js');