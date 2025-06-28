const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'RFQ', 'RFQRead.jsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the supplier data mapping in the useEffect
content = content.replace(
  `// Set suppliers with formatting
          setRFQSuppliers(rfqData.suppliers?.map(s => ({
            ...s,
            id: s._id || s.id,
            key: s._id || s.id,
            supplierName: s.supplier?.name,
            supplierEmail: s.supplier?.email,
            supplierPhone: s.supplier?.phone
          })) || []);`,
  `// Set suppliers with formatting
          setRFQSuppliers(rfqData.suppliers?.map(s => ({
            ...s,
            id: s.id,
            key: s.id,
            name: s.supplierName || s.name,
            contact: s.contactName || s.contact,
            email: s.contactEmail || s.email,
            phone: s.contactPhone || s.phone,
            supplierName: s.supplierName,
            supplierEmail: s.contactEmail,
            supplierPhone: s.contactPhone
          })) || []);`
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RFQ supplier data mapping');