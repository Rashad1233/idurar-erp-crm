import { request } from '../request';

// This would be run in the browser console to test the PR items loading
async function testRFQItemsLoading() {
  console.log('Testing PR items loading for RFQ Create...');
  
  try {
    // First, get a list of PRs to find one with items
    const prListResponse = await request.list({ entity: 'purchase-requisition' });
    console.log('PR List Response:', prListResponse);
    
    if (!prListResponse.success || !prListResponse.result || !Array.isArray(prListResponse.result)) {
      console.error('Failed to load PRs or unexpected response format');
      return;
    }
    
    // Get the first few PRs
    const prs = prListResponse.result.slice(0, 5);
    console.log(`Found ${prListResponse.result.length} PRs, testing first 5`);
    
    // Try to load each PR and check for items
    for (const pr of prs) {
      const prId = pr.id || pr._id;
      console.log(`Testing PR #${pr.number} (${prId})...`);
      
      const prResponse = await request.read({ entity: 'purchase-requisition', id: prId });
      
      if (!prResponse.success) {
        console.error(`Failed to load PR ${pr.number}:`, prResponse.message);
        continue;
      }
      
      const prData = prResponse.result;
      
      if (prData.items && Array.isArray(prData.items) && prData.items.length > 0) {
        console.log(`SUCCESS: PR ${pr.number} has ${prData.items.length} items!`);
        console.log('First few items:', prData.items.slice(0, 3));
        console.log(`To create an RFQ with this PR, navigate to: /rfq/create?prId=${prId}`);
        return;
      } else {
        console.log(`PR ${pr.number} has no items.`);
      }
    }
    
    console.error('None of the tested PRs have items!');
    
  } catch (error) {
    console.error('Error testing PR items loading:', error);
  }
}

// Export the function for use in the browser console
window.testRFQItemsLoading = testRFQItemsLoading;

// Instructions for running this test:
console.log(`
To run this test:
1. Navigate to /rfq in the frontend app
2. Open browser console
3. Call the testRFQItemsLoading() function
4. Follow the output instructions to create RFQ with items
`);

export { testRFQItemsLoading };
