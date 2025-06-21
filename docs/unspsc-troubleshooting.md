# UNSPSC System and Item Master Creation Troubleshooting

## Common Issues and Solutions

### 1. 400 Bad Request When Creating Item Master

If you encounter a 400 Bad Request error when submitting the CreateItemMasterForm, check the following:

#### Authentication Issues
- Ensure you're properly authenticated with a valid JWT token
- The controller now includes a fallback to use a system user ID if the authentication fails

#### Required Fields
The following fields are required in the ItemMaster model:
- `shortDescription` - Brief description of the item (required)
- `standardDescription` - Standard description (defaults to shortDescription if not provided)
- `manufacturerName` - Name of manufacturer (defaults to 'N/A' if not provided)
- `manufacturerPartNumber` - Manufacturer part number (defaults to 'N/A' if not provided) 
- `equipmentCategory` - Category of equipment (defaults to 'OTHER' if not provided)
- `uom` - Unit of Measure (required, no default)

#### UNSPSC Code Handling
- If you provide an `unspscCode` without an `unspscCodeId`, the system will try to:
  1. Find the code in the database
  2. If not found, create a new UNSPSC code entry
  3. Use the UUID of the found/created code for the `unspscCodeId` field

### 2. Ant Design Message API Warning

If you see the warning `Warning: [antd: message] Static function can not consume context like dynamic theme`, this is because the message API is being used outside the Ant Design App context.

**Solution**: We've updated the code to:
1. Initialize the message API in RootApp.jsx and make it globally available
2. Use `window.antdMessageApi` instead of directly calling `message.error()` etc.

### 3. UNSPSC Code Input Issues

If you're having trouble with the UNSPSC code input:

- Ensure the code is in the correct format (8 digits)
- You can enter either the full 8-digit code (e.g., 43211706) or use path format (e.g., 43/21/17/06)
- The system will validate and process the code, creating it in the database if needed

## Implementation Notes

### Backend Changes

1. Updated `itemMasterController.js` to:
   - Better handle missing UNSPSC codes
   - Add fallback for authentication issues
   - Improve error handling and logging
   - Provide default values for required fields

### Frontend Changes

1. Updated `UnspscSimpleInput` component to:
   - Use the App-level message API to avoid theme context warnings
   - Better handle code validation and processing
   - Support both 8-digit and path formats
   - Improve loading and error states

2. Updated `CreateItemMasterForm` to:
   - Pre-process UNSPSC codes before submission
   - Ensure all required fields have appropriate values
   - Improve error handling and user feedback

## Testing

1. Create a new item with a manual UNSPSC code input (8-digit format)
2. Create a new item with a manual UNSPSC code input (path format)
3. Create a new item using the AI search functionality
4. Create a new item using the favorites system

All scenarios should work correctly without 400 Bad Request errors.
