import React, { useState } from 'react';
import { Input, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import useLanguage from '@/locale/useLanguage';

const { Search } = Input;

const SearchPanel = ({ entity }) => {
  const [searchText, setSearchText] = useState('');
  const dispatch = useDispatch();
  const translate = useLanguage();

  const handleSearch = (value) => {
    setSearchText(value);
    
    if (value) {
      dispatch(erp.search(entity, {
        question: value,
        fields: ['name', 'number', 'description'], // Add any fields you want to search in
      }));
    } else {
      // If search is cleared, reload the full list
      dispatch(erp.list({ entity }));
    }
  };

  const handleClear = () => {
    setSearchText('');
    dispatch(erp.list({ entity }));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Space>
        <Search
          placeholder={translate('Search...')}
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        {searchText && (
          <Button 
            onClick={handleClear}
            icon={<ClearOutlined />}
          >
            {translate('Clear')}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default SearchPanel;
