import React, { useState, useEffect } from 'react';
import { Table, Empty, Spin, Switch, Alert } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

// A simpler version of DataTable that only accepts direct props
const SimpleDataTable = ({ 
  columns = [], 
  dataSource = [], 
  isLoading = false, 
  pagination = {
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    pageSize: 10
  },  rowKey = '_id',
  expandable,
  onChange
}) => {
  const [error, setError] = useState(null);
  
  // Process columns to ensure no tooltip behaviors
  const safeColumns = React.useMemo(() => {
    return columns.map(col => ({
      ...col,
      ellipsis: false,
      tooltip: undefined,
      showSorterTooltip: false
    }));
  }, [columns]);
  
  useEffect(() => {
    // Reset error when data changes
    setError(null);
  }, [dataSource]);
  
  if (!columns || columns.length === 0) {
    return <Empty description="No columns defined" />;
  }    return (
    <Spin spinning={isLoading}>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}      <Table
        columns={safeColumns}
        dataSource={dataSource || []}
        loading={isLoading}
        pagination={pagination}
        rowKey={rowKey}
        expandable={expandable}
        scroll={{ x: true }}
        locale={{
          emptyText: 'No data available'
        }}        onChange={onChange}
        showSorterTooltip={false}
        // Disable automatic tooltip behavior in table cells and rows
        components={{
          header: {
            cell: ({ children, ...restProps }) => {
              // Remove any props that might trigger tooltips
              const safeProps = { ...restProps };
              delete safeProps.title;
              delete safeProps.ellipsis;
              delete safeProps.tooltip;
              return <th {...safeProps}>{children}</th>;
            }
          },
          body: {
            cell: ({ children, ...restProps }) => {
              // Remove any props that might trigger tooltips
              const safeProps = { ...restProps };
              delete safeProps.title;
              delete safeProps.ellipsis;
              delete safeProps.tooltip;
              return <td {...safeProps}>{children}</td>;
            }
          }
        }}
      />
    </Spin>
  );
};

export default SimpleDataTable;
