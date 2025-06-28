# Purchase Order PR Data Fix Implementation

## Problem
When selecting a Purchase Requisition in the Purchase Order creation form, the system tries to fetch individual PR data using:
- `request.read({ entity: 'purchase-requisition', id: selectedPRId })`

This calls endpoints that don't exist:
- `/api/purchase-requisition/read/:id`
- `/api/purchase-requisition/:id`

## Solution
Use the already fetched PR data from the initial load instead of making another API call.

## Implementation Details

### Current Code Issue (Line 189-250 in handlePRSelect):
```javascript
const handlePRSelect = (selectedPRId) => {
  // ... validation code ...
  
  // THIS IS THE PROBLEM - Making unnecessary API call
  request.read({ entity: 'purchase-requisition', id: selectedPRId })
    .then(async (response) => {
      if (response.success && response.data) {
        const prData = response.data;
        // ... rest of the code
      }
    })
    .catch(err => {
      console.error('Failed to load PR data:', err);
      message.error('Failed to load Purchase Requisition data');
    });
};
```

### Fixed Code:
```javascript
const handlePRSelect = (selectedPRId) => {
  if (!selectedPRId || selectedPRId === "") {
    // Clear selection
    setSelectedPR(null);
    setContractData(null);
    setRfqData(null);
    setAvailableRfqs([]);
    setItems([]);
    form.setFieldsValue({
      purchaseRequisition: selectedPRId,
      rfq: null,
      contract: null,
      items: []
    });
    return;
  }

  // Find the selected PR from already fetched data
  const selectedPRData = allPRs.find(pr => (pr._id || pr.id) === selectedPRId);

  if (!selectedPRData) {
    message.error('Selected Purchase Requisition not found');
    return;
  }

  setSelectedPR(selectedPRData);
  setContractData(null);
  setRfqData(null);

  // Filter RFQs associated with this PR
  const relatedRfqs = allRfqs.filter(rfq =>
    rfq.purchaseRequisitionId === selectedPRId && rfq.status === 'in_progress'
  );
  setAvailableRfqs(relatedRfqs);

  if (relatedRfqs.length === 1) {
    setRfqData(relatedRfqs[0]);
    form.setFieldsValue({ rfq: relatedRfqs[0]._id || relatedRfqs[0].id });
  } else {
    setRfqData(null);
    form.setFieldsValue({ rfq: null });
  }

  // Pre-fill items from PR data
  const prItems = selectedPRData.items || [];
  const formattedItems = prItems.map((item, index) => ({
    key: item.id || item._id || `pr-item-${index}`,
    itemId: item.id || item._id,
    name: item.name || item.itemName || item.description || '',
    description: item.description || item.itemDescription || '',
    quantity: parseFloat(item.quantity) || 1,
    price: parseFloat(item.estimatedPrice) || parseFloat(item.unitPrice) || 0,
    unit: item.unit || item.uom || 'each'
  }));

  setItems(formattedItems);
  form.setFieldsValue({
    contract: null,
    purchaseRequisition: selectedPRId,
    rfq: null,
    items: formattedItems
  });
};
```

## Key Changes:
1. Remove the `request.read()` API call
2. Use `allPRs.find()` to get the selected PR from already fetched data
3. Remove the async/await and promise handling since no API call is needed
4. Keep all the same logic for setting items and form values

## Benefits:
1. No broken API calls
2. Faster response (no network request)
3. Uses already available data
4. Maintains the same functionality

## Testing:
1. Select a PR from the dropdown
2. Verify that PR items are populated correctly
3. Verify that related RFQs are filtered properly
4. Verify no network errors in console
