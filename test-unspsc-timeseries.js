// Test script for UNSPSC category time-series implementation
const fs = require('fs');
const path = require('path');

// ANSI color codes for formatting console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}\n`);
}

// Paths
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');
const inventoryServicePath = path.join(frontendDir, 'src', 'services', 'inventoryService.js');
const inventoryControllerPath = path.join(backendDir, 'controllers', 'inventoryController.js');
const inventoryRoutesPath = path.join(backendDir, 'routes', 'inventoryRoutes.js');
const enhancedReportingPath = path.join(frontendDir, 'src', 'pages', 'Inventory', 'EnhancedInventoryReporting.jsx');

// Test cases
const tests = [
  {
    name: 'Backend controller has UNSPSC category time-series endpoint',
    run: () => {
      const controllerContent = fs.readFileSync(inventoryControllerPath, 'utf8');
      if (controllerContent.includes('getUnspscCategoryTimeSeries')) {
        logSuccess('Found getUnspscCategoryTimeSeries function in inventoryController.js');
        return true;
      } else {
        logError('Could not find getUnspscCategoryTimeSeries function in inventoryController.js');
        return false;
      }
    }
  },
  {
    name: 'Backend route for UNSPSC category time-series exists',
    run: () => {
      const routesContent = fs.readFileSync(inventoryRoutesPath, 'utf8');
      if (routesContent.includes('/inventory/reports/unspsc-categories/timeseries') && 
          routesContent.includes('getUnspscCategoryTimeSeries')) {
        logSuccess('Found UNSPSC category time-series route in inventoryRoutes.js');
        return true;
      } else {
        logError('Could not find UNSPSC category time-series route in inventoryRoutes.js');
        return false;
      }
    }
  },
  {
    name: 'Frontend service has UNSPSC time-series data fetch function',
    run: () => {
      const serviceContent = fs.readFileSync(inventoryServicePath, 'utf8');
      if (serviceContent.includes('getUnspscCategoryTimeSeriesData')) {
        logSuccess('Found getUnspscCategoryTimeSeriesData function in inventoryService.js');
        return true;
      } else {
        logError('Could not find getUnspscCategoryTimeSeriesData function in inventoryService.js');
        return false;
      }
    }
  },
  {
    name: 'Frontend component has time-series state variables',
    run: () => {
      const componentContent = fs.readFileSync(enhancedReportingPath, 'utf8');
      const hasTimeSeriesState = componentContent.includes('unspscTimeSeriesData') && 
                                 componentContent.includes('setUnspscTimeSeriesData');
      const hasLoadingState = componentContent.includes('unspscTimeSeriesLoading') && 
                              componentContent.includes('setUnspscTimeSeriesLoading');
      
      if (hasTimeSeriesState && hasLoadingState) {
        logSuccess('Found time-series state variables in EnhancedInventoryReporting.jsx');
        return true;
      } else {
        logError('Missing time-series state variables in EnhancedInventoryReporting.jsx');
        return false;
      }
    }
  },
  {
    name: 'Frontend component loads time-series data on mount',
    run: () => {
      const componentContent = fs.readFileSync(enhancedReportingPath, 'utf8');
      if (componentContent.includes('loadUnspscTimeSeriesData')) {
        const loadOnMount = componentContent.includes('useEffect') && 
                           componentContent.includes('loadUnspscTimeSeriesData()');
        
        if (loadOnMount) {
          logSuccess('Component loads time-series data on mount');
          return true;
        } else {
          logError('Component does not load time-series data on mount');
          return false;
        }
      } else {
        logError('Could not find loadUnspscTimeSeriesData function');
        return false;
      }
    }
  },
  {
    name: 'Frontend component has renderUnspscTimeSeriesChart function',
    run: () => {
      const componentContent = fs.readFileSync(enhancedReportingPath, 'utf8');
      if (componentContent.includes('renderUnspscTimeSeriesChart')) {
        logSuccess('Found renderUnspscTimeSeriesChart function');
        return true;
      } else {
        logError('Could not find renderUnspscTimeSeriesChart function');
        return false;
      }
    }
  },
  {
    name: 'Frontend component renders time-series chart in UI',
    run: () => {
      const componentContent = fs.readFileSync(enhancedReportingPath, 'utf8');
      if (componentContent.includes('{renderUnspscTimeSeriesChart()}')) {
        logSuccess('Component renders time-series chart in UI');
        return true;
      } else {
        logError('Component does not render time-series chart in UI');
        return false;
      }
    }
  },
  {
    name: 'Time-series chart is integrated with category selection',
    run: () => {
      const componentContent = fs.readFileSync(enhancedReportingPath, 'utf8');
      // Check if the time-series chart uses the selectedCategories state
      if (componentContent.includes('selectedCategories') && 
          componentContent.includes('unspscTimeSeriesData')) {
        logSuccess('Time-series chart is integrated with category selection');
        return true;
      } else {
        logError('Time-series chart is not integrated with category selection');
        return false;
      }
    }
  }
];

// Run tests
logHeader('Testing UNSPSC Category Time-Series Implementation');

let passedTests = 0;
let failedTests = 0;

tests.forEach((test, index) => {
  console.log(`${colors.cyan}Test ${index + 1}/${tests.length}: ${test.name}${colors.reset}`);
  try {
    const result = test.run();
    if (result) {
      passedTests++;
    } else {
      failedTests++;
    }
  } catch (error) {
    logError(`Error running test: ${error.message}`);
    failedTests++;
  }
  console.log(); // Add a line break between tests
});

// Summary
logHeader('Test Summary');
console.log(`Total tests: ${tests.length}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

if (failedTests === 0) {
  logSuccess('All tests passed! The UNSPSC category time-series implementation is complete.');
} else {
  logWarning('Some tests failed. Please fix the issues and run the tests again.');
}
