# ToDo: Complete Contract and Supplier Integration

This document lists the steps needed to complete the contract and supplier integration for the ERP system.

## Database Setup Issues

The initial setup encountered some database issues:

1. **Missing Suppliers Table**: The error `relation "suppliers" does not exist` indicates that the table name might be different (possibly capitalized differently).
2. **Missing Association**: `Supplier is not associated to PurchaseRequisition` indicates that we need to define this association in the models.

## Steps to Complete

### 1. Fix Database Model Issues

- Check the actual table names in the database (they might be capitalized differently)
- Add the missing association between PurchaseRequisition and Supplier:
  ```javascript
  // In models/sequelize/index.js
  PurchaseRequisition.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
  Supplier.hasMany(PurchaseRequisition, { foreignKey: 'supplierId', as: 'purchaseRequisitions' });
  ```

### 2. Enhance the Purchase Requisition UI

- Update the frontend to display contract price information
- In `PurchaseRequisitionReadSimple.jsx`, add logic to fetch and display contract prices:
  ```javascript
  // In the useEffect where PR data is loaded
  const getContractPricesForItems = async (prItems, supplierId) => {
    if (!supplierId) return prItems;
    
    try {
      const response = await request.get({ 
        entity: `procurement/contract-prices/supplier/${supplierId}/prices`
      });
      
      if (response.success && response.data.length > 0) {
        // Extract all contract prices
        const contractPrices = {};
        response.data.forEach(contract => {
          contract.items.forEach(item => {
            contractPrices[item.itemId] = {
              contractId: contract.contractId,
              contractNumber: contract.contractNumber,
              unitPrice: item.unitPrice,
              currency: item.currency
            };
          });
        });
        
        // Update PR items with contract prices
        return prItems.map(item => {
          if (contractPrices[item.itemId]) {
            return {
              ...item,
              contractPrice: contractPrices[item.itemId].unitPrice,
              contractId: contractPrices[item.itemId].contractId,
              priceSource: 'contract',
              // Set price if not already set
              price: item.price || contractPrices[item.itemId].unitPrice,
              unitPrice: item.unitPrice || contractPrices[item.itemId].unitPrice
            };
          }
          return item;
        });
      }
    } catch (error) {
      console.error('Error fetching contract prices:', error);
    }
    
    return prItems;
  };
  ```

- Update the price column to show contract price information:
  ```javascript
  // In the price rendering logic
  if (record.priceSource === 'contract') {
    return (
      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
        <Tooltip title={translate('Price from contract')}>
          <div>
            {`${pr?.currency || 'USD'} ${numPrice.toFixed(2)}`}
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
              {translate('Contract Price')}
            </div>
          </div>
        </Tooltip>
      </div>
    );
  }
  ```

### 3. Enhance the Purchase Requisition Creation

- When creating a PR, fetch contract prices automatically based on selected supplier
- Add a dropdown to select from available contracts when a supplier is selected
- Update the API endpoints for PR creation to handle contract pricing

### 4. Create Missing Database Tables (if needed)

Run these SQL commands if the tables don't exist:

```sql
-- Create Suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Suppliers" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "supplier_number" VARCHAR(50) UNIQUE NOT NULL,
  "legal_name" VARCHAR(255) NOT NULL,
  "trade_name" VARCHAR(255),
  "contact_email" VARCHAR(255),
  "contact_email_secondary" VARCHAR(255),
  "contact_phone" VARCHAR(50),
  "contact_name" VARCHAR(255),
  "compliance_checked" BOOLEAN DEFAULT FALSE,
  "supplier_type" VARCHAR(50) DEFAULT 'transactional',
  "payment_terms" VARCHAR(50),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "country" VARCHAR(100),
  "postal_code" VARCHAR(20),
  "tax_id" VARCHAR(50),
  "registration_number" VARCHAR(50),
  "status" VARCHAR(20) DEFAULT 'active',
  "notes" TEXT,
  "created_by_id" UUID,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Contracts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "contract_number" VARCHAR(50) UNIQUE NOT NULL,
  "contract_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "supplier_id" UUID NOT NULL REFERENCES "Suppliers"("id"),
  "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" VARCHAR(20) DEFAULT 'draft',
  "incoterms" VARCHAR(50),
  "payment_terms" VARCHAR(50),
  "currency" VARCHAR(10) DEFAULT 'USD',
  "created_by_id" UUID,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ContractItems table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ContractItems" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "contract_id" UUID NOT NULL REFERENCES "Contracts"("id"),
  "item_id" UUID NOT NULL,
  "item_number" VARCHAR(50) NOT NULL,
  "unit_price" DECIMAL(10, 2) NOT NULL,
  "currency" VARCHAR(10),
  "minimum_order_quantity" INTEGER,
  "lead_time" INTEGER,
  "notes" TEXT,
  "created_by_id" UUID,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Test and Validate

- Create a test Purchase Requisition with a supplier that has contracts
- Verify contract prices are being displayed and used correctly
- Test the price history feature to see prices from previous PRs
