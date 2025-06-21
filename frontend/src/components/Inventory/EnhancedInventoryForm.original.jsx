import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, InputNumber, Select, Typography, Spin, message, Tooltip, Modal, Button, Space, Divider, Row, Col } from 'antd';
import { InfoCircleOutlined, EditOutlined, SearchOutlined, PlusOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import inventoryService from '@/services/inventoryService';
import warehouseService from '@/services/warehouseService';
import UnspscSimpleInput from '@/components/UnspscSimpleInput/UnspscSimpleInput';
import apiClient from '@/api/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function EnhancedInventoryForm({ isUpdateForm = false, current = {} }) {
  const translate = useLanguage();
  const [itemMasters, setItemMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemMaster, setSelectedItemMaster] = useState(null);
  
  // Modal states
  const [longDescModalVisible, setLongDescModalVisible] = useState(false);
  const [longDescription, setLongDescription] = useState('');

  // Filter states
  const [itemMasterSearchText, setItemMasterSearchText] = useState('');
  const [filteredItemMasters, setFilteredItemMasters] = useState([]);
  
  // Warehouse states
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [selectedStorageLocation, setSelectedStorageLocation] = useState(null);
  const [loadingBinLocations, setLoadingBinLocations] = useState(false);
  
  // Added state for bin location text to support the renamed field
  const [selectedBinLocation, setSelectedBinLocation] = useState(null);
  
  // UNSPSC information state
  const [unspscDescription, setUnspscDescription] = useState('');
  const [unspscLoading, setUnspscLoading] = useState(false);
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  // Fetch UNSPSC description for a given code
  const fetchUnspscDescription = useCallback(async (unspscCode) => {
    // Skip if the component is unmounted
    if (!isMounted.current) return;
    
    // Skip if no code or invalid code length
    if (!unspscCode || unspscCode.length < 8) return;
    
    // Skip if we're already loading
    if (unspscLoading) return;
    
    // Format UNSPSC code if it's just digits
    let formattedCode = unspscCode;
    if (/^\d{8}$/.test(unspscCode)) {
      // Format it as a path with slashes for better readability
      const segment = unspscCode.substring(0, 2);
      const family = unspscCode.substring(2, 4);
      const classCode = unspscCode.substring(4, 6);
      const commodity = unspscCode.substring(6, 8);
      formattedCode = `${segment}/${family}/${classCode}/${commodity}`;
    }
    
    // Set a local variable to track if this particular request is still relevant
    const requestId = Date.now();
    const currentRequestId = requestId;
    
    setUnspscLoading(true);
    try {
      console.log('Fetching UNSPSC description for:', formattedCode);
      const response = await apiClient.post('/unspsc/direct', { 
        input: formattedCode 
      });
      
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        if (response.data?.success && response.data?.data) {
          const result = response.data.data;
          setUnspscDescription(result.title || '');
        } else {
          setUnspscDescription('');
          console.error('Failed to fetch UNSPSC description');
        }
      }
    } catch (error) {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        console.error('Error fetching UNSPSC description:', error);
        setUnspscDescription('');
      }
    } finally {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        setUnspscLoading(false);
      }
    }
  }, [unspscLoading]); // Only depends on unspscLoading state
  
  // Handle UNSPSC code changes
  const handleUnspscChange = useCallback((value, result) => {
    // Skip if component is unmounted
    if (!isMounted.current) return;
    
    if (result && result.title) {
      // If we have a result with title, use it directly
      setUnspscDescription(result.title);
    } else if (value && value.length >= 8 && !unspscLoading) {
      // If we only have the code but no result object with title,
      // fetch the description - but add debouncing
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          fetchUnspscDescription(value);
        }
      }, 300); // 300ms debounce
      
      // Return cleanup function
      return () => clearTimeout(timeoutId);
    } else if (!value) {
      // Clear the description if value is empty
      setUnspscDescription('');
    }
  }, [fetchUnspscDescription, unspscLoading]); // Add proper dependencies

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        // Fetch item masters
        const itemMastersResponse = await inventoryService.getItemMasters();
        if (itemMastersResponse.success) {
          setItemMasters(itemMastersResponse.data);
          setFilteredItemMasters(itemMastersResponse.data);
        } else {
          message.error('Failed to load item masters');
        }

        // Fetch storage locations
        const storageLocationsResponse = await warehouseService.getStorageLocations();
        if (storageLocationsResponse.success) {
          setStorageLocations(storageLocationsResponse.data);
          
          // If in update mode and we have a storage location, load the bin locations
          if (isUpdateForm && current && current.storageLocationId) {
            setSelectedStorageLocation(current.storageLocationId);
            
            const binLocationsResponse = await warehouseService.getBinLocations(current.storageLocationId);
            if (binLocationsResponse.success) {
              setBinLocations(binLocationsResponse.data);
              
              // If we have a bin location, set it as selected
              if (current.binLocationId) {
                const selectedBin = binLocationsResponse.data.find(bin => bin.id === current.binLocationId);
                setSelectedBinLocation(selectedBin);
              }
            }
          }
        } else {
          message.error('Failed to load storage locations');
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        message.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [isUpdateForm, current]);  // Fetch UNSPSC description when in update mode
  useEffect(() => {
    // Don't create a local isMounted flag - use the ref instead
    
    if (isUpdateForm && current && current.unspscCode && isMounted.current) {
      // Use a timeout to prevent immediate state updates that could cause infinite loops
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          // Only fetch if not already loading and we have a code
          if (!unspscLoading && current.unspscCode) {
            fetchUnspscDescription(current.unspscCode);
          }
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    
    // No need for local isMounted cleanup - we're using the ref
  }, [isUpdateForm, current?.id, current?.unspscCode, fetchUnspscDescription, unspscLoading]); // Include fetchUnspscDescription and unspscLoading

  // Reset UNSPSC description when component unmounts
  useEffect(() => {
    return () => {
      setUnspscDescription('');
    };
  }, []);

  // Filter item masters based on search text
  useEffect(() => {
    if (!itemMasterSearchText) {
      setFilteredItemMasters(itemMasters);
      return;
    }
    
    const filtered = itemMasters.filter(
      item => 
        (item.itemNumber && item.itemNumber.toLowerCase().includes(itemMasterSearchText.toLowerCase())) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(itemMasterSearchText.toLowerCase())) ||
        (item.manufacturerPartNumber && item.manufacturerPartNumber.toLowerCase().includes(itemMasterSearchText.toLowerCase()))
    );
    
    setFilteredItemMasters(filtered);
  }, [itemMasterSearchText, itemMasters]);  // Handle item master selection
  const handleItemMasterChange = async (value) => {
    if (!value) return;
    
    setLoading(true);
    try {
      // First, try to find the item in the already loaded items
      let selected = itemMasters.find(item => item.id === value);
      
      // If not found or data is incomplete, make a direct API call
      if (!selected || !selected.shortDescription) {
        console.log('Item master not found in local cache or incomplete, fetching from API...');
        const response = await inventoryService.getItemMaster(value);
        if (response.success) {
          selected = response.data;
          // Update the cache
          const updatedItemMasters = [...itemMasters];
          const existingIndex = updatedItemMasters.findIndex(item => item.id === value);
          if (existingIndex >= 0) {
            updatedItemMasters[existingIndex] = selected;
          } else {
            updatedItemMasters.push(selected);
          }
          setItemMasters(updatedItemMasters);
        } else {
          throw new Error(response.message || 'Failed to fetch item master details');
        }
      }
      
      setSelectedItemMaster(selected);
      
      // Auto-fill form with item master data
      if (selected) {
        // Get the form instance from the FormContext (parent Form component)
        const formInstance = Form.useFormInstance();
        
        // First, reset form validation state for all fields that will be populated
        formInstance.setFields([
          { name: 'shortDescription', errors: [], validating: false },
          { name: 'criticality', errors: [], validating: false },
          { name: 'unspscCode', errors: [], validating: false },
          { name: 'uom', errors: [], validating: false },
          { name: 'unitPrice', errors: [], validating: false }
        ]);
          // Get any existing unit price value before overwriting
        const currentUnitPrice = formInstance.getFieldValue('unitPrice');
        
        // Set default values to avoid validation errors
        // Use strong fallback values for all required fields to ensure they pass validation
        const formData = {
          shortDescription: selected.shortDescription || 'No description available',
          longDescription: selected.longDescription || '',
          manufacturerName: selected.manufacturerName || 'Not specified',
          manufacturerPartNumber: selected.manufacturerPartNumber || 'Not specified',
          uom: selected.uom || 'EA',
          unspscCode: selected.unspscCode || '00000000',
          criticality: selected.criticality || 'MEDIUM',
          equipmentCategory: selected.equipmentCategory || '',
          equipmentSubCategory: selected.equipmentSubCategory || '',
          stockItem: selected.stockItem || false,
          // Only set a default unit price if none exists yet
          unitPrice: currentUnitPrice || 0.01
        };
        
        // Update the form values
        formInstance.setFieldsValue(formData);
          // Set long description for modal if needed
        setLongDescription(selected.longDescription || '');
          // If we have an UNSPSC code, fetch its description
        if (selected.unspscCode && !unspscLoading && isMounted.current) {
          // Add a small delay to prevent immediate state updates that could cause re-render loops
          const timeoutId = setTimeout(() => {
            if (isMounted.current) {
              fetchUnspscDescription(selected.unspscCode);
            }
          }, 300); // Increased delay to avoid re-render loops
          
          // Add cleanup to prevent memory leaks
          return () => clearTimeout(timeoutId);
        }
        
        message.success('Item master details loaded successfully');
          // Force validation to run and clear errors if any still exist
        setTimeout(() => {
          // First try normal validation
          formInstance.validateFields(['shortDescription', 'criticality', 'unspscCode', 'uom', 'unitPrice'])
            .then(() => {
              console.log('Item master field validation successful');
            })
            .catch(errorInfo => {
              console.log('Validation failed after item master selection, clearing errors manually', errorInfo);
              // If validation still fails for any reason, forcefully clear the errors
              // This is a fallback to ensure a good user experience
              formInstance.setFields([
                { name: 'shortDescription', errors: [], touched: true, validating: false },
                { name: 'criticality', errors: [], touched: true, validating: false },
                { name: 'unspscCode', errors: [], touched: true, validating: false },
                { name: 'uom', errors: [], touched: true, validating: false },
                { name: 'unitPrice', errors: [], touched: true, validating: false }
              ]);
            });
        }, 300); // Slightly longer timeout to ensure form has time to process initial values
      } else {
        message.error('Item master data is incomplete or invalid');
      }
    } catch (error) {
      console.error('Error in handleItemMasterChange:', error);
      message.error('Failed to load item details. Please try again.');
    } finally {
      setLoading(false);
    }
  };  // Handle long description modal
  const openLongDescModal = () => {
    // Get the form instance from the FormContext (parent Form component)
    const formInstance = Form.useFormInstance();
    const desc = formInstance.getFieldValue('longDescription') || '';
    setLongDescription(desc);
    setLongDescModalVisible(true);
  };
  const saveLongDescription = () => {
    // Get the form instance from the FormContext (parent Form component)
    const formInstance = Form.useFormInstance();
    formInstance.setFieldsValue({ longDescription });
    setLongDescModalVisible(false);
  };

  // Handle storage location selection
  const handleStorageLocationChange = async (value) => {
    console.log('Storage location selected:', value);
    
    setSelectedStorageLocation(value);
    setBinLocations([]);
    
    if (value) {
      setLoadingBinLocations(true);
      try {
        const response = await warehouseService.getBinLocations(value);
        if (response.success) {
          setBinLocations(response.data);
        } else {
          message.error('Failed to load bin locations');
        }
      } catch (error) {
        console.error('Error fetching bin locations:', error);
        message.error('Failed to load bin locations');
      } finally {
        setLoadingBinLocations(false);
      }
    }
    
    // Clear bin location selection when storage location changes
    const formInstance = Form.useFormInstance();
    formInstance.setFieldsValue({ 
      binLocationId: undefined,
      binLocationText: '' 
    });
    setSelectedBinLocation(null);
  };
  
  // Handle bin location selection
  const handleBinLocationChange = (value) => {
    console.log('Bin location selected:', value);
    
    // Find the selected bin location from the binLocations array
    const selectedBin = binLocations.find(bin => bin.id === value);
    setSelectedBinLocation(selectedBin);
    
    // Set the bin location text in the form
    if (selectedBin) {
      const formInstance = Form.useFormInstance();
      formInstance.setFieldsValue({ 
        binLocationText: `${selectedBin.code} - ${selectedBin.description}` 
      });
    }
  };  // Fetch UNSPSC description for a given code
  const fetchUnspscDescription = useCallback(async (unspscCode) => {
    // Skip if the component is unmounted
    if (!isMounted.current) return;
    
    // Skip if no code or invalid code length
    if (!unspscCode || unspscCode.length < 8) return;
    
    // Skip if we're already loading
    if (unspscLoading) return;
    
    // Format UNSPSC code if it's just digits
    let formattedCode = unspscCode;
    if (/^\d{8}$/.test(unspscCode)) {
      // Format it as a path with slashes for better readability
      const segment = unspscCode.substring(0, 2);
      const family = unspscCode.substring(2, 4);
      const classCode = unspscCode.substring(4, 6);
      const commodity = unspscCode.substring(6, 8);
      formattedCode = `${segment}/${family}/${classCode}/${commodity}`;
    }
    
    // Set a local variable to track if this particular request is still relevant
    const requestId = Date.now();
    const currentRequestId = requestId;
    
    setUnspscLoading(true);
    try {
      console.log('Fetching UNSPSC description for:', formattedCode);
      const response = await apiClient.post('/unspsc/direct', { 
        input: formattedCode 
      });
      
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        if (response.data?.success && response.data?.data) {
          const result = response.data.data;
          setUnspscDescription(result.title || '');
        } else {
          setUnspscDescription('');
          console.error('Failed to fetch UNSPSC description');
        }
      }
    } catch (error) {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        console.error('Error fetching UNSPSC description:', error);
        setUnspscDescription('');
      }
    } finally {
      // Only update state if component is still mounted and this is still the most recent request
      if (isMounted.current && currentRequestId === requestId) {
        setUnspscLoading(false);
      }
    }
  }, [unspscLoading]); // Only depends on unspscLoading state
    // Handle UNSPSC code changes
  const handleUnspscChange = useCallback((value, result) => {
    // Skip if component is unmounted
    if (!isMounted.current) return;
    
    if (result && result.title) {
      // If we have a result with title, use it directly
      setUnspscDescription(result.title);
    } else if (value && value.length >= 8 && !unspscLoading) {
      // If we only have the code but no result object with title,
      // fetch the description - but add debouncing
      const timeoutId = setTimeout(() => {
        if (isMounted.current) {
          fetchUnspscDescription(value);
        }
      }, 300); // 300ms debounce
      
      // Return cleanup function
      return () => clearTimeout(timeoutId);
    } else if (!value) {
      // Clear the description if value is empty
      setUnspscDescription('');
    }
  }, [fetchUnspscDescription, unspscLoading]); // Add proper dependencies

  // Render dropdown options for item masters with categorization
  const renderItemMasterOptions = () => {
    if (!filteredItemMasters.length) {
      return (
        <Option value="no-results" disabled>
          No items found
        </Option>
      );
    }

    // Group by equipment category
    const groupedItems = {};
    filteredItemMasters.forEach(item => {
      const category = item.equipmentCategory || 'Other';
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });

    return Object.entries(groupedItems).map(([category, items]) => (
      <Select.OptGroup label={category} key={category}>
        {items.map(item => (
          <Option key={item.id} value={item.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{item.itemNumber}</strong> - {item.shortDescription}</span>
              <span style={{ color: '#888' }}>{item.manufacturerPartNumber}</span>
            </div>
          </Option>
        ))}
      </Select.OptGroup>
    ));
  };
  
  return (
    <Spin spinning={loading}>
      <Title level={4}>{translate('Item Selection')}</Title>
      
      <Row gutter={16}>
        <Col span={20}>
          <Form.Item
            label={translate('Item Master')}
            name="itemMasterId"
            rules={[
              {
                required: true,
                message: translate('Please select an item master'),
              },
            ]}
          >
            <Select
              showSearch
              placeholder={translate('Search for an item by number, description or part number')}
              optionFilterProp="children"
              onChange={handleItemMasterChange}
              onSearch={setItemMasterSearchText}
              filterOption={false}
            >
              {renderItemMasterOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label={" "} colon={false}>
            <Link to="/item-master/new">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                style={{ marginTop: '5px' }}
              >
                {translate('New')}
              </Button>
            </Link>
          </Form.Item>
        </Col>
      </Row>
      
      {selectedItemMaster && (
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <Text strong>{translate('Selected Item')}:</Text> {selectedItemMaster.itemNumber} - {selectedItemMaster.shortDescription}<br />
          <Text strong>{translate('Manufacturer')}:</Text> {selectedItemMaster.manufacturerName || '-'} {selectedItemMaster.manufacturerPartNumber ? `- ${selectedItemMaster.manufacturerPartNumber}` : ''}<br />
          <Text strong>{translate('UOM')}:</Text> {selectedItemMaster.uom || '-'}<br />
          <Text strong>{translate('UNSPSC')}:</Text> {selectedItemMaster.unspscCode || '-'} {unspscDescription ? `- ${unspscDescription}` : ''}<br />
          <Text strong>{translate('Criticality')}:</Text> {selectedItemMaster.criticality || '-'}
        </div>
      )}
      
      <Divider />
      
      <Title level={4}>{translate('Inventory Details')}</Title>
      
      <Form.Item
        label={translate('Inventory Number')}
        name="inventoryNumber"
        tooltip={isUpdateForm ? null : translate('Will be auto-generated if left empty')}
      >
        <Input placeholder={translate('Auto-generated')} disabled={isUpdateForm} />
      </Form.Item>      <Form.Item
        label={
          <span>
            {translate('Short Description')}
            <Tooltip title={translate('Maximum 44 characters')}>
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </span>
        }
        name="shortDescription"
        rules={[
          {
            required: true,
            max: 44,
            validator: (_, value) => {
              if (value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Description is required (max 44 characters)')));
            },
          },
        ]}
        extra={
          <Tooltip title={translate("View detailed description")}>
            <Button type="link" onClick={openLongDescModal} icon={<EditOutlined />}>
              {translate("Long Description")}
            </Button>
          </Tooltip>
        }
        tooltip={translate('Auto-populated from Item Master')}
      >
        <Input placeholder={translate('Auto-populated from Item Master')} maxLength={44} disabled={!!selectedItemMaster} />
      </Form.Item>
      
      <Form.Item name="longDescription" hidden>
        <Input />
      </Form.Item>        <Form.Item
        label={translate('Criticality')}
        name="criticality"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              // Always resolve when an item master is selected
              if (selectedItemMaster || value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(translate('Criticality is required')));
            },
          },
        ]}
        tooltip={translate('Auto-populated from Item Master')}
      >
        <Select placeholder={translate('Auto-populated from Item Master')} disabled={!!selectedItemMaster}>
          <Select.Option value="HIGH">High critical</Select.Option>
          <Select.Option value="MEDIUM">Medium critical</Select.Option>
          <Select.Option value="LOW">Low critical</Select.Option>
          <Select.Option value="NO">Non-critical</Select.Option>
        </Select>
      </Form.Item>      <Form.Item
        label={translate('UNSPSC Code')}
        name="unspscCode"
        rules={[
          {
            validator: (_, value) => {
              // Always validate successfully when an item master is selected
              // or when a value is provided
              if (selectedItemMaster || value) {
                return Promise.resolve();
              }
              // Only enforce validation when no item master is selected
              return Promise.resolve();
            },
          },
        ]}
        tooltip={translate('Auto-populated from Item Master')}
        extra={
          <Text type="secondary">
            {unspscLoading ? <Spin size="small" /> : unspscDescription}
          </Text>
        }
      >
        <UnspscSimpleInput 
          placeholder={translate("Auto-populated from Item Master")} 
          disabled={!!selectedItemMaster}
          onChange={handleUnspscChange}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Manufacturer Name')}
            name="manufacturerName"
          >
            <Input placeholder={translate('Enter manufacturer name')} disabled={!!selectedItemMaster} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Manufacturer Part Number')}
            name="manufacturerPartNumber"
          >            <Input placeholder={translate('Enter manufacturer part number')} disabled={!!selectedItemMaster} />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={4}>{translate('Stock Information')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Physical Balance')}
            name="physicalBalance"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Physical balance cannot be negative')
              }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>        <Col span={12}>          <Form.Item
            label={translate('Unit of Measure')}
            name="uom"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  // Always resolve when an item master is selected
                  if (selectedItemMaster || value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('Unit of Measure is required')));
                },
              },
            ]}
            tooltip={translate('Auto-populated from Item Master')}
          >
            <Select placeholder={translate('Auto-populated from Item Master')} disabled={!!selectedItemMaster}>
              <Select.Option value="EA">EA (Each)</Select.Option>
              <Select.Option value="PCS">PCS (Pieces)</Select.Option>
              <Select.Option value="KG">KG (Kilograms)</Select.Option>
              <Select.Option value="LTR">LTR (Liters)</Select.Option>
              <Select.Option value="M">M (Meters)</Select.Option>
              <Select.Option value="SET">SET (Set)</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={translate('Unit Price')}
            name="unitPrice"
            rules={[
              {
                required: true,
                message: translate('Unit price is required'),
              },
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
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Condition')}
            name="condition"
            initialValue="A"
          >
            <Select placeholder={translate('Select condition')}>
              <Select.Option value="A">A - New</Select.Option>
              <Select.Option value="B">B - Used</Select.Option>
              <Select.Option value="C">C - Requires inspection</Select.Option>
              <Select.Option value="D">D - Requires repair</Select.Option>
              <Select.Option value="E">E - Scrap</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Divider />
      
      <Title level={4}>{translate('Stock Level Settings')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                {translate('Minimum Level (ROP)')}
                <Tooltip title={translate('Reorder Point')}>
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="minimumLevel"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Minimum level cannot be negative')
              }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={translate('Maximum Level')}
            name="maximumLevel"
            initialValue={0}
            rules={[
              {
                type: 'number',
                min: 0,
                message: translate('Maximum level cannot be negative')
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('minimumLevel') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('Maximum level must be greater than or equal to minimum level')));
                },
              }),
            ]}
          >          <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
        
      <Divider />
      
      <Title level={4}>{translate('Location Information')}</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                <EnvironmentOutlined style={{ marginRight: 5, color: '#1890ff' }} />
                {translate('Storage Location')}
              </span>
            }
            name="storageLocationId"
            tooltip={translate('Physical location where the item is stored')}
            rules={[
              {
                required: true,
                message: translate('Please select a storage location')
              }
            ]}
          >
            <Select 
              placeholder={translate('Select a storage location')}
              allowClear
              showSearch
              loading={loading}
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={handleStorageLocationChange}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={storageLocations.map(location => ({
                label: `${location.code} - ${location.description}`,
                value: location.id
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <span>
                <InboxOutlined style={{ marginRight: 5, color: '#1890ff' }} />
                {translate('Bin Location')}
              </span>
            }
            name="binLocationId"
            tooltip={translate('Specific bin location within the selected storage location')}
          >
            <Select 
              placeholder={
                !selectedStorageLocation 
                  ? translate('Please select a storage location first')
                  : translate('Select a bin location')
              }
              allowClear
              showSearch
              disabled={!selectedStorageLocation}
              loading={loadingBinLocations}
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={handleBinLocationChange}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              options={binLocations.map(bin => ({
                label: `${bin.code} - ${bin.description}`,
                value: bin.id
              }))}
            />
          </Form.Item>
          
          {/* Hidden field to store the bin location text */}
          <Form.Item name="binLocationText" hidden>
            <Input />
          </Form.Item>
        </Col>
      </Row>
        
        <Divider />
        {/* Location Information section has been removed */}
        <Modal
        title={translate("Long Description")}
        open={longDescModalVisible}
        onOk={saveLongDescription}
        onCancel={() => setLongDescModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setLongDescModalVisible(false)}>
            {translate("Close")}
          </Button>,
          !selectedItemMaster && (
            <Button key="save" type="primary" onClick={saveLongDescription}>
              {translate("Save")}
            </Button>
          )
        ].filter(Boolean)}
      >
        <Input.TextArea
          rows={10}
          value={longDescription}
          onChange={(e) => !selectedItemMaster && setLongDescription(e.target.value)}
          placeholder={translate("Enter detailed item description")}
          readOnly={!!selectedItemMaster}
        />
      </Modal>
    </Spin>
  );
}
