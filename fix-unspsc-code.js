// fix-unspsc-code.js
// This script will update the simpleItemMasterRoutes.js file to properly format the UNSPSC code

const fs = require('fs');
const path = require('path');

async function fixUnspscCode() {
  try {
    console.log('🔧 Fixing UNSPSC code display issue');
    
    // Path to the route file
    const filePath = path.join(__dirname, 'backend', 'routes', 'simpleItemMasterRoutes.js');
    console.log(`Working with file: ${filePath}`);
    
    // Read the current file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    console.log('✅ File read successfully');
    
    // Create updated content with proper UNSPSC data handling
    const updatedContent = `const express = require('express');
const router = express.Router();

// Direct item master route with UNSPSC data included
router.get('/item-master', async (req, res) => {
  try {
    console.log('🔍 Simple direct item-master route called');
    const { sequelize } = require('../models/sequelize');
    
    // Get item master data with expanded UNSPSC information
    const [items] = await sequelize.query(\`
      SELECT 
        im.*,
        u.name as "createdByName",
        u.email as "createdByEmail",
        uc.code as "unspscFullCode",
        uc.title as "unspscTitle",
        uc.description as "unspscDescription"
      FROM 
        "ItemMasters" im
      LEFT JOIN 
        "Users" u ON im."createdById" = u.id
      LEFT JOIN 
        "UnspscCodes" uc ON im."unspscCode" = uc.code
      ORDER BY 
        im."createdAt" DESC
    \`);
    
    console.log(\`✅ Retrieved \${items.length} item masters via direct SQL\`);
    
    // Process the data to ensure consistent format
    const processedItems = items.map(item => {
      // Create formatted UNSPSC object
      const unspsc = (item.unspscCode || item.unspscFullCode) ? {
        code: item.unspscCode || item.unspscFullCode || 'Unknown',
        title: item.unspscTitle || item.equipmentCategory || 'No title',
        description: item.unspscDescription || ''
      } : null;
      
      // Return the item with added fields
      return {
        ...item,
        unspsc
      };
    });
    
    return res.status(200).json({
      success: true,
      data: processedItems,
      count: processedItems.length
    });
  } catch (error) {
    console.error('❌ Error loading item master data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item master data',
      error: error.message
    });
  }
});

// Direct item master detail route
router.get('/item-master/:id', async (req, res) => {
  try {
    console.log(\`🔍 Simple direct item-master detail route called for ID: \${req.params.id}\`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get item master data with expanded UNSPSC information
    const [items] = await sequelize.query(\`
      SELECT 
        im.*,
        u.name as "createdByName",
        u.email as "createdByEmail",
        uc.code as "unspscFullCode",
        uc.title as "unspscTitle",
        uc.description as "unspscDescription"
      FROM 
        "ItemMasters" im
      LEFT JOIN 
        "Users" u ON im."createdById" = u.id
      LEFT JOIN 
        "UnspscCodes" uc ON im."unspscCode" = uc.code
      WHERE 
        im.id = :id
    \`, {
      replacements: { id }
    });
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found'
      });
    }
    
    // Process the data to ensure consistent format
    const item = items[0];
    
    // Create formatted UNSPSC object
    const unspsc = (item.unspscCode || item.unspscFullCode) ? {
      code: item.unspscCode || item.unspscFullCode || 'Unknown',
      title: item.unspscTitle || 'No title',
      description: item.unspscDescription || 'No description'
    } : null;
    
    // Return the item with added fields
    const processedItem = {
      ...item,
      unspsc
    };
    
    return res.status(200).json({
      success: true,
      data: processedItem
    });
  } catch (error) {
    console.error('❌ Error loading item master:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item master',
      error: error.message
    });
  }
});

module.exports = router;`;
    
    // Write the updated content to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('✅ File updated successfully');
    
    // Create a script to restart the server
    const restartScriptPath = path.join(__dirname, 'restart-backend-after-unspsc-fix.ps1');
    const restartScriptContent = `
# Restart backend after UNSPSC fix
Write-Host "🔄 Stopping existing backend process..."
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        $_ | Stop-Process -Force
        Write-Host "Stopped process with ID: $($_.Id)"
    }
}

Write-Host "⌛ Waiting for processes to fully terminate..."
Start-Sleep -Seconds 2

Write-Host "🚀 Starting backend server..."
cd "$PSScriptRoot/backend"
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow

Write-Host "✅ Backend server restarted"
Write-Host "🌐 You can now access the application at http://localhost:3000"
`;
    fs.writeFileSync(restartScriptPath, restartScriptContent, 'utf8');
    console.log(`✅ Restart script created at: ${restartScriptPath}`);
    
    console.log(`
🎉 Fix completed! To apply the changes:
1. Run the restart script with: ./restart-backend-after-unspsc-fix.ps1
2. Refresh the item master page in your browser
`);
    
  } catch (error) {
    console.error('❌ Error fixing UNSPSC code:', error);
  }
}

fixUnspscCode();
