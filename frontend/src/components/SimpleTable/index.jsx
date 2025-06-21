import React from 'react';
import { Table, Empty, Spin, Alert } from 'antd';

/**
 * A simplified table component that avoids complex configurations
 * and provides better error handling and fallbacks
 */
const SimpleTable = ({ 
  columns = [], 
  dataSource = [], 
  isLoading = false, 
  pagination = {
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    pageSize: 10
  },
  rowKey = '_id',
  expandable,
  onChange
}) => {
  // Make a safe copy of columns with enhanced render functions to prevent errors
  const safeColumns = (columns || []).map(column => {
    // If column already has a render function, wrap it in a try/catch
    if (column.render) {
      const originalRender = column.render;
      return {
        ...column,
        render: (text, record, index) => {
          try {
            // Call the original render function
            return originalRender(text, record, index);
          } catch (error) {
            console.error(`Render error in column ${column.title}:`, error);
            // Return a fallback value
            return text || '-';
          }
        }
      };
    }
    // If no render function, add a safe one
    return {
      ...column,
      render: (text) => text || '-'
    };
  });

  // Handle missing columns case
  if (!safeColumns || safeColumns.length === 0) {
    return <Empty description="No columns defined" />;
  }
  
  // Create a safe version of the dataSource that won't cause render errors
  const safeDataSource = (dataSource || []).map(item => {
    // If item is null or undefined, return an empty object
    if (!item) return {};
    return item;
  });

  return (
    <div className="simple-table-wrapper">
      <Spin spinning={isLoading} size="large" tip="Loading data...">        <Table
          columns={safeColumns}
          dataSource={safeDataSource}
          pagination={pagination}
          rowKey={(record) => {
            // Safe rowKey handling
            if (typeof rowKey === 'function') {
              try {
                return rowKey(record);
              } catch (error) {
                console.error('Error generating rowKey:', error);
                return Math.random().toString();
              }
            }
            return record[rowKey] || Math.random().toString();
          }}
          expandable={expandable}
          scroll={{ x: true }}
          locale={{
            emptyText: safeDataSource?.length === 0 ? 'No data available' : 'Loading data...'
          }}
          onChange={onChange}
          size="middle"
          style={{ width: '100%' }}
        />
      </Spin>
    </div>
  );
};

export default SimpleTable;
