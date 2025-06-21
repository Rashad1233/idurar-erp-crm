const WarehouseDebugger = require('./utils/warehouseDebugger');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runDiagnostic() {
  console.log('🔍 Warehouse Management System Debugger');
  console.log('========================================\n');

  const debugger = new WarehouseDebugger();

  // Ask for optional parameters
  console.log('Optional parameters (press Enter to skip):');
  
  const token = await new Promise(resolve => {
    rl.question('Enter JWT token (or press Enter to skip): ', resolve);
  });

  const storageLocationId = await new Promise(resolve => {
    rl.question('Enter storage location ID to filter by (or press Enter to skip): ', resolve);
  });

  console.log('\n🚀 Running diagnostic...\n');

  try {
    const results = await debugger.runFullDiagnostic(
      token || null, 
      storageLocationId || null
    );
    
    const report = debugger.generateReport(results);
    console.log(report);

    // Save report to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `warehouse-diagnostic-${timestamp}.txt`;
    fs.writeFileSync(filename, report);
    console.log(`\n📄 Report saved to: ${filename}`);

    // Provide recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (results.results.summary.failed === 0) {
      console.log('✅ All tests passed! The warehouse system appears to be working correctly.');
      console.log('   If you\'re still experiencing issues, they might be:');
      console.log('   - Frontend-related (check browser console)');
      console.log('   - Network connectivity issues');
      console.log('   - Authentication token expiry');
    } else {
      console.log('❌ Issues found. Please address the following:');
      results.results.summary.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      // Specific recommendations based on common issues
      if (!results.results.databaseConnection) {
        console.log('\n🔧 Database Connection Fix:');
        console.log('   - Check if PostgreSQL is running');
        console.log('   - Verify database credentials in config/postgresql.js');
        console.log('   - Ensure database exists and is accessible');
      }
      
      if (!results.results.modelDefinitions) {
        console.log('\n🔧 Model Definitions Fix:');
        console.log('   - Check models/sequelize/index.js');
        console.log('   - Verify all model files exist and are properly exported');
        console.log('   - Run database migrations if needed');
      }
      
      if (!results.results.modelAssociations) {
        console.log('\n🔧 Model Associations Fix:');
        console.log('   - Check models/sequelize/associations.js');
        console.log('   - Verify foreign key relationships');
        console.log('   - Ensure association aliases match controller code');
      }
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    console.error('Stack trace:', error.stack);
  }

  rl.close();
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Warehouse Debugger Usage:');
  console.log('node debug-warehouse.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --token TOKEN  Provide JWT token for authentication testing');
  console.log('  --storage-id ID  Provide storage location ID for filtering');
  console.log('');
  console.log('Examples:');
  console.log('  node debug-warehouse.js');
  console.log('  node debug-warehouse.js --token "eyJhbGciOiJIUzI1NiIs..."');
  console.log('  node debug-warehouse.js --storage-id "uuid-here"');
  process.exit(0);
}

// Run the diagnostic
runDiagnostic().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
