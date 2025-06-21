import { useState, useEffect, useRef } from 'react';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { Select, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import { getRandomColor } from '@/utils/color';
import useLanguage from '@/locale/useLanguage';
import { extractUUID } from '@/utils/entityUtils';

const SelectAsync = ({
  entity,
  displayLabels = ['name'],
  outputValue = '_id',
  redirectLabel = '',
  withRedirect = false,
  urlToRedirect = '/',
  placeholder = 'select',
  value,
  onChange,
}) => {
  const translate = useLanguage();
  const [selectOptions, setOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);
    // Store original objects mapped by their string representations
  const objectMapRef = useRef(new Map());
  const navigate = useNavigate();

  // Helper function to safely get a value that can be rendered
  const getSafeValue = (value) => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'object') {
      // For objects, we need to store the original and return a string ID
      // Handle both MongoDB-style _id and SQL-style id
      const objId = value.id || value._id || value[outputValue];
      
      if (!objId) {
        console.warn('Object has no id or _id property:', value);
        const stringKey = uniqueId();
        objectMapRef.current.set(stringKey, value);
        return stringKey;
      }
      
      const stringKey = String(objId);
      
      try {
        // Store the original object for later retrieval
        objectMapRef.current.set(stringKey, value);
      } catch (error) {
        console.error('Error storing object in map:', error);
      }
      
      return stringKey;
    }
    
    return String(value);
  };

  // Helper to retrieve the original object from our map
  const getOriginalObject = (stringValue) => {
    if (objectMapRef.current.has(stringValue)) {
      return objectMapRef.current.get(stringValue);
    }
    return stringValue;
  };

  const asyncList = () => {
    return request.list({ entity });
  };
  
  const { result, isLoading: fetchIsLoading, isSuccess } = useFetch(asyncList);
  
  useEffect(() => {
    if (isSuccess && Array.isArray(result)) {
      // When results come in, store each object in our map
      result.forEach(item => {
        if (item && typeof item === 'object') {
          getSafeValue(item); // This stores the item in the map
        }
      });
      setOptions(result);
    }
  }, [isSuccess, result]);

  const labels = (optionField) => {
    if (!optionField) return '';
    return displayLabels.map((x) => optionField[x] || '').join(' ');
  };
  
  useEffect(() => {
    if (value !== undefined) {
      const safeValue = getSafeValue(value);
      setCurrentValue(safeValue);
      
      if (onChange) {
        onChange(value);
      }
    }
  }, [value]);
  const handleSelectChange = (newValue) => {
    if (onChange) {
      if (newValue) {
        if (newValue === 'redirectURL') {
          onChange(newValue);
        } else {
          // Try to get the original object if available
          const originalValue = getOriginalObject(newValue);
          
          // For client selectors in payment forms, ensure we pass the UUID string
          // This fix prevents the "invalid input syntax for type uuid" error
          if (entity === 'client' && originalValue) {
            const clientId = extractUUID(originalValue);
            console.log('SelectAsync: Extracted client ID:', clientId, 'from:', originalValue);
            
            if (clientId) {
              onChange(clientId);
            } else {
              onChange(originalValue);
            }
          } else {
            onChange(originalValue);
          }
        }
      } else {
        onChange(undefined);
      }
    }    
    setCurrentValue(newValue);
    
    if (newValue === 'redirectURL' && withRedirect) {
      navigate(urlToRedirect);
    }
  };
  
  const optionsList = () => {
    const list = [];

    try {
      // Add a guard to ensure result is not null and is an array
      if (result && Array.isArray(result) && result.length > 0) {
        result.forEach((item) => {
          if (item) {
            try {
              const safeValue = getSafeValue(item);
              const itemLabel = displayLabels
                .map((x) => {
                  return item[x] || '';
                })
                .filter(Boolean)
                .join(' ');
              
              // Get a random color using our utility function
              const colorObj = getRandomColor();
              const tagColor = colorObj.color || 'blue';
              
              if (safeValue && itemLabel) {
                list.push({
                  value: safeValue,
                  label: itemLabel,
                  color: tagColor,
                });
              }
            } catch (err) {
              console.error('Error processing option item:', err);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error generating options list:', err);
    }
    
    return list;
  };

  // Generate the options to display
  const options = optionsList();
  
  // Show a helpful message if no options are available
  const noOptionsMessage = fetchIsLoading ? 
    'Loading...' : 
    (entity === 'taxes' ? 'No tax options available' : 'No options available');

  return (
    <Select
      loading={fetchIsLoading}
      disabled={fetchIsLoading}
      value={currentValue}
      onChange={handleSelectChange}
      placeholder={placeholder}
      notFoundContent={noOptionsMessage}
    >
      {options.map((option) => {
        return (
          <Select.Option 
            key={`${uniqueId()}-${option.value}`}
            value={option.value}
          >
            <Tag bordered={false} color={option.color}>
              {option.label}
            </Tag>
          </Select.Option>
        );
      })}
      {withRedirect && (
        <Select.Option value={'redirectURL'}>{`+ ` + translate(redirectLabel)}</Select.Option>
      )}
    </Select>
  );
};

export default SelectAsync;
