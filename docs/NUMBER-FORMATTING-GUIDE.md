# Numeric Value Handling in ERP

## Common Issues

When working with numeric values in the ERP system, there are several common issues that can lead to errors like:

```
Uncaught TypeError: (text || 0).toFixed is not a function
```

These issues typically occur because:

1. Values from the database or API might be strings, not numbers
2. Values might be `null` or `undefined`
3. Values might be NaN or invalid numbers
4. Some fields may contain unexpected data types

## Best Practices

### 1. Use Utility Functions

Always use the provided utility functions in `frontend/src/utils/numberFormat.js`:

```javascript
import { formatNumber, formatCurrency } from '@/utils/numberFormat';

// In render functions:
render: (text) => formatCurrency(text)
```

### 2. In Table Columns

When defining table columns that display numeric values:

```javascript
{
  title: 'Unit Price',
  dataIndex: 'unitPrice',
  key: 'unitPrice',
  align: 'right',
  sorter: (a, b) => (parseFloat(a.unitPrice) || 0) - (parseFloat(b.unitPrice) || 0),
  render: (text) => formatCurrency(text)
}
```

### 3. In Calculations

When performing calculations with numeric values:

```javascript
const total = items.reduce((sum, item) => {
  let price = 0;
  try {
    price = parseFloat(item.price) || 0;
    if (isNaN(price)) price = 0;
  } catch (e) {
    price = 0;
  }
  return sum + price;
}, 0);
```

### 4. In Form Fields

For form fields that accept numeric values:

```jsx
<Form.Item
  label="Unit Price"
  name="unitPrice"
  rules={[
    {
      required: true,
      message: 'Unit price is required',
    },
    {
      validator: (_, value) => {
        if (value === undefined || value === null) {
          return Promise.reject('Value cannot be empty');
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return Promise.reject('Value must be a number');
        }
        if (numValue < 0) {
          return Promise.reject('Value cannot be negative');
        }
        return Promise.resolve();
      }
    }
  ]}
>
  <InputNumber
    min={0}
    step={0.01}
    style={{ width: '100%' }}
    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    parser={value => value.replace(/\$\s?|(,*)/g, '')}
  />
</Form.Item>
```

## Available Utility Functions

- `formatNumber(value, decimals = 2)` - Format a value as a number with specified decimal places
- `formatCurrency(value, currency = '$', decimals = 2)` - Format a value as currency
- `formatQuantity(value, uom = '', decimals = 2)` - Format a quantity with unit of measure
- `safeAdd(a, b)` - Safely add two values
- `safeMultiply(a, b)` - Safely multiply two values

## Debugging Tips

If you encounter numeric formatting errors:

1. Check the data type of the value using `console.log(typeof value)`
2. Verify the value is not `null` or `undefined`
3. Try converting the value to a number with `parseFloat` and check if it's `NaN`
4. Wrap any numeric operations in try/catch blocks to catch unexpected errors
