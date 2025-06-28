# Purchase Order - Purchase Requisition Dropdown Configuration Summary

## Overview
The Purchase Order creation page at `http://localhost:3000/purchase-order/create` is already fully configured with a Purchase Requisition dropdown that fetches data from the PostgreSQL database.

## Current Status ✅
- **Frontend**: The PurchaseOrderCreate.jsx component already has a fully functional PR dropdown
- **Backend**: The PR API endpoints are properly configured at `/api/purchase-requisition`
- **Database**: Connected to PostgreSQL (erpdb) with proper credentials

## Database Configuration
```javascript
{
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
}
```

## How the PR Dropdown Works

### 1. Frontend Implementation (PurchaseOrderCreate.jsx)
The component fetches Purchase Requisitions on mount:
```javascript
// Load suppliers, available RFQs, PRs and contracts
useEffect(() => {
  Promise.all([
    request.list({ entity: 'supplier' }),
    request.list({ entity: 'rfq' }),
    request.list({ entity: 'contract' }),
    request.list({ entity: 'purchase-requisition' })  // ← PR API call
  ])
  .then(([suppliersResponse, rfqsResponse, contractsResponse, prsResponse]) => {
    if (prsResponse.success) {
      const prsData = prsResponse.result || prsResponse.data || [];
      // Filter PRs to show only approved ones
      const approvedPRs = prsData.filter(pr => pr.status === 'approved');
      setAvailablePRs(approvedPRs);
    }
  })
}, []);
```

### 2. PR Dropdown Component
```javascript
<Form.Item
  name="purchaseRequisition"
  label={translate('Purchase Requisition')}
  rules={[{ required: !rfqId && !contractId, message: translate('Please select a Purchase Requisition, RFQ, or Contract') }]}
>
  <Select
    placeholder={translate('Select Purchase Requisition')}
    loading={loading}
    disabled={!!rfqId || !!contractId}
    onChange={handlePRSelect}
    showSearch
    filterOption={(input, option) =>
      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  >
    {availablePRs.map(pr => (
      <Option key={pr._id || pr.id} value={pr._id || pr.id}>
        {pr.prNumber} - {pr.description}
      </Option>
    ))}
  </Select>
</Form.Item>
```

### 3. Backend API Routes
- **Route**: `/api/purchase-requisition`
- **Controller**: `backend/src/controllers/appControllers/procurementControllers/purchaseRequisitionController/list.js`
- **Issue Fixed**: The controller was looking for a non-existent `removed` column

### 4. Database Table Structure
The `PurchaseRequisitions` table has the following columns:
- id (uuid)
- prNumber (varchar)
- description (text)
- status (enum: draft, submitted, approved, rejected, cancelled)
- totalAmount (numeric)
- requestorId, approverId (uuid)
- costCenter (varchar)
- submittedAt, approvedAt (timestamp)
- And more...

## Current Data
The system currently has 2 Purchase Requisitions:
1. **PR-20250625-6025** - Status: approved ✅
2. **PR-20250626-0001** - Status: approved ✅

Both are available in the dropdown for Purchase Order creation.

## Features
1. **Filtering**: Only approved PRs are shown in the dropdown
2. **Search**: The dropdown supports search functionality
3. **Pre-fill**: When a PR is selected, it pre-fills the PO items from the PR
4. **Validation**: The dropdown is required unless an RFQ or Contract is selected

## Testing
To test the PR dropdown:
1. Navigate to http://localhost:3000/purchase-order/create
2. The Purchase Requisition dropdown should show approved PRs
3. Select a PR to pre-fill the PO with items from that PR

## Troubleshooting
If the dropdown is not showing PRs:
1. Check if there are approved PRs in the database
2. Verify the backend server is running on port 8888
3. Check browser console for any API errors
4. Ensure the PR list controller doesn't reference the non-existent `removed` column

## Summary
✅ The Purchase Order - Purchase Requisition dropdown is fully configured and functional. It connects to the PostgreSQL database, fetches approved Purchase Requisitions, and allows users to select them when creating Purchase Orders. No additional configuration is needed.
