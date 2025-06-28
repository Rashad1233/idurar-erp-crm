-# Purchase Order - Purchase Requisition Dropdown Fix Summary

## Problem
The Purchase Order creation page at http://localhost:3000/purchase-order/create was experiencing a 500 Internal Server Error when loading the Purchase Requisition dropdown. The error was due to Sequelize association issues in the original list controller.

## Solution
- Replaced the original Sequelize-based list controller with a new simplified controller using direct SQL queries via the pg client.
- The new controller fetches Purchase Requisitions with pagination and filtering without complex associations.
- The response format is compatible with the frontend dropdown requirements.

## Benefits
- Eliminates the "Include unexpected" Sequelize error.
- Improves performance by avoiding unnecessary Sequelize associations.
- Ensures the Purchase Requisition dropdown loads successfully with approved PRs.

## Next Steps
- Test the Purchase Order creation page to verify the dropdown loads correctly.
- Monitor for any further errors or issues.

This fix maintains all existing functionality while resolving the backend error.
