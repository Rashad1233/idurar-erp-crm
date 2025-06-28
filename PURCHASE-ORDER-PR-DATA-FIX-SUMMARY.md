# Purchase Order PR Data Fix Summary

## Issue
When selecting a Purchase Requisition in the Purchase Order creation form, the system was trying to fetch individual PR data using non-existent endpoints:
- `/api/purchase-requisition/read/:id`
- `/api/purchase-requisition/:id`

## Solution
Modified the `handlePRSelect` function to use the already fetched PR data from the `allPRs` array instead of making a separate API call.

## Changes Made

### 1. Updated `handlePRSelect` function
- Removed the `request.read()` API call
- Used `allPRs.find()` to get the selected PR data from the already fetched array
- Kept the RFQ filtering logic intact
- Maintained the item formatting and form field updates

### 2. Key Benefits
- No backend changes required
- Uses existing data from initial load
- Eliminates unnecessary API calls
- Prevents errors from non-existent endpoints

## Technical Details

The fix involves finding the selected PR from the `allPRs` state variable that was populated during the initial component load:

```javascript
const selectedPRData = allPRs.find(pr => (pr._id || pr.id) === selectedPRId);
```

This approach is more efficient and aligns with the pattern already used for RFQ and Contract selection in the same component.
