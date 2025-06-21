import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * Simple search component for use across the application
 * Provides a standard search input with icon and consistent styling
 */
const SearchComponent = () => {
  // Return a component that can be used directly
  return ({ value, onChange, onSearch, placeholder }) => (
    <Input
      placeholder={placeholder || "Search..."}
      prefix={<SearchOutlined />}
      value={value}
      onChange={onChange}
      onPressEnter={(e) => onSearch && onSearch(e.target.value)}
      style={{ width: 250 }}
      allowClear
    />
  );
};

export default SearchComponent;
