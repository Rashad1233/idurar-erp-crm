const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'controllers', 'appControllers', 'procurementControllers', 'rfqController', 'create.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the RfqItem creation to not use itemNumber foreign key
content = content.replace(
  `const rfqItem = await RfqItem.create({
        requestForQuotationId: rfq.id,
        itemNumber: item.itemNumber || \`ITEM-\${Date.now()}\`,
        description: item.description || item.itemName,
        quantity: item.quantity,
        uom: item.uom || 'each',
        purchaseRequisitionItemId: item.prItemId || null
      });`,
  `const rfqItem = await RfqItem.create({
        requestForQuotationId: rfq.id,
        itemNumber: null, // Don't use auto-generated item numbers to avoid FK constraint
        description: item.description || item.itemName,
        quantity: item.quantity,
        uom: item.uom || 'each',
        purchaseRequisitionItemId: item.prItemId || null
      });`
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RFQ items creation - removed itemNumber foreign key constraint issue');