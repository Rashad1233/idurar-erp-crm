const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'RFQ', 'RFQCreate.jsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic line
content = content.replace(
  'const response = await request.create({ entity: \'rfq\', jsonData: rfqData });',
  `// Use direct API call to create RFQ (POST to /api/rfq)
      const response = await fetch('http://localhost:8888/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(rfqData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success(translate('RFQ created successfully'));
        navigate('/rfq');
        return;
      } else {
        setError(data.message || 'Failed to create RFQ');
        return;
      }`
);

// Also need to update the data format to match backend expectations
content = content.replace(
  'prId: selectedPRId || prId,',
  'purchaseRequisitionId: selectedPRId || prId,'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RFQ submission endpoint');