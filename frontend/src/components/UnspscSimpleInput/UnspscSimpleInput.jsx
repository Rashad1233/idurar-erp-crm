import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Typography, message, Spin } from 'antd';
import { SearchOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import UnspscAiSearch from '@/components/UnspscAiSearch/UnspscAiSearch';
import apiClient from '@/api/axiosConfig';

const { Text, Title } = Typography;

const UnspscSimpleInput = ({ value, onChange, placeholder = "Enter UNSPSC code or path" }) => {
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [loading, setLoading] = useState(false);
  
  // Add a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Update inputValue when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);// Process the direct input when user presses Enter or input loses focus
  const processDirectInput = async () => {
    if (!inputValue || inputValue.trim() === '') return;
    
    // Skip processing if it's already in progress
    if (loading) return;
    
    // Transform input if it looks like a path without slashes (e.g., 43211706 -> 43/21/17/06)
    let processedInput = inputValue.trim();
    if (/^\d{8}$/.test(processedInput)) {
      // It's already an 8-digit code, keep as is
    } else if (/^\d{2}\d{2}\d{2}\d{2}$/.test(processedInput)) {
      // Format it as a path with slashes for better readability
      const segment = processedInput.substring(0, 2);
      const family = processedInput.substring(2, 4);
      const classCode = processedInput.substring(4, 6);
      const commodity = processedInput.substring(6, 8);
      processedInput = `${segment}/${family}/${classCode}/${commodity}`;
    } else if (!/^\d{2}\/\d{2}\/\d{2}\/\d{2}$/.test(processedInput)) {
      // Not a valid code or path format
      // Use App.message for dynamic theme context
      if (window.antdMessageApi) {
        window.antdMessageApi.error('Invalid format. Please enter an 8-digit code (e.g., 43211706) or path (e.g., 43/21/17/06)');
      } else {
        console.error('Invalid UNSPSC format');
      }
      return;
    }
    
    try {      setLoading(true);
      const response = await apiClient.post('/unspsc/direct', { 
        input: processedInput 
      });
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      if (response.data?.success && response.data?.data) {
        const result = response.data.data;
        // Update the input field with the proper code
        setInputValue(result.code);
        // Call onChange with both the code and the full result
        if (onChange) {
          onChange(result.code, result);
        }
        
        // Use App.message for dynamic theme context
        if (window.antdMessageApi) {
          window.antdMessageApi.success(`UNSPSC code ${result.code} (${result.title}) processed successfully`);
        } else {
          console.log(`UNSPSC code ${result.code} processed successfully`);
        }
      } else {
        if (window.antdMessageApi) {
          window.antdMessageApi.error('Failed to process UNSPSC code');
        } else {
          console.error('Failed to process UNSPSC code');
        }
      }
    } catch (error) {
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      console.error('Error processing UNSPSC code:', error);
      let errorMsg = 'Failed to process UNSPSC code';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      if (window.antdMessageApi) {
        window.antdMessageApi.error(errorMsg);
      } else {
        console.error(errorMsg);
      }
    } finally {
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  // Handle manual input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If the input is cleared, call onChange with empty values
    if (!newValue || newValue.trim() === '') {
      if (onChange) {
        onChange('', null);
      }
      return;
    }
    
    // If the input is a valid 8-digit code or formatted path, process it after a longer delay
    // to avoid excessive API calls while typing
    if (/^\d{8}$/.test(newValue.trim()) || /^\d{2}\/\d{2}\/\d{2}\/\d{2}$/.test(newValue.trim())) {
      const timer = setTimeout(() => {
        // Skip if loading to prevent parallel requests
        if (!loading) {
          processDirectInput();
        }
      }, 800); // Increased delay to reduce API calls while typing
      
      return () => clearTimeout(timer);
    }
  };
  
  // Handle selection from AI search
  const handleAiSelect = (result) => {
    if (result && result.code) {
      setInputValue(result.code);
      if (onChange) {
        onChange(result.code, result); // Pass both code and full result
      }
      setShowAiSearch(false);
    }
  };
  
  return (
    <div className="unspsc-simple-input">
      <Space direction="vertical" style={{ width: '100%' }}>        <div style={{ marginBottom: '8px' }}>
          <Title level={5}>
            UNSPSC Code
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Title>
        </div>
        
        <Space.Compact style={{ width: '100%' }}>          <Input            value={inputValue}
            onChange={handleInputChange}
            onBlur={processDirectInput}
            onPressEnter={processDirectInput}
            placeholder={placeholder}
            allowClear
            disabled={loading}
            suffix={loading ? <LoadingOutlined /> : null}
          />          <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={() => setShowAiSearch(!showAiSearch)}
              loading={loading}
              disabled={loading}
            >
              AI Search
            </Button>
        </Space.Compact>
        
        <div>
          <Text type="secondary">
            <small>
              Format: Direct code (e.g., 43211706) or path (e.g., 43/21/17/06 for Computer monitors)
            </small>
          </Text>
        </div>
        
        {showAiSearch && (
          <div className="unspsc-ai-search-container" style={{ marginTop: '16px' }}>
            <UnspscAiSearch onSelect={handleAiSelect} />
          </div>
        )}
      </Space>
    </div>
  );
};

export default UnspscSimpleInput;
