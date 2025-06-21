/**
 * Enhanced test script for UNSPSC category graph functionality
 * 
 * This script tests:
 * 1. The backend API endpoint for UNSPSC categories
 * 2. The frontend service function
 * 3. The enhanced table rendering with advanced selection options
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // For colored console output

// Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINT = '/inventory/reports/unspsc-categories';
const TOKEN = process.env.ERP_TEST_TOKEN || 'your-test-token'; // Set in environment or replace

// Helper function for formatted console output
function logStep(step, message) {
  console.log(chalk.blue(`\n[Step ${step}] ${message}`));
}

function logSuccess(message) {
  console.log(chalk.green(`  ✅ ${message}`));
}

function logWarning(message) {
  console.log(chalk.yellow(`  ⚠️ ${message}`));
}

function logError(message) {
  console.log(chalk.red(`  ❌ ${message}`));
}

async function testUnspscCategoryEndpoint() {
  logStep(1, 'Testing UNSPSC Category API Endpoint');
  
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'x-auth-token': TOKEN
      }
    });
    
    console.log('  API Response Status:', response.status);
    console.log('  Data Sample:', JSON.stringify(response.data.data[0] || {}, null, 2));
    
    if (response.data && response.data.success) {
      logSuccess(`API endpoint returned success`);
      
      const categoryCount = response.data.data.length;
      logSuccess(`Found ${categoryCount} UNSPSC categories`);
      
      // Check data structure
      if (categoryCount > 0) {
        const firstCategory = response.data.data[0];
        const requiredFields = ['code', 'name', 'value', 'itemCount'];
        const missingFields = requiredFields.filter(field => !firstCategory.hasOwnProperty(field));
        
        if (missingFields.length === 0) {
          logSuccess('Data structure contains all required fields');
        } else {
          logWarning(`Missing fields in data structure: ${missingFields.join(', ')}`);
        }
        
        // Check for enhanced fields
        const enhancedFields = ['description', 'avgPerItem', 'sampleItems'];
        const presentEnhancedFields = enhancedFields.filter(field => firstCategory.hasOwnProperty(field));
        
        if (presentEnhancedFields.length > 0) {
          logSuccess(`Found enhanced fields: ${presentEnhancedFields.join(', ')}`);
        } else {
          logWarning('No enhanced fields found. Basic implementation only.');
        }
      }
      
      // Save sample data for verification
      const sampleData = response.data;
      fs.writeFileSync(
        path.join(__dirname, 'unspsc-categories-sample.json'), 
        JSON.stringify(sampleData, null, 2)
      );
      logSuccess('Saved sample data to unspsc-categories-sample.json');
    } else {
      logError('API endpoint returned failure');
    }
  } catch (error) {
    logError(`Error testing UNSPSC category endpoint: ${error.message}`);
    if (error.response) {
      console.error('  Response status:', error.response.status);
      console.error('  Response data:', error.response.data);
    }
  }
}

async function checkFrontendService() {
  logStep(2, 'Checking frontend service file for UNSPSC category function');
  
  const servicePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventoryService.js');
  
  try {
    const fileContent = fs.readFileSync(servicePath, 'utf8');
    
    if (fileContent.includes('getUnspscCategoryInventoryData')) {
      logSuccess('Found getUnspscCategoryInventoryData function in inventoryService.js');
    } else {
      logError('Could not find getUnspscCategoryInventoryData function');
    }
    
    if (fileContent.includes('/inventory/reports/unspsc-categories')) {
      logSuccess('Service is using the correct API endpoint');
    } else {
      logError('Service is not using the correct API endpoint');
    }
    
    // Check for enhanced error handling
    if (fileContent.includes('error handling') || fileContent.includes('try {') && fileContent.includes('catch (')) {
      logSuccess('Service includes error handling');
    } else {
      logWarning('Service might be missing robust error handling');
    }
  } catch (error) {
    logError(`Error checking frontend service file: ${error.message}`);
  }
}

async function checkEnhancedRendererFunction() {
  logStep(3, 'Checking enhanced UNSPSC category chart renderer');
  
  const componentPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Inventory', 'EnhancedInventoryReporting.jsx');
  
  try {
    const fileContent = fs.readFileSync(componentPath, 'utf8');
    
    if (fileContent.includes('renderUnspscCategoryChart')) {
      logSuccess('Found renderUnspscCategoryChart function');
    } else {
      logError('Could not find renderUnspscCategoryChart function');
    }
    
    // Check for enhanced features
    const enhancedFeatures = [
      { name: 'Table with selection', pattern: 'rowSelection' },
      { name: 'Search/filter capability', pattern: 'filterDropdown' },
      { name: 'Category count display', pattern: 'categories selected' },
      { name: 'Fixed left column', pattern: 'fixed: \'left\'' },
      { name: 'Select All button', pattern: 'Select All' },
      { name: 'Clear All button', pattern: 'Clear All' },
      { name: 'Color indicators', pattern: 'Chart Color' },
      { name: 'Custom CSS styles', pattern: 'unspscTableStyles' },
      { name: 'Responsive design', pattern: '@media' },
      { name: 'Table pagination', pattern: 'showSizeChanger' },
      { name: 'UNSPSC category grouping', pattern: 'groupedBySegment' },
      { name: 'Category statistics', pattern: 'totalItemCount' },
      { name: 'Table summary row', pattern: 'Table.Summary.Row' }
    ];
    
    let enhancedFeaturesFound = 0;
    enhancedFeatures.forEach(feature => {
      if (fileContent.includes(feature.pattern)) {
        logSuccess(`Found enhanced feature: ${feature.name}`);
        enhancedFeaturesFound++;
      } else {
        logWarning(`Could not find enhanced feature: ${feature.name}`);
      }
    });
    
    const percentComplete = Math.round((enhancedFeaturesFound / enhancedFeatures.length) * 100);
    console.log(`\n  Enhanced features implementation: ${percentComplete}% complete (${enhancedFeaturesFound}/${enhancedFeatures.length} features)`);
    
    // Check integration in trends tab
    if (fileContent.includes('<h3>{translate(\'Inventory by UNSPSC Category\')}</h3>')) {
      logSuccess('UNSPSC category chart is integrated in the trends tab');
    } else {
      logError('UNSPSC category chart might not be integrated in the trends tab');
    }
  } catch (error) {
    logError(`Error checking frontend component file: ${error.message}`);
  }
}

async function runTests() {
  console.log(chalk.cyan('\n==== Testing Enhanced UNSPSC Category Graph Functionality ====\n'));
  
  await testUnspscCategoryEndpoint();
  await checkFrontendService();
  await checkEnhancedRendererFunction();
  
  console.log(chalk.cyan('\n==== Test Complete ===='));
}

// Run the tests
runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
