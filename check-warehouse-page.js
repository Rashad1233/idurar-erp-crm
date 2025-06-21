const puppeteer = require('puppeteer');

async function checkWarehousePage() {
  console.log('==== CHECKING WAREHOUSE PAGE IN BROWSER ====');
  
  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Log all console output from the page
    page.on('console', message => console.log(`BROWSER: ${message.type().toUpperCase()}: ${message.text()}`));
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to login page
    console.log('🔑 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Fill in login form
    console.log('🔑 Logging in...');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Check if we are logged in successfully
    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.error('❌ Login failed');
      await browser.close();
      return;
    }
    
    console.log('✅ Login successful');
    
    // Navigate to the warehouse page
    console.log('🏢 Navigating to warehouse page...');
    await page.goto('http://localhost:3000/warehouse', { waitUntil: 'networkidle2' });
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'warehouse-page.png' });
    console.log('📸 Screenshot saved as warehouse-page.png');
    
    // Check for error messages on the page
    const errorElements = await page.$$eval('.ant-alert-error, .error-message', elements => 
      elements.map(el => el.textContent)
    );
    
    if (errorElements.length > 0) {
      console.error('❌ Found error messages on the page:');
      errorElements.forEach(error => console.error(`   - ${error}`));
    } else {
      console.log('✅ No error messages found on the page');
    }
    
    // Check if storage location data is loaded
    const storageLocationElements = await page.$$eval('.ant-table-row', rows => rows.length);
    console.log(`📊 Found ${storageLocationElements} storage location rows in the table`);
    
    if (storageLocationElements > 0) {
      console.log('✅ Storage locations loaded successfully');
    } else {
      console.warn('⚠️ No storage locations found in the table');
    }
    
    // Check network requests for warehouse API calls
    const warehouseRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/simple-storage-locations') || 
          url.includes('/api/simple-bin-locations') ||
          url.includes('/api/warehouse')) {
        warehouseRequests.push({
          url,
          method: request.method()
        });
      }
    });
    
    // Refresh the page to capture requests
    await page.reload({ waitUntil: 'networkidle2' });
    
    console.log(`📡 Detected ${warehouseRequests.length} warehouse API requests:`);
    warehouseRequests.forEach(req => console.log(`   - ${req.method} ${req.url}`));
    
    // Close browser
    await browser.close();
    console.log('✅ Browser closed');
    
    console.log('\n==== SUMMARY ====');
    console.log(`Storage locations found: ${storageLocationElements}`);
    console.log(`API requests made: ${warehouseRequests.length}`);
    console.log(`Errors found: ${errorElements.length}`);
    console.log('\nResult: ' + (
      storageLocationElements > 0 && errorElements.length === 0 
        ? '✅ Warehouse page is working correctly' 
        : '❌ Warehouse page has issues'
    ));
    
  } catch (error) {
    console.error('❌ Error during browser check:', error);
  }
}

// Run the function
checkWarehousePage();
