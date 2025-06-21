const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and log output
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`);
    
    const proc = exec(command, {
      cwd: path.join(__dirname, 'frontend')
    });
    
    proc.stdout.on('data', (data) => {
      console.log(data.trim());
    });
    
    proc.stderr.on('data', (data) => {
      console.error(data.trim());
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${description} failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Function to check if frontend is running
async function checkFrontendStatus() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Frontend is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend is not running or not accessible');
    return false;
  }
  return false;
}

// Main function to rebuild frontend
async function rebuildFrontend() {
  try {
    console.log('==== REBUILDING FRONTEND ====');
    
    // Kill any existing frontend server
    try {
      await runCommand('taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq frontend"', 'Stopping frontend server');
    } catch (error) {
      console.log('No frontend server to stop or unable to stop it');
    }
    
    // Clean node_modules and rebuild
    await runCommand('npm cache clean --force', 'Cleaning npm cache');
    await runCommand('npm install', 'Installing dependencies');
    
    // Start frontend server
    await runCommand('npm run dev', 'Starting frontend server');
    
    console.log('✅ Frontend rebuild complete');
  } catch (error) {
    console.error('❌ Error rebuilding frontend:', error);
  }
}

// Create a simplified report file
const reportContent = `# Warehouse Page Fix Summary

## Issues Fixed

1. Fixed reference to undefined 'props' variable in SimpleCrudModule component
   - Changed \`props.originalEntity\` to \`originalEntity\` (already available from destructured props)

2. Added better handling of data and error states in SimpleTable component

3. Improved the warehouseService module to better handle API responses and route fallbacks

## Next Steps

1. Test the warehouse page at http://localhost:3000/warehouse 
2. Verify both storage locations and bin locations are loading correctly
3. Check the action buttons (View, Edit, Delete) work properly

## How to Test

1. Navigate to http://localhost:3000/warehouse
2. Check that storage locations appear in the table
3. Switch to the "Bins" tab and verify bin locations load
4. Try clicking on a storage location code to view details
5. Try the edit and delete actions
`;

fs.writeFileSync('WAREHOUSE-PAGE-FIX.md', reportContent);
console.log('✅ Created WAREHOUSE-PAGE-FIX.md with details about the fix');

// Run the rebuild process
rebuildFrontend();
