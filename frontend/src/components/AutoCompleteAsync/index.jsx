import { useState, useEffect, useRef, useCallback } from 'react';

import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function AutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  redirectLabel = 'Add New',
  withRedirect = false,
  urlToRedirect = '/',
  value,
  onChange
}) {
  const translate = useLanguage();
  const navigate = useNavigate();

  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);
  const isUpdating = useRef(true);
  const isSearching = useRef(false);
  const previousQuery = useRef('');

  const [loading, setLoading] = useState(false);
  
  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
    if (!searchQuery || searchQuery === previousQuery.current) return;
    
    previousQuery.current = searchQuery;
    setLoading(true);

    request
      .search({ entity, options: { searchQuery, searchFields } })
      .then(result => {
        if (result && Array.isArray(result)) {
          setOptions(result);
        }
      })
      .catch(() => setOptions([]))
      .finally(() => {
        setLoading(false);
        isSearching.current = false;
      });
  }, [entity, searchFields]);

  // Handle search input changes with throttling
  const handleSearch = useCallback((value) => {
    if (!value) {
      setOptions([]);
      return;
    }

    if (!isSearching.current) {
      isSearching.current = true;
      debouncedSearch(value);
    }
  }, [debouncedSearch]);

  // Handle value changes from parent
  useEffect(() => {
    if (value !== undefined && value !== currentValue) {
      setCurrentValue(value);
    }
  }, [value]);

  const addNewValue = { value: 'redirectURL', label: `+ ${translate(redirectLabel)}` };

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  
  // Store original objects mapped by their string representations
  const [objectMap] = useState(new Map());

  // Helper function to safely get a value that can be rendered
  const getSafeValue = (value) => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'object') {
      // For objects, we need to store the original and return a string ID
      const objId = value.id || value._id || JSON.stringify(value);
      const stringKey = typeof objId === 'string' ? objId : String(objId);
      
      // Store the original object for later retrieval
      objectMap.set(stringKey, value);
      
      return stringKey;
    }
    
    return String(value);
  };

  // Helper to retrieve the original object from our map
  const getOriginalObject = (stringValue) => {
    if (objectMap.has(stringValue)) {
      return objectMap.get(stringValue);
    }
    return stringValue;
  };

  const handleSelectChange = (newValue) => {
    isUpdating.current = false;
    
    if (onChange) {
      if (newValue) {
        if (newValue === 'redirectURL') {
          // Handle redirect case
          onChange(newValue);
        } else {
          // Try to get the original object if available
          const originalValue = getOriginalObject(newValue);
          onChange(originalValue);
        }
      } else {
        onChange(undefined);
      }
    }
    
    if (newValue === 'redirectURL' && withRedirect) {
      navigate(urlToRedirect);
    }
  };

  const handleOnSelect = (value) => {
    // Always store string values in the component state
    setCurrentValue(value);
  };

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField) => {
    if (!optionField) return '';
    return displayLabels.map((x) => optionField[x] || '').join(' ');
  };

  useEffect(() => {
    const options = {
      q: debouncedValue,
      fields: searchFields,
    };
    const callback = asyncSearch(options);
    onFetch(callback);

    return () => {
      cancel();
    };
  }, [debouncedValue]);

  const onSearch = (searchText) => {
    isSearching.current = true;
    setSearching(true);
    setValToSearch(searchText);
  };

  useEffect(() => {
    if (isSuccess) {
      // When results come in, store each object in our map
      if (Array.isArray(result)) {
        result.forEach(item => {
          if (item && typeof item === 'object') {
            const key = getSafeValue(item);
            objectMap.set(key, item);
          }
        });
      }
      setOptions(result);
    } else {
      setSearching(false);
    }
  }, [isSuccess, result]);
  
  useEffect(() => {
    // this for update Form , it's for setField
    if (value && isUpdating.current) {
      setOptions([value]);
      
      // Store the object in our map and get a safe string value
      const safeValue = getSafeValue(value);
      setCurrentValue(safeValue);
      
      if (onChange) {
        onChange(value);
      }
      isUpdating.current = false;
    }
  }, [value]);

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={translate('Search')}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      onClear={() => {
        setSearching(false);
        setCurrentValue(undefined);
        if (onChange) {
          onChange(undefined);
        }
      }}
      onChange={handleSelectChange}
      style={{ minWidth: '220px' }}
      onSelect={handleOnSelect}
    >
      {selectOptions.map((optionField) => {
        if (!optionField) return null;
        
        // Get a string key for this option
        const safeKey = getSafeValue(optionField);
        
        return (
          <Select.Option
            key={safeKey}
            value={safeKey}
          >
            {labels(optionField)}
          </Select.Option>
        );
      })}
      {withRedirect && <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>}
    </Select>
  );
}
