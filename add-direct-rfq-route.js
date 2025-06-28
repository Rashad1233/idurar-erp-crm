const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'index.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Add a direct route for rfqSupplierResponse before the server starts
const directRouteCode = `
// Direct RFQ supplier response route to fix 404 issue
app.get('/api/rfqSupplierResponse/list', async (req, res) => {
  try {
    const { RfqSupplier } = require('./models/sequelize');
    console.log('🔍 Direct RFQ supplier response fetch...');
    
    const { filter } = req.query;
    let whereClause = {};
    
    // Parse filter if provided
    if (filter && typeof filter === 'string') {
      try {
        const parsedFilter = JSON.parse(filter);
        if (parsedFilter.requestForQuotationId) {
          whereClause.requestForQuotationId = parsedFilter.requestForQuotationId;
        }
      } catch (e) {
        console.warn('Could not parse filter:', filter);
      }
    }
    
    const rfqSuppliers = await RfqSupplier.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(\`✅ Found \${rfqSuppliers.length} RFQ supplier responses\`);
    
    res.status(200).json({
      success: true,
      result: rfqSuppliers,
      pagination: {
        total: rfqSuppliers.length,
        page: 1,
        pages: 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching RFQ supplier responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQ supplier responses',
      error: error.message
    });
  }
});
console.log('✅ Direct RFQ supplier response route registered');

`;

// Add the route before the server starts
content = content.replace(
  '// Start server',
  directRouteCode + '// Start server'
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Added direct RFQ supplier response route');