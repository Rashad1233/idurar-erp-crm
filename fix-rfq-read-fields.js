const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'RFQ', 'RFQRead.jsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the field mappings to match backend response
content = content.replace(
  '{rfq.date ? moment(rfq.date).format(\'YYYY-MM-DD\') : \'-\'}',
  '{rfq.dueDate ? moment(rfq.dueDate).format(\'YYYY-MM-DD\') : (rfq.createdAt ? moment(rfq.createdAt).format(\'YYYY-MM-DD\') : \'-\')}'
);

content = content.replace(
  '{rfq.expirationDate ? moment(rfq.expirationDate).format(\'YYYY-MM-DD\') : \'-\'}',
  '{rfq.responseDeadline ? moment(rfq.responseDeadline).format(\'YYYY-MM-DD\') : (rfq.dueDate ? moment(rfq.dueDate).format(\'YYYY-MM-DD\') : \'-\')}'
);

content = content.replace(
  '{rfq.requestedBy || \'-\'}',
  '{rfq.createdBy?.name || rfq.createdBy?.email || \'-\'}'
);

content = content.replace(
  '{rfq.department || \'-\'}',
  '{rfq.purchaseRequisition?.costCenter || \'-\'}'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RFQ field mappings in frontend');