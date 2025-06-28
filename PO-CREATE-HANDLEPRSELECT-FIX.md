# Purchase Order Create - handlePRSelect Function Fix

## Issue
The PurchaseOrderCreate component was throwing a ReferenceError:
```
Uncaught ReferenceError: handlePRSelect is not defined
    at POCreateForm (PurchaseOrderCreate.jsx:471:21)
```

This error occurred when the Purchase Requisition dropdown's `onChange` event was triggered, but the corresponding handler function was not defined in the component.

## Root Cause
The component had a Purchase Requisition dropdown with `onChange={handlePRSelect}`, but the `handlePRSelect` function was missing from the component implementation. Similar handler functions (`handleRfqSelect` and `handleContractSelect`) were present, but the PR handler was overlooked.

## Solution Implemented

### 1. Added the Missing handlePRSelect Function
```javascript
// Handle PR selection
const handlePRSelect = (selectedPRId) => {
  if (!selectedPRId) return;
  
  const selectedPR = availablePRs.find(pr => (pr._id || pr.id) === selectedPRId);
  if (selectedPR) {
    setSelectedPR(selectedPR);
    setRfqData(null);
    setContractData(null);
    
    // Pre-fill items from PR
    const prItems = selectedPR.items || [];

const formattedItems = prItems.map(item => ({
      key: item._id || item.id,
      itemId: item._id || item.id,
      name: item.name || item.itemName,
      description: item.description || item.itemDescription,
      quantity: item.quantity,
      price: item.estimatedPrice || 0,
      unit: item.unit || 'each'
    }));
    
    setItems(formattedItems);
    form.setFieldsValue({
      items: formattedItems,
      rfq: null,
      contract: null,
      purchaseRequisition: selectedPRId
    });
  }
};
```

### 2. Updated Other Selection Handlers
Updated `handleRfqSelect` and `handleContractSelect` to clear the `selectedPR` state:
- Added `setSelectedPR(null)` in both functions
- Added `purchaseRequisition: null` to form field updates

### 3. Updated Item Management Functions
Modified `addItem` and `removeItem` functions to check for `selectedPR`:
- Changed condition from `if (rfqData || contractData)` to `if (rfqData || contractData || selectedPR)`
- Updated warning messages to include Purchase Requisition

### 4. Updated Button Disabled States

Modified the disabled state for delete and add item buttons:
- Changed from `disabled={!!rfqData || !!contractData}` 
- To `disabled={!!rfqData || !!contractData || !!selectedPR}`

## Files Modified
- `frontend/src/pages/PurchaseOrder/PurchaseOrderCreate.jsx`

## Testing Performed
1. **Frontend Component Structure**: Verified that all required functions and state variables are properly defined
2. **Component Behavior**: Simulated the selection flow to ensure proper state management
3. **API Integration**: Confirmed that the Purchase Requisition API returns data with items

## Impact
- Fixes the immediate ReferenceError preventing the Purchase Order form from loading
- Enables proper Purchase Requisition selection and item pre-filling
- Maintains consistency with RFQ and Contract selection behavior
- Ensures proper state management across all selection types

## Verification Steps
1. Navigate to Purchase Order Create page
2. Select a Purchase Requisition from the dropdown
3. Verify that items are pre-filled from the selected PR
4. Verify that RFQ and Contract fields are cleared
5. Verify that add/remove item buttons are disabled
6. Switch between PR, RFQ, and Contract selections to ensure proper state clearing

## Related Components
- Purchase Requisition API (`/api/v1/purchase-requisition`)
- RFQ selection handler
- Contract selection handler
- Item management (add/remove) functions

## Future Considerations
- Consider adding unit tests for the selection handlers
- Add PropTypes or TypeScript for better type safety
- Consider extracting common selection logic into a custom hook
