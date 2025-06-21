// debug-frontend-item-master.js
// We'll use this script to analyze network traffic between frontend and backend

const puppeteer = require('puppeteer');

async function debugFrontendItemMaster() {
  console.log('🔍 Starting frontend debugging for Item Master page');
  
  // Launch browser and open the item master page
  const browser = await puppeteer.launch({
    headless: false, // Not headless so we can see what's happening
    defaultViewport: null, // Full size viewport
    args: ['--start-maximized'] // Start maximized
  });
  
  console.log('✅ Browser launched');
  
  try {
    const page = await browser.newPage();
    
    // Enable request/response interception
    await page.setRequestInterception(true);
    
    // Track all network requests to find the item master API call
    const requests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/item-master')) {
        console.log('📤 Request to:', url, 'Method:', request.method());
        requests.push({
          url,
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
      request.continue();
    });
    
    // Track responses to see what's coming back from the API
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/item-master')) {
        console.log('📥 Response from:', url, 'Status:', response.status());
        try {
          const responseBody = await response.json();
          console.log('Response data:', JSON.stringify(responseBody, null, 2));
        } catch (error) {
          console.log('Could not parse response as JSON:', error.message);
        }
      }
    });
    
    // Navigate to the item master page
    console.log('Navigating to Item Master page...');
    await page.goto('http://localhost:3000/item-master', {
      waitUntil: 'networkidle0', // Wait until network is idle
      timeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log('✅ Page loaded');
    
    // Wait for the table to be visible
    await page.waitForSelector('table', { timeout: 10000 });
    
    console.log('✅ Table is visible');
    
    // Give some time to collect more network data
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Print summary of requests
    console.log(`\n📊 Request summary: ${requests.length} requests to item-master endpoint`);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    // Close the browser
    await browser.close();
    console.log('✅ Browser closed');
  }
}

// Run the debugging
debugFrontendItemMaster().catch(console.error);
