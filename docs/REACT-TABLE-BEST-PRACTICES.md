# React Table Best Practices

## Common Issues with Tables in React Applications

### 1. DOM Nesting Validation Errors

React enforces proper DOM nesting rules. A common error is:
```
Whitespace text nodes cannot appear as a child of <tr>
```

This happens when there are extra spaces, line breaks, or comments between table elements:

```jsx
// Bad - whitespace between JSX tags
<tr>
  <td>Data</td> 
  <td>More Data</td>
</tr>

// Good - no whitespace
<tr>
  <td>Data</td>
  <td>More Data</td>
</tr>
```

### 2. Text Overflow Issues

Long text in table cells can cause layout problems:

- Use the `ellipsis` property to truncate text and add `...`
- Include `<Tooltip>` to show the full text on hover
- Set proper column widths with fixed sizes

```jsx
{
  title: 'Inventory Number',
  dataIndex: 'inventoryNumber',
  width: 180,
  ellipsis: true,
  render: (text) => (
    <Tooltip title={text}>
      <span>{text}</span>
    </Tooltip>
  )
}
```

### 3. Horizontal Scrolling Issues

For tables with many columns:

- Set an appropriate `scroll` property: `scroll={{ x: 1800 }}`
- Use `fixed` properties for important columns: `fixed: 'left'` or `fixed: 'right'`
- Wrap the table in a container with CSS for proper scrolling behavior

```jsx
<div className="table-container">
  <Table 
    scroll={{ x: 1800 }} 
    // other props
  />
</div>
```

### 4. Number and Currency Formatting

Always use proper formatting utilities for consistency:

```jsx
// Create utility functions
export const formatNumber = (value, decimals = 2) => {
  // ... implementation
};

export const formatCurrency = (value, currency = '$', decimals = 2) => {
  return `${currency}${formatNumber(value, decimals)}`;
};

// Use in column render functions
{
  title: 'Price',
  dataIndex: 'price',
  render: (text) => formatCurrency(text)
}
```

### 5. Table Summary Rows

Ensure summary rows have proper column spans and are correctly aligned:

```jsx
summary={(pageData) => {
  const total = calculateTotal(pageData);
  return (
    <Table.Summary.Row>
      <Table.Summary.Cell colSpan={3}>
        <strong>Total</strong>
      </Table.Summary.Cell>
      <Table.Summary.Cell align="right">
        <strong>{formatCurrency(total)}</strong>
      </Table.Summary.Cell>
      <Table.Summary.Cell colSpan={2} />
    </Table.Summary.Row>
  );
}}
```

## CSS Best Practices for Tables

```css
/* Ensure table has proper horizontal scroll behavior */
.table-container .ant-table-container {
  overflow-x: auto !important;
}

/* Add proper cell truncation with ellipsis */
.table-container .ant-table-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Make sure fixed columns work properly */
.table-container .ant-table-cell.ant-table-cell-fix-left,
.table-container .ant-table-cell.ant-table-cell-fix-right {
  z-index: 2;
}

/* Better scrollbar styling */
.table-container ::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-container ::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.table-container ::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}
```

## Performance Considerations

1. Use row keys for better reconciliation
2. Virtual scrolling for large datasets
3. Memoize expensive operations
4. Use column filters and sorters wisely

```jsx
// Good practice
<Table
  rowKey="id"
  dataSource={data}
  columns={memoizedColumns}
  pagination={{ pageSize: 50 }}
/>
```
