import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, DatePicker, Table, InputNumber, Card, Alert, Divider, Modal, Spin, Tabs, Tag, Tooltip, Typography, Badge, Row, Col, Space, Upload, App, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SearchOutlined, InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, CameraOutlined, RobotOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import axios from 'axios';
import apiClient from '@/api/axiosConfig';
import { API_BASE_URL } from '@/config/serverApiConfig';
import moment from 'moment';
import inventoryItemsService from '@/services/inventoryItemsService';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

function PurchaseRequisitionCreateSimple() {
  const { message } = App.useApp(); // Use App's message hook
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);  const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);
  const [advancedSearchParams, setAdvancedSearchParams] = useState({
    description: '',
    inventoryNumber: '',
    manufacturerName: '',
    criticality: '',
    belowMinimum: false
  });
  const [activeSearchTab, setActiveSearchTab] = useState('1');
  const [photoAnalysis, setPhotoAnalysis] = useState({
    analyzing: false,
    result: null,
    error: null
  });  const [aiAssistant, setAiAssistant] = useState({
    generating: false,
    result: '',
    visible: false,
    type: null // Track what type of AI generation is happening
  });  const [commentsValue, setCommentsValue] = useState(''); // Add state for comments
  const [justificationValue, setJustificationValue] = useState(''); // Add state for justification  const [availableUsers, setAvailableUsers] = useState([]); // Add state for users (approvers)
  const cameraInputRef = useRef(null);
  const [availableUOMs, setAvailableUOMs] = useState([
    { value: 'EA', label: 'Each (EA)' },
    { value: 'BOX', label: 'Box (BOX)' },
    { value: 'KG', label: 'Kilogram (KG)' },
    { value: 'LTR', label: 'Liter (LTR)' },
    { value: 'M', label: 'Meter (M)' },
    { value: 'CM', label: 'Centimeter (CM)' },
    { value: 'PC', label: 'Piece (PC)' },
    { value: 'SET', label: 'Set (SET)' }  ]);  

  // Load users on component mount
  useEffect(() => {
    loadAvailableUsers();
  }, []);

  // Form validation helper
  const validateForm = () => {
    const formValues = form.getFieldsValue();
    const errors = [];
    
    // Check required fields
    if (!formValues.description?.trim()) {
      errors.push(translate('Description is required'));
    }
    if (!formValues.costCenter) {
      errors.push(translate('Cost Center is required'));
    }
    if (!formValues.requiredDate) {
      errors.push(translate('Required Date is required'));
    }
    if (!formValues.priority) {
      errors.push(translate('Priority is required'));
    }    if (!formValues.justification?.trim()) {
      errors.push(translate('Justification is required'));
    }
    if (!formValues.approverId) {
      errors.push(translate('Approver is required'));
    }
    
    // Check items
    if (items.length === 0) {
      errors.push(translate('At least one item is required'));
    }
    
    const itemErrors = items.filter(item => 
      !item.itemName?.trim() || !item.description?.trim() || !item.quantity || item.quantity <= 0
    );
    
    if (itemErrors.length > 0) {
      errors.push(translate(`${itemErrors.length} items have missing or invalid data`));
    }
    
    return errors;
  };

  // Add new item to the list
  const addItem = () => {
    const newItem = {
      key: Date.now(),
      itemName: '',
      description: '',
      quantity: 1,
      uom: 'EA',
      price: 0,
      inventoryId: null,
      itemMasterId: null
    };
      setItems([...items, newItem]);
  };
  // Load available users for approver selection
  const loadAvailableUsers = async () => {
    try {
      const response = await apiClient.get('/user?role=manager,admin,procurement_manager,warehouse_manager&status=active');
      
      if (response.data.success) {
        const users = (response.data.data || []).map(user => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName} (${user.email})`,
          role: user.role,
          department: user.department
        }));
        setAvailableUsers(users);
      } else {
        console.error('Failed to load users:', response.data.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load all approved item master items when modal opens
  const loadAllCatalogItems = async () => {
    console.log('🔍 loadAllCatalogItems called');
    setSearchLoading(true);    try {
      // Use axios directly to call the correct API endpoint for approved items with pricing
      console.log('📡 Making API call to /item?filter=approved...');
      const response = await apiClient.get('/item?filter=approved&page=1&limit=100&includePricing=true');
      console.log('📡 API Response:', response.data);
      
      if (response.data.success) {
        // Convert Item Master items to expected format with pricing info
        const approvedItems = (response.data.data || []).map(item => ({
          id: item.id,
          itemNumber: item.itemNumber,
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          standardDescription: item.standardDescription,
          manufacturerName: item.manufacturerName,
          manufacturerPartNumber: item.manufacturerPartNumber,
          uom: item.uom,
          equipmentCategory: item.equipmentCategory,
          equipmentSubCategory: item.equipmentSubCategory,
          criticality: item.criticality,
          stockItem: item.stockItem,
          status: item.status,
          // Pricing information
          contractPrice: item.contractPrice || null,
          lastPurchasePrice: item.lastPurchasePrice || null,
          supplierName: item.supplierName || '',
          contractNumber: item.contractNumber || '',
          quantityPerKg: item.quantityPerKg || null,
          quantityPerCubicMeter: item.quantityPerCubicMeter || null,
          // Add itemMaster reference for compatibility
          itemMaster: {
            itemNumber: item.itemNumber,
            shortDescription: item.shortDescription,
            longDescription: item.longDescription,
            uom: item.uom,
            manufacturerName: item.manufacturerName,
            manufacturerPartNumber: item.manufacturerPartNumber
          }
        }));
        
        console.log('✅ Processed approved items:', approvedItems.length);
        setInventoryItems(approvedItems);
        if (approvedItems.length === 0) {
          console.log('⚠️ No approved items found');
          message.info('No approved items found in the system.');
        } else {
          console.log('✅ Items loaded successfully:', approvedItems.length);
          message.success(`Loaded ${approvedItems.length} approved items`);
        }
      } else {
        console.log('❌ API response not successful:', response.data);
        message.error(response.data.message || 'Failed to load approved items');
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading approved items:', error);
      console.error('❌ Error details:', error.response?.data);
      message.error(`Error loading approved items: ${error.message}`);
      setInventoryItems([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Open inventory modal and load all items
  const openInventoryModal = () => {
    console.log('🔍 openInventoryModal called');
    console.log('🔍 Current inventoryModalVisible state:', inventoryModalVisible);
    setInventoryModalVisible(true);
    loadAllCatalogItems(); // Load all items when modal opens
  };
  
  // Add component mount debugging
  React.useEffect(() => {
    console.log('🔍 PurchaseRequisitionCreate component mounted');
    console.log('🔍 openInventoryModal function defined:', typeof openInventoryModal);
  }, []);

  // Search catalog items for requisition
  const searchInventoryItems = async (keyword) => {
    // If no keyword, load all items
    if (!keyword || keyword.trim().length === 0) {
      loadAllCatalogItems();
      return;
    }
    
    if (keyword.trim().length < 2) {
      setInventoryItems([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      // Search approved Item Master items using the API endpoint
      const response = await apiClient.get(`/item?filter=approved&search=${encodeURIComponent(keyword)}&page=1&limit=100`);
      
      if (response.data.success) {
        // Convert Item Master items to expected format
        const searchResults = (response.data.data || []).map(item => ({
          id: item.id,
          itemNumber: item.itemNumber,
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          standardDescription: item.standardDescription,
          manufacturerName: item.manufacturerName,
          manufacturerPartNumber: item.manufacturerPartNumber,
          uom: item.uom,
          equipmentCategory: item.equipmentCategory,
          equipmentSubCategory: item.equipmentSubCategory,
          criticality: item.criticality,
          stockItem: item.stockItem,
          status: item.status,
          // Add itemMaster reference for compatibility
          itemMaster: {
            itemNumber: item.itemNumber,
            shortDescription: item.shortDescription,
            longDescription: item.longDescription,
            uom: item.uom,
            manufacturerName: item.manufacturerName,
            manufacturerPartNumber: item.manufacturerPartNumber
          }
        }));
        
        setInventoryItems(searchResults);        if (searchResults.length === 0) {
          message.info('No approved items found matching your search.');
        }
      } else {
        message.error(response.data.message || 'Failed to search approved items');
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      message.error('Error searching approved items. Please try again.');
      setInventoryItems([]);    } finally {
      setSearchLoading(false);
    }
  };

  // Advanced search for inventory items
  const performAdvancedSearch = async () => {
    setSearchLoading(true);
    try {      // For now, just load all approved items for advanced search
      // TODO: Implement proper advanced search for Item Master items
      loadAllCatalogItems();
    } catch (error) {
      console.error('Error performing advanced search:', error);
      message.error('Error performing advanced search. Please try again.');
      setInventoryItems([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Smart search using AI-enhanced keywords
  const performSmartSearch = async (keywords) => {
    console.log('🧠 Performing smart search with keywords:', keywords);
    setSearchLoading(true);
    
    try {
      // Split keywords and search individually, then combine results
      const keywordList = keywords.split(/[,\s]+/).filter(k => k.trim().length > 2);
      console.log('📋 Keyword list:', keywordList);
        if (keywordList.length === 0) {
        loadAllCatalogItems();
        return;
      }
      
      let allResults = new Map(); // Use Map to avoid duplicates
      let searchAttempts = 0;
      const maxAttempts = Math.min(3, keywordList.length); // Limit search attempts
      
      // Search with individual keywords
      for (let i = 0; i < maxAttempts; i++) {
        const keyword = keywordList[i];
        console.log(`🔍 Searching with keyword ${i + 1}/${maxAttempts}: "${keyword}"`);
        
        try {
          const response = await inventoryItemsService.searchInventoryItems(keyword);
          if (response.success && response.data) {
            response.data.forEach(item => {
              allResults.set(item.id, item);
            });
          }
          searchAttempts++;
        } catch (error) {
          console.error(`Error searching with keyword "${keyword}":`, error);
        }
      }
      
      const combinedResults = Array.from(allResults.values());
      console.log(`✅ Smart search completed: ${combinedResults.length} unique items found from ${searchAttempts} searches`);
      
      setInventoryItems(combinedResults);
      
      if (combinedResults.length === 0) {
        // Fallback to basic search with the first keyword
        console.log('🔄 No results found, trying fallback search...');
        await searchInventoryItems(keywordList[0]);
      } else {
        message.success(`Found ${combinedResults.length} items using AI-enhanced search`);
      }
      
    } catch (error) {
      console.error('❌ Smart search error:', error);
      // Fallback to regular search
      const firstKeyword = keywords.split(/[,\s]+/)[0];
      if (firstKeyword && firstKeyword.length > 2) {
        await searchInventoryItems(firstKeyword);      } else {
        loadAllCatalogItems();
      }
    } finally {
      setSearchLoading(false);
    }
  };
    // Handle inventory item selection
  const handleInventoryItemSelect = (catalogItem) => {
    // Create a new item from the catalog item (Item Master)
    const newItem = {
      key: Date.now(),
      itemName: catalogItem.shortDescription || catalogItem.itemNumber,
      description: catalogItem.longDescription || catalogItem.standardDescription || '',
      quantity: 1,
      uom: catalogItem.uom || 'EA',
      price: catalogItem.contractPrice || catalogItem.lastPurchasePrice || 0,
      inventoryId: null, // This is from Item Master, not inventory
      itemMasterId: catalogItem.id,
      itemNumber: catalogItem.itemNumber,
      manufacturerName: catalogItem.manufacturerName || '',
      manufacturerPartNumber: catalogItem.manufacturerPartNumber || '',
      equipmentCategory: catalogItem.equipmentCategory || '',
      criticality: catalogItem.criticality || '',
      status: catalogItem.status || '',
      // Price information for mastered items
      contractPrice: catalogItem.contractPrice || null,
      lastPurchasePrice: catalogItem.lastPurchasePrice || null,
      supplierName: catalogItem.supplierName || '',
      contractNumber: catalogItem.contractNumber || ''
    };
    
    setItems([...items, newItem]);
    setSelectedInventoryItems([]);
    setInventoryModalVisible(false);
    setSearchKeyword('');
    setInventoryItems([]);
  };
  
  // Handle multiple inventory items selection
  const handleMultipleInventoryItemsSelect = () => {
    if (selectedInventoryItems.length === 0) {
      message.warning('Please select at least one inventory item');
      return;
    }
      const newItems = selectedInventoryItems.map(catalogItem => ({
      key: Date.now() + Math.random(),
      itemName: catalogItem.shortDescription || catalogItem.itemNumber,
      description: catalogItem.longDescription || catalogItem.standardDescription || '',
      quantity: 1,
      uom: catalogItem.uom || 'EA',
      price: catalogItem.contractPrice || catalogItem.lastPurchasePrice || 0,
      inventoryId: null, // This is from Item Master, not inventory
      itemMasterId: catalogItem.id,
      itemNumber: catalogItem.itemNumber,
      manufacturerName: catalogItem.manufacturerName || '',
      manufacturerPartNumber: catalogItem.manufacturerPartNumber || '',
      equipmentCategory: catalogItem.equipmentCategory || '',
      criticality: catalogItem.criticality || '',
      status: catalogItem.status || '',
      // Price information for mastered items
      contractPrice: catalogItem.contractPrice || null,
      lastPurchasePrice: catalogItem.lastPurchasePrice || null,
      supplierName: catalogItem.supplierName || '',
      contractNumber: catalogItem.contractNumber || ''
    }));
    
    setItems([...items, ...newItems]);
    setSelectedInventoryItems([]);
    setInventoryModalVisible(false);
    setSearchKeyword('');
    setInventoryItems([]);
  };
  
  // Handle row selection in inventory items table
  const handleInventoryRowSelection = (selectedRowKeys, selectedRows) => {
    setSelectedInventoryItems(selectedRows);
  };
  
  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    // Debounce search
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      searchInventoryItems(value);
    }, 500);
  };
  
  // Remove item from the list
  const removeItem = (key) => {
    setItems(items.filter(item => item.key !== key));
  };
    // Update item in the list
  const updateItem = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  // Calculate total value
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
  };
  // Define columns for items table
  const columns = [    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      key: 'itemName',
      width: 300,
      render: (text, record) => (
        record.inventoryId ? (
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag color="blue">{record.inventoryNumber}</Tag>
              {record.manufacturerName && (
                <Tag color="purple" style={{ marginTop: '4px' }}>
                  {record.manufacturerName} {record.manufacturerPartNumber && `(${record.manufacturerPartNumber})`}
                </Tag>
              )}
            </div>
          </div>
        ) : (
          <Input
            value={text}
            onChange={(e) => updateItem(record.key, 'itemName', e.target.value)}
            placeholder={translate('Enter item name')}
            required
          />
        )
      )    },    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input
            value={text}
            onChange={(e) => updateItem(record.key, 'description', e.target.value)}
            placeholder={translate('Enter description')}
            disabled={record.inventoryId !== null}
            style={{ flex: 1 }}
          />
          {record.inventoryId === null && (
            <Tooltip title={translate('Generate AI description')}>
              <Button
                type="text"
                size="small"
                icon={<RobotOutlined />}
                loading={aiAssistant.generating}
                onClick={() => generateAIDescription(record.itemName, { quantity: record.quantity })}
                style={{ padding: '0 8px' }}
              />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record) => (
        <Tooltip title={record.physicalBalance !== undefined ? 
          `${translate('Available')}: ${record.physicalBalance}` : ''}>
          <InputNumber
            min={1}
            value={text}
            onChange={(value) => updateItem(record.key, 'quantity', value)}
            style={{ 
              width: '100%', 
              borderColor: record.inventoryId && record.quantity > record.physicalBalance ? '#ff4d4f' : undefined 
            }}
            status={record.inventoryId && record.quantity > record.physicalBalance ? 'error' : undefined}
          />
        </Tooltip>
      )
    },    {
      title: translate('UOM'),
      dataIndex: 'uom',
      key: 'uom',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'uom', value)}
          style={{ width: '100%' }}
          disabled={record.inventoryId !== null}
        >
          {availableUOMs.map(uom => (
            <Option key={uom.value} value={uom.value}>{uom.label}</Option>
          ))}
        </Select>
      )    },    {
      title: translate('Est. Unit Price'),
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (text, record) => {
        const isMasteredItem = record.itemMasterId && record.status === 'APPROVED';
        const hasKnownPrice = record.contractPrice || record.lastPurchasePrice;
        const knownPrice = record.contractPrice || record.lastPurchasePrice || 0;
        
        return (
          <div>
            <InputNumber
              min={0}
              precision={2}
              value={text}
              onChange={(value) => updateItem(record.key, 'price', value)}
              style={{ 
                width: '100%',
                borderColor: isMasteredItem && hasKnownPrice ? '#52c41a' : undefined
              }}
              prefix="$"
              placeholder={hasKnownPrice ? `${knownPrice.toFixed(2)}` : "0.00"}
              disabled={false} // Always enabled for estimates
            />
            {isMasteredItem && hasKnownPrice && (
              <div style={{ fontSize: '8px', color: '#52c41a', marginTop: 2 }}>
                {record.contractPrice ? 
                  `Contract: $${record.contractPrice.toFixed(2)}` : 
                  `Last: $${record.lastPurchasePrice.toFixed(2)}`
                }
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, fontSize: '8px', marginLeft: 4 }}
                  onClick={() => updateItem(record.key, 'price', knownPrice)}
                >
                  Use
                </Button>
              </div>
            )}
            {!isMasteredItem && (
              <div style={{ fontSize: '8px', color: '#999', marginTop: 2 }}>
                Manual estimate
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: translate('Est. Total'),
      key: 'total',
      width: 120,
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.price || 0);
        return (
          <div style={{ fontWeight: 'bold', color: total > 0 ? '#1890ff' : '#999' }}>
            ${total.toFixed(2)}
          </div>
        );
      }
    },
    {
      title: translate('Stock Status'),
      key: 'stockStatus',
      width: 120,
      render: (_, record) => {
        if (!record.inventoryId) return null;
        
        if (record.physicalBalance <= 0) {
          return <Badge status="error" text={translate('Out of Stock')} />;
        } else if (record.physicalBalance < record.minimumLevel) {
          return <Badge status="warning" text={translate('Below Minimum')} />;
        } else {
          return <Badge status="success" text={translate('In Stock')} />;
        }
      }
    },
    {
      title: translate('Actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ];  // Handle form submission
  const handleSubmit = async (values) => {
    // Run comprehensive validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      message.error({
        content: (
          <div>
            <div style={{ marginBottom: 8 }}>{translate('Please fix the following issues:')}</div>
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        duration: 8
      });
      return;
    }
    
    // Check for inventory items with insufficient stock
    const insufficientStockItems = items.filter(
      item => item.inventoryId && item.physicalBalance !== undefined && item.quantity > item.physicalBalance
    );
    
    if (insufficientStockItems.length > 0) {
      // Show warning but allow submission
      Modal.confirm({
        title: translate('Insufficient Stock Warning'),
        content: (
          <div>
            <p>{translate('The following items have insufficient stock:')}</p>
            <ul>
              {insufficientStockItems.map(item => (
                <li key={item.key}>
                  {item.itemName} ({item.inventoryNumber}) - {translate('Requested')}: {item.quantity}, {translate('Available')}: {item.physicalBalance}
                </li>
              ))}
            </ul>
            <p>{translate('Do you want to continue anyway?')}</p>
          </div>
        ),
        onOk: () => submitForm(values),
        onCancel: () => {},
        okText: translate('Continue'),
        cancelText: translate('Cancel'),
      });
      return;
    }
      // No validation issues, proceed with submission
    submitForm(values);
  };
  
  // Actual form submission logic
  const submitForm = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, upload attachments if any
      let uploadedAttachments = [];
      if (values.attachments && values.attachments.length > 0) {
        try {
          console.log('📤 Uploading attachments...');
          const formData = new FormData();
          
          values.attachments.forEach(file => {
            if (file.originFileObj) {
              formData.append('attachments', file.originFileObj);
            }
          });

          const uploadResponse = await apiClient.post('/upload/purchase-requisition/attachments', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data.success) {
            uploadedAttachments = uploadResponse.data.data;
            console.log('✅ Attachments uploaded successfully:', uploadedAttachments);
          } else {
            throw new Error('Failed to upload attachments: ' + uploadResponse.data.message);
          }
        } catch (uploadError) {
          console.error('❌ Attachment upload failed:', uploadError);
          message.error('Failed to upload attachments: ' + uploadError.message);
          setLoading(false);
          return;
        }
      }
      // Make sure costCenter is set (required field)
      if (!values.costCenter) {
        form.setFieldsValue({ costCenter: 'General' });
        values.costCenter = 'General';
      }
      
      // Format data for API
      const processedItems = items.map(item => {        const processedItem = {
          itemName: item.itemName || 'Unnamed Item',
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          uom: item.uom || 'EA',
          unitPrice: parseFloat(item.price) || 0
        };
        
        // Add inventory information if item is from inventory
        if (item.inventoryId) {
          processedItem.inventoryId = item.inventoryId;
          processedItem.itemMasterId = item.itemMasterId;
          processedItem.inventoryNumber = item.inventoryNumber;
        }
        
        return processedItem;
      });      const formData = {
        ...values,
        requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : null,
        // Ensure costCenter is provided (required field)
        costCenter: values.costCenter || 'General',
        // Ensure currency is provided
        currency: values.currency || 'USD',
        // Calculate total value from items
        totalValue: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),        // Items data
        items: processedItems,
        // Attachments data - use uploaded file paths
        attachments: uploadedAttachments || []
      };
        console.log('Submitting purchase requisition:', formData);
      console.log('Status being sent:', formData.status);
      console.log('Items being sent:', processedItems);
      console.log('Selected approver:', values.approverId);
      
      // Find approver details for logging
      const selectedApprover = availableUsers.find(user => user.value === values.approverId);
      if (selectedApprover) {
        console.log('Approver details:', selectedApprover.label);
      }
        try {
        // Add a direct number to fix the null violation issue
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        formData.number = `PR-${moment().format('YYYYMMDD')}-${randomSuffix}`;
        
        // Also add fallback number for backward compatibility
        formData.fallbackNumber = formData.number;        const response = await request.post({
          entity: 'procurement/purchase-requisition',
          jsonData: formData
        });
        
        console.log('Purchase requisition response:', response);
        
        if (response.success) {
          message.success(`${translate('Purchase Requisition')} ${response.result?.number || ''} ${translate('created successfully')}`);
          navigate('/purchase-requisition');
        } else {
          // Handle API error with message
          const errorMsg = response.message || 'Failed to create purchase requisition';
          console.error('API Error:', errorMsg, response);
          message.error(errorMsg);
          setError(errorMsg);
          
          if (response.errorDetails) {
            console.error('Error details:', response.errorDetails);
          }
        }      } catch (apiError) {
        // Handle network or unexpected errors
        console.error('API call error:', apiError);
        
        // Try to extract detailed error if available
        let errorMsg = apiError.message || translate('Error connecting to the server');
        
        // Check for connection errors
        if (apiError.code === 'ERR_NETWORK' || apiError.message?.includes('Network Error')) {
          errorMsg = `Connection error: Cannot connect to the backend server. Make sure the server is running on port 8888.`;
          console.error('Network connection error. Check server status and port configuration.');
        }
        
        // Check for validation errors in the response
        if (apiError.response?.data) {
          const data = apiError.response.data;
          console.log('API Error data:', data);
          
          if (data.validationErrors && data.validationErrors.length > 0) {
            const fields = data.validationErrors.map(err => err.field).join(', ');
            errorMsg = `${data.message || 'Validation error'}: ${fields}`;
          } else if (data.message) {
            errorMsg = data.message;
          }
        }
        
        message.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error creating purchase requisition:', err);
      setError(err.message || translate('Error creating purchase requisition'));
      message.error(err.message || translate('Error creating purchase requisition'));
    } finally {
      setLoading(false);
    }
  };  // Image compression function
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        // Set canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Photo Analysis for Item Recognition
  const handlePhotoCapture = async (file) => {
    console.log('🔍 Starting photo capture analysis with file:', file);
    console.log('📊 Original file size:', Math.round(file.size / 1024), 'KB');
    setPhotoAnalysis({ analyzing: true, result: null, error: null });
    
    try {
      // Compress image before sending
      const compressedFile = await compressImage(file);
      console.log('📊 Compressed file size:', Math.round(compressedFile.size / 1024), 'KB');
      console.log('💰 Size reduction:', Math.round((1 - compressedFile.size / file.size) * 100), '%');
      
      const formData = new FormData();
      formData.append('image', compressedFile, file.name);
        console.log('📤 Sending request to /ai/analyze-item-image');
      console.log('📤 FormData contents:', formData.get('image'));
      
      const response = await apiClient.post('/ai/analyze-item-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('📥 Response received:', response.data);
      
      if (response.data.success) {
        setPhotoAnalysis({ 
          analyzing: false, 
          result: response.data.data, 
          error: null 
        });
          // Auto-search for similar items using individual keywords
        if (response.data.data.suggestedKeywords && response.data.data.suggestedKeywords.length > 0) {
          // Try searching with individual keywords for better results
          const keywords = response.data.data.suggestedKeywords;
          console.log('🔍 Searching with AI keywords:', keywords);
          
          // Start with the first keyword, then expand if needed
          let searchQuery = keywords[0];
          setSearchKeyword(searchQuery);
          
          // Try smart search first with all keywords
          try {
            await performSmartSearch(keywords.join(', '));
          } catch (error) {
            console.log('Smart search failed, falling back to individual keyword search');
            await searchInventoryItems(searchQuery);
          }
        }
        
        message.success('Image analyzed successfully! Searching for similar items...');
      } else {
        setPhotoAnalysis({ 
          analyzing: false, 
          result: null, 
          error: response.data.message 
        });
        message.error('Failed to analyze image: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Photo analysis error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to analyze image';
      setPhotoAnalysis({ 
        analyzing: false, 
        result: null, 
        error: errorMessage
      });
      message.error('Error analyzing image: ' + errorMessage);
    }  };

  // AI Assistant for Description Generation
  const generateAIDescription = async (itemName, context = {}) => {
    setAiAssistant({ generating: true, result: '', visible: true, type: 'description' });
    
    try {
      const response = await apiClient.post('/ai/generate-description', {
        itemName,
        context: {
          department: form.getFieldValue('costCenter'),
          urgency: form.getFieldValue('urgency'),
          quantity: context.quantity || 1,
          ...context
        }
      });
      
      if (response.data.success) {
        setAiAssistant({ 
          generating: false, 
          result: response.data.data.description, 
          visible: true,
          type: 'description'
        });
      } else {
        setAiAssistant({ 
          generating: false, 
          result: '', 
          visible: false,
          type: null
        });
        message.error('Failed to generate description: ' + response.data.message);
      }
    } catch (error) {
      console.error('AI description generation error:', error);
      setAiAssistant({ 
        generating: false, 
        result: '', 
        visible: false,
        type: null
      });      message.error('Error generating description. Please try again.');
    }
  };

  // Generate AI comments for Purchase Requisition
  const generateAIComments = async () => {
    if (items.length === 0) {
      message.warning('Please add some items first before generating comments.');
      return;
    }

    setAiAssistant({ generating: true, result: '', visible: false, type: 'comments' });
    
    try {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      
      const formValues = form.getFieldsValue();
      
      const response = await apiClient.post('/ai/generate-pr-comments', {
        items: items.map(item => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity
        })),
        department: formValues.costCenter,
        urgency: formValues.urgency || 'Normal',
        totalAmount: totalAmount,
        context: {
          projectName: formValues.projectName,
          costCenter: formValues.costCenter,
          requiredDate: formValues.requiredDate?.format('YYYY-MM-DD')
        }
      });      if (response.data.success) {
        const generatedComments = response.data.data.comments;
        
        console.log('✅ AI Comments generated:', generatedComments);
        
        // Update both state and form
        setCommentsValue(generatedComments);
        form.setFieldsValue({ comments: generatedComments });
        
        // Force trigger validation to update the field
        form.validateFields(['comments']).catch(() => {});
        
        setAiAssistant({ 
          generating: false, 
          result: generatedComments, 
          visible: false,
          type: null
        });
        
        message.success('AI comments generated and added to form!');
      } else {
        setAiAssistant({ 
          generating: false, 
          result: '', 
          visible: false,
          type: null
        });
        message.error('Failed to generate comments: ' + response.data.message);
      }
    } catch (error) {
      console.error('AI comments generation error:', error);
      setAiAssistant({ 
        generating: false, 
        result: '', 
        visible: false,
        type: null
      });      message.error('Error generating comments. Please try again.');    }
  };

  // Generate AI justification for Purchase Requisition
  const generateAIJustification = async () => {
    if (items.length === 0) {
      message.warning('Please add some items first before generating justification.');
      return;
    }

    setAiAssistant({ generating: true, result: '', visible: false, type: 'justification' });
    
    try {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      
      const formValues = form.getFieldsValue();
      
      const response = await apiClient.post('/ai/generate-pr-justification', {
        items: items.map(item => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          criticality: item.criticality,
          category: item.equipmentCategory
        })),
        department: formValues.costCenter,
        priority: formValues.priority,
        totalAmount: totalAmount,
        requiredDate: formValues.requiredDate?.format('YYYY-MM-DD'),
        context: {
          costCenter: formValues.costCenter,
          description: formValues.description
        }
      });      if (response.data.success) {
        const generatedJustification = response.data.data.justification;
        
        console.log('✅ AI Justification generated:', generatedJustification);
        
        // Update both state and form
        setJustificationValue(generatedJustification);
        form.setFieldsValue({ justification: generatedJustification });
        
        // Force trigger validation to update the field
        form.validateFields(['justification']).catch(() => {});
        
        setAiAssistant({ 
          generating: false, 
          result: generatedJustification, 
          visible: false,
          type: null
        });
        
        message.success('AI justification generated and added to form!');
      } else {
        setAiAssistant({ 
          generating: false, 
          result: '', 
          visible: false,
          type: null
        });
        message.error('Failed to generate justification: ' + response.data.message);
      }
    } catch (error) {
      console.error('AI justification generation error:', error);
      setAiAssistant({ 
        generating: false, 
        result: '', 
        visible: false,
        type: null
      });
      message.error('Error generating justification. Please try again.');
    }
  };

  // Enhanced Natural Language Search
  const handleNaturalLanguageSearch = async (query) => {
    if (!query || query.length < 3) return;
    
    setSearchLoading(true);
    try {      const response = await apiClient.post('/ai/smart-search', {
        query,
        context: {
          department: form.getFieldValue('costCenter'),
          userHistory: true // Include user's previous orders
        }
      });
      
      if (response.data.success) {
        setInventoryItems(response.data.data.items || []);
        if (response.data.data.suggestions) {
          message.info(`Found ${response.data.data.items.length} items. ${response.data.data.suggestions}`);
        }
      } else {
        // Fallback to regular search
        searchInventoryItems(query);
      }
    } catch (error) {
      console.error('Smart search error:', error);
      // Fallback to regular search
      searchInventoryItems(query);
    } finally {
      setSearchLoading(false);
    }
  };
    // Camera file input handler
  const handleCameraInput = (info) => {
    console.log('📸 Camera input received:', info);
    const { file, fileList } = info;
    
    // Check different ways the file might be available
    const actualFile = file?.originFileObj || file;
    console.log('📸 Actual file object:', actualFile);
    console.log('📸 File details:', {
      name: actualFile?.name,
      type: actualFile?.type,
      size: actualFile?.size
    });
    
    if (actualFile) {
      console.log('📸 Calling handlePhotoCapture with file:', actualFile);
      handlePhotoCapture(actualFile);
    } else {
      console.error('❌ No file found in camera input');
    }
  };
  
  return (
    <ErpLayout>
      <div style={{ padding: '0 24px' }}>
        <Card
          title={translate('Create Purchase Requisition')}
          extra={
            <Button onClick={() => navigate('/purchase-requisition')} icon={<ArrowLeftOutlined />}>
              {translate('Back')}
            </Button>
          }
        >
          {error && (
            <Alert
              message={translate('Error')}
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}          <Form
            form={form}
            layout="vertical"
            initialValues={{
              currency: 'USD',
              costCenter: 'General', // Ensure cost center is set by default
              description: 'Purchase Requisition', // Provide default description
              requiredDate: moment().add(7, 'days')
            }}
          >
            <Form.Item
              label={translate('Description')}
              name="description"
              rules={[
                { required: true, message: translate('Please enter a description') }
              ]}
            >
              <TextArea rows={3} />
            </Form.Item>
              <Form.Item
              label={translate('Cost Center')}
              name="costCenter"
              rules={[
                { required: true, message: translate('Please select a cost center') }
              ]}
            >
              <Select 
                placeholder={translate('Select cost center')}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                <Option value="IT-001">IT-001 - Information Technology</Option>
                <Option value="HR-002">HR-002 - Human Resources</Option>
                <Option value="FIN-003">FIN-003 - Finance & Accounting</Option>
                <Option value="OPS-004">OPS-004 - Operations</Option>
                <Option value="MKT-005">MKT-005 - Marketing & Sales</Option>
                <Option value="ENG-006">ENG-006 - Engineering</Option>
                <Option value="QA-007">QA-007 - Quality Assurance</Option>
                <Option value="LOG-008">LOG-008 - Logistics</Option>
                <Option value="HSE-009">HSE-009 - Health, Safety & Environment</Option>
                <Option value="FAC-010">FAC-010 - Facilities Management</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label={translate('Currency')}
              name="currency"
            >
              <Select>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
              </Select>
            </Form.Item>
              <Form.Item
              label={translate('Required Date')}
              name="requiredDate"
              rules={[
                { required: true, message: translate('Please select a required date') }
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < moment().endOf('day')}
                placeholder={translate('Select required date')}
              />
            </Form.Item>
            
            <Form.Item
              label={translate('Priority')}
              name="priority"
              rules={[
                { required: true, message: translate('Please select priority level') }
              ]}
            >
              <Select placeholder={translate('Select priority level')}>
                <Option value="LOW">
                  <Space>
                    <Tag color="green">LOW</Tag>
                    <span>Standard delivery (15+ days)</span>
                  </Space>
                </Option>
                <Option value="MEDIUM">
                  <Space>
                    <Tag color="orange">MEDIUM</Tag>
                    <span>Expedited delivery (7-14 days)</span>
                  </Space>
                </Option>
                <Option value="HIGH">
                  <Space>
                    <Tag color="red">HIGH</Tag>
                    <span>Urgent delivery (1-6 days)</span>
                  </Space>
                </Option>
                <Option value="CRITICAL">
                  <Space>
                    <Tag color="volcano">CRITICAL</Tag>
                    <span>Emergency delivery (Same day)</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
              <Form.Item
              label={translate('Justification')}
              name="justification"
              rules={[
                { required: true, message: translate('Please provide justification for this request') }
              ]}
            >              <div>
                <TextArea 
                  rows={3} 
                  value={justificationValue}
                  onChange={(e) => {
                    setJustificationValue(e.target.value);
                    form.setFieldsValue({ justification: e.target.value });
                  }}
                  placeholder={translate('Explain why these items are needed and the business impact if not approved')}
                  showCount
                  maxLength={500}
                />
                <Button
                  type="dashed"
                  size="small"
                  icon={<RobotOutlined />}
                  style={{ marginTop: 8 }}
                  loading={aiAssistant.generating && aiAssistant.type === 'justification'}
                  onClick={() => generateAIJustification()}
                >
                  {aiAssistant.generating && aiAssistant.type === 'justification' 
                    ? translate('Generating...') 
                    : translate('Generate AI Justification')}
                </Button>              </div>
            </Form.Item>

            <Form.Item
              label={translate('Approver')}
              name="approverId"
              rules={[
                { required: true, message: translate('Please select an approver') }
              ]}
            >
              <Select
                placeholder={translate('Select approver for this requisition')}
                showSearch
                filterOption={(input, option) => {
                  const label = option.children.toLowerCase();
                  return label.indexOf(input.toLowerCase()) >= 0;
                }}
                notFoundContent={availableUsers.length === 0 ? translate('Loading users...') : translate('No users found')}
              >
                {availableUsers.map(user => (
                  <Option key={user.value} value={user.value}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.label}</div>
                      {user.role && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {user.role} {user.department && `- ${user.department}`}
                        </div>
                      )}
                    </div>
                  </Option>
                ))}              </Select>
            </Form.Item>

            <Form.Item
              label={translate('Comments')}
              name="comments"
            >
              <div>
                <TextArea 
                  rows={3} 
                  value={commentsValue}
                  onChange={(e) => {
                    setCommentsValue(e.target.value);
                    form.setFieldsValue({ comments: e.target.value });
                  }}
                  placeholder={translate('Enter comments or click the AI button to generate...')}
                />
                <Button
                  type="dashed"
                  size="small"
                  icon={<RobotOutlined />}
                  style={{ marginTop: 8 }}
                  loading={aiAssistant.generating && aiAssistant.type === 'comments'}
                  onClick={() => generateAIComments()}
                >
                  {aiAssistant.generating && aiAssistant.type === 'comments' 
                    ? translate('Generating...') 
                    : translate('Generate AI Comments')}
                </Button>              </div>
            </Form.Item>            <Form.Item
              label={translate('Attachments')}
              name="attachments"
            >              <Upload
                multiple
                beforeUpload={() => false} // Prevent auto upload, we'll handle manually
                onChange={(info) => {
                  form.setFieldsValue({ attachments: info.fileList });
                }}
                onRemove={(file) => {
                  const newFileList = form.getFieldValue('attachments').filter(f => f.uid !== file.uid);
                  form.setFieldsValue({ attachments: newFileList });
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                maxCount={10}
                showUploadList={{
                  showPreviewIcon: false,
                  showDownloadIcon: false,
                  showRemoveIcon: true,
                }}
              >
                <Button icon={<UploadOutlined />}>
                  {translate('Select Files')}
                </Button>
              </Upload>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                {translate('Supported formats: PDF, Word, Excel, Images, Text files (Max: 10 files, 10MB each)')}
              </div>
            </Form.Item>
              
            <Divider orientation="left">{translate('Items')}</Divider>
            
            {items.length === 0 && (
              <Alert
                message={translate('Add Items to Your Request')}
                description={
                  <div>
                    <p>{translate('Click "Add Item" to search and select items from the approved catalog.')}</p>
                    <ul style={{ marginBottom: 0 }}>
                      <li>{translate('Search by item name, description, or manufacturer')}</li>
                      <li>{translate('Select multiple items at once using checkboxes')}</li>
                      <li>{translate('All items are from the approved Item Master catalog')}</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  <div>
                    <Button type="primary" size="small" onClick={openInventoryModal}>
                      {translate('Add Item')}
                    </Button>
                    <Button 
                      type="default" 
                      size="small" 
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        console.log('🔍 Test button clicked');
                        alert('Test button works! Now testing openInventoryModal...');
                        openInventoryModal();
                      }}
                    >
                      Test
                    </Button>
                  </div>
                }
              />
            )}
            
            <div style={{ 
              width: '100%', 
              overflowX: 'auto',
              overflowY: 'visible'
            }}>
              <Table
              columns={columns}
              dataSource={items}
              rowKey="key"
              pagination={false}              scroll={{ 
                x: 1400, 
                y: 400 
              }}
              locale={{ emptyText: translate('No items added yet') }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{translate('Total')}:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>${calculateTotal().toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>                </Table.Summary.Row>
              )}
            />
            </div>            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={openInventoryModal}
                icon={<SearchOutlined />}
              >
                {translate('Add from Inventory')}
              </Button>
              
              {items.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Alert
                    message={
                      <Space>
                        <InfoCircleOutlined />
                        {translate('Validation Status')}
                      </Space>
                    }
                    description={
                      <>
                        <div>{translate('Items with errors')}:</div>
                        <ul style={{ marginBottom: 0 }}>
                          {items.filter(item => !item.itemName || !item.quantity).length > 0 && (
                            <li>
                              <Text type="danger">
                                {items.filter(item => !item.itemName || !item.quantity).length} {translate('items missing required fields')}
                              </Text>
                            </li>
                          )}
                          {items.filter(item => item.inventoryId && item.physicalBalance !== undefined && item.quantity > item.physicalBalance).length > 0 && (
                            <li>
                              <Text type="warning">
                                {items.filter(item => item.inventoryId && item.physicalBalance !== undefined && item.quantity > item.physicalBalance).length} {translate('items with insufficient stock')}
                              </Text>
                            </li>
                          )}
                          {items.filter(item => 
                            item.inventoryId && 
                            item.physicalBalance !== undefined && 
                            item.physicalBalance > 0 && 
                            item.minimumLevel > 0 && 
                            item.physicalBalance <= item.minimumLevel
                          ).length > 0 && (
                            <li>
                              <Text type="warning">
                                {items.filter(item => 
                                  item.inventoryId && 
                                  item.physicalBalance !== undefined && 
                                  item.physicalBalance > 0 && 
                                  item.minimumLevel > 0 && 
                                  item.physicalBalance <= item.minimumLevel
                                ).length} {translate('items below minimum stock level')}
                              </Text>
                            </li>
                          )}
                          {items.filter(item => 
                            (item.inventoryId === null || item.inventoryId === undefined) && 
                            (!item.price || item.price <= 0)
                          ).length > 0 && (
                            <li>
                              <Text type="warning">
                                {items.filter(item => 
                                  (item.inventoryId === null || item.inventoryId === undefined) && 
                                  (!item.price || item.price <= 0)
                                ).length} {translate('manual items missing price')}
                              </Text>
                            </li>
                          )}
                          {items.length > 0 && 
                           items.filter(item => 
                             !item.itemName || 
                             !item.quantity || 
                             (item.inventoryId && item.physicalBalance !== undefined && item.quantity > item.physicalBalance) ||
                             ((item.inventoryId === null || item.inventoryId === undefined) && (!item.price || item.price <= 0))
                           ).length === 0 && (
                            <li>
                              <Text type="success">
                                <CheckCircleOutlined /> {translate('All items are valid')}
                              </Text>
                            </li>
                          )}
                        </ul>
                      </>
                    }
                    type={
                      items.filter(item => !item.itemName || !item.quantity).length > 0 ? 'error' :
                      items.filter(item => 
                        item.inventoryId && item.physicalBalance !== undefined && item.quantity > item.physicalBalance
                      ).length > 0 ? 'warning' : 'info'
                    }
                  />
                </div>
              )}            </div>
                
            {/* Summary Section */}
            {items.length > 0 && (
              <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f9f9f9' }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        {items.length}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Items')}</div>
                    </div>
                  </Col>                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                        {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Total Qty')}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                        ${items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toFixed(2)}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Est. Total')}</div>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        <Tag color={form.getFieldValue('priority') === 'CRITICAL' ? 'red' : 
                                   form.getFieldValue('priority') === 'HIGH' ? 'orange' : 
                                   form.getFieldValue('priority') === 'MEDIUM' ? 'blue' : 'green'}>
                          {form.getFieldValue('priority') || 'Not Set'}
                        </Tag>
                      </div>
                      <div style={{ color: '#666' }}>{translate('Priority')}</div>
                    </div>                  </Col>
                </Row>
                
                {/* Approver and additional info row */}
                <Row gutter={16} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#722ed1' }}>
                        {(() => {
                          const approverId = form.getFieldValue('approverId');
                          const approver = availableUsers.find(user => user.value === approverId);
                          return approver ? approver.label.split(' (')[0] : 'Not Selected';
                        })()}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Selected Approver')}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#13c2c2' }}>
                        {form.getFieldValue('costCenter') || 'Not Set'}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Cost Center')}</div>
                    </div>
                  </Col>                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>
                        {(() => {
                          const attachments = form.getFieldValue('attachments') || [];
                          return attachments.length;
                        })()}
                      </div>
                      <div style={{ color: '#666' }}>{translate('Attachments')}</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}            <Form.Item>
              <Space size="large">
                <Button
                  type="default"
                  loading={loading}
                  disabled={items.length === 0}
                  onClick={async () => {
                    try {
                      const formValues = await form.validateFields();
                      console.log('🔵 Saving as DRAFT with values:', { ...formValues, status: 'draft' });
                      submitForm({ ...formValues, status: 'draft' });
                    } catch (error) {
                      console.error('Form validation error:', error);
                    }
                  }}
                >
                  {translate('Save as Draft')}
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={items.length === 0}
                  onClick={async () => {
                    try {
                      const formValues = await form.validateFields();
                      console.log('🟢 Submitting for APPROVAL with values:', { ...formValues, status: 'submitted' });
                      submitForm({ ...formValues, status: 'submitted' });
                    } catch (error) {
                      console.error('Form validation error:', error);
                    }
                  }}
                >
                  {translate('Submit for Approval')}
                </Button>
                {form.getFieldValue('priority') === 'CRITICAL' && (
                  <Button
                    type="primary"
                    danger
                    loading={loading}
                    disabled={items.length === 0}
                    onClick={async () => {
                      try {
                        const formValues = await form.validateFields();
                        console.log('🔴 Submitting as URGENT with values:', { ...formValues, status: 'submitted' });
                        submitForm({ ...formValues, status: 'submitted' });
                      } catch (error) {
                        console.error('Form validation error:', error);
                      }
                    }}
                  >
                    {translate('Submit as URGENT')}
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>      {/* Inventory Item Selection Modal */}
      <Modal
        title={translate('Select Item to Request')}
        open={inventoryModalVisible}
        onCancel={() => {
          setInventoryModalVisible(false);
          setSelectedInventoryItems([]);
          setSearchKeyword('');
          setInventoryItems([]);
        }}        footer={[
          <Button key="cancel" onClick={() => {
            setInventoryModalVisible(false);
            setSelectedInventoryItems([]);
            setSearchKeyword('');
            setInventoryItems([]);
          }}>
            {translate('Cancel')}
          </Button>,
          <Button 
            key="select" 
            type="primary" 
            onClick={handleMultipleInventoryItemsSelect}
            disabled={selectedInventoryItems.length === 0}
          >
            {translate('Add Selected Items')} ({selectedInventoryItems.length})
          </Button>,
          selectedInventoryItems.length > 0 && (
            <Button 
              key="clear" 
              onClick={() => setSelectedInventoryItems([])}
            >
              {translate('Clear Selection')}
            </Button>
          )
        ].filter(Boolean)}width="96vw"
        style={{ top: 5, maxWidth: '1800px' }}
        styles={{ 
          body: {
            height: '85vh', 
            maxHeight: '950px',
            overflowY: 'auto',
            padding: '8px'
          }
        }}
      ><Tabs 
          activeKey={activeSearchTab} 
          onChange={setActiveSearchTab}
          items={[            {
              key: "1",
              label: translate('Quick Search'),
              children: (
                <div style={{ marginBottom: 16 }}>
                  <Input
                    placeholder={translate('Search inventory items by description or number...')}
                    value={searchKeyword}
                    onChange={handleSearchInputChange}
                    prefix={<SearchOutlined />}
                    allowClear
                    size="large"
                  />
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {translate('Enter at least 2 characters to search, or click "Show All" to view all items')}
                    </div>                    <Button 
                      type="default" 
                      size="small"
                      onClick={loadAllCatalogItems}
                    >
                      {translate('Show All Items')}
                    </Button>
                  </div>
                </div>
              )
            },
            {
              key: "2",
              label: (
                <span>
                  <CameraOutlined /> {translate('Photo Search')}
                </span>
              ),
              children: (
                <div style={{ marginBottom: 16 }}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={({ file }) => {
                          // Custom upload handler that processes the file directly
                          console.log('📸 Custom upload triggered with file:', file);
                          handlePhotoCapture(file);
                        }}
                        style={{ display: 'block' }}
                      >
                        <Button
                          type="primary"
                          size="large"
                          icon={<CameraOutlined />}
                          loading={photoAnalysis.analyzing}
                          style={{ marginBottom: 16 }}
                        >
                          {photoAnalysis.analyzing ? translate('Analyzing Image...') : translate('Take Photo or Upload Image')}
                        </Button>
                      </Upload>
                      
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 16 }}>
                        {translate('Take a photo of the item you need and AI will find similar items in inventory')}
                      </div>
                        {photoAnalysis.result && (
                        <Alert
                          message={translate('AI Analysis Result')}
                          description={
                            <div>
                              <p><strong>{translate('Detected Item')}:</strong> {photoAnalysis.result.detectedItem}</p>
                              <p><strong>{translate('Category')}:</strong> {photoAnalysis.result.category}</p>
                              {photoAnalysis.result.features && photoAnalysis.result.features.length > 0 && (
                                <p><strong>{translate('Features')}:</strong> {photoAnalysis.result.features.join(', ')}</p>
                              )}
                              <p><strong>{translate('Confidence')}:</strong> {(photoAnalysis.result.confidence * 100).toFixed(1)}%</p>
                              {photoAnalysis.result.suggestedKeywords && photoAnalysis.result.suggestedKeywords.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <strong>{translate('Search Keywords')}:</strong>
                                  <div style={{ marginTop: 4 }}>
                                    {photoAnalysis.result.suggestedKeywords.map((keyword, index) => (
                                      <Button
                                        key={index}
                                        size="small"
                                        type="dashed"
                                        style={{ margin: '2px 4px 2px 0' }}
                                        onClick={() => {
                                          setSearchKeyword(keyword);
                                          searchInventoryItems(keyword);
                                        }}
                                      >
                                        {keyword}
                                      </Button>
                                    ))}
                                  </div>
                                  <Button
                                    size="small"
                                    type="primary"
                                    ghost
                                    icon={<SearchOutlined />}
                                    style={{ marginTop: 8 }}
                                    onClick={() => performSmartSearch(photoAnalysis.result.suggestedKeywords.join(', '))}
                                  >
                                    {translate('Search with All Keywords')}
                                  </Button>
                                </div>
                              )}
                              {photoAnalysis.result.suggestions && (
                                <p style={{ marginTop: 8 }}><strong>{translate('Suggestions')}:</strong> {photoAnalysis.result.suggestions}</p>
                              )}
                            </div>
                          }
                          type="success"
                          style={{ textAlign: 'left', marginTop: 16 }}
                        />
                      )}
                      
                      {photoAnalysis.error && (
                        <Alert
                          message={translate('Analysis Failed')}
                          description={photoAnalysis.error}
                          type="error"
                          style={{ marginTop: 16 }}
                        />
                      )}
                    </div>
                  </Card>
                  
                  {/* Natural Language Search */}
                  <Input
                    placeholder={translate('Or describe what you need in your own words... (e.g., "blue office pens", "wireless mouse for laptop")')}
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      // Use natural language search for better results
                      if (window.smartSearchTimeout) {
                        clearTimeout(window.smartSearchTimeout);
                      }
                      window.smartSearchTimeout = setTimeout(() => {
                        if (e.target.value.length >= 3) {
                          handleNaturalLanguageSearch(e.target.value);
                        }
                      }, 800);
                    }}
                    prefix={<RobotOutlined />}
                    allowClear
                    size="large"
                  />
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    {translate('AI-powered search understands natural language descriptions')}
                  </div>
                </div>
              )
            },
            {
              key: "3",
              label: translate('Advanced Search'),
              children: (
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item label={translate('Inventory Number')}>
                        <Input
                          value={advancedSearchParams.inventoryNumber}
                          onChange={(e) => setAdvancedSearchParams({
                            ...advancedSearchParams,
                            inventoryNumber: e.target.value
                          })}
                          placeholder={translate('Enter inventory number')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={translate('Description')}>
                        <Input
                          value={advancedSearchParams.description}
                          onChange={(e) => setAdvancedSearchParams({
                            ...advancedSearchParams,
                            description: e.target.value
                          })}
                          placeholder={translate('Enter description')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={translate('Manufacturer')}>
                        <Input
                          value={advancedSearchParams.manufacturerName}
                          onChange={(e) => setAdvancedSearchParams({
                            ...advancedSearchParams,
                            manufacturerName: e.target.value
                          })}
                          placeholder={translate('Enter manufacturer name')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={translate('Criticality')}>
                        <Select
                          value={advancedSearchParams.criticality}
                          onChange={(value) => setAdvancedSearchParams({
                            ...advancedSearchParams,
                            criticality: value
                          })}
                          allowClear
                          placeholder={translate('Select criticality')}
                        >
                          <Option value="HIGH">{translate('High')}</Option>
                          <Option value="MEDIUM">{translate('Medium')}</Option>
                          <Option value="LOW">{translate('Low')}</Option>
                          <Option value="NO">{translate('None')}</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Button
                            type="primary"
                            onClick={performAdvancedSearch}
                            icon={<SearchOutlined />}
                            style={{ marginRight: 8 }}
                          >
                            {translate('Search')}
                          </Button>                          <Button
                            onClick={() => {
                              setAdvancedSearchParams({
                                description: '',
                                inventoryNumber: '',
                                manufacturerName: '',
                                criticality: '',
                                belowMinimum: false
                              });
                              setInventoryItems([]);
                            }}
                          >
                            {translate('Clear')}
                          </Button>                          <Button
                            type="default"
                            onClick={loadAllCatalogItems}
                            style={{ marginLeft: 8 }}
                          >
                            {translate('Show All Items')}
                          </Button>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Button
                            type="primary"
                            danger
                            onClick={() => {
                              setAdvancedSearchParams({
                                ...advancedSearchParams,
                                belowMinimum: true
                              });
                              performAdvancedSearch();
                            }}
                            icon={<WarningOutlined />}
                          >
                            {translate('Show Below Minimum')}
                          </Button>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )
            }
          ]}
        />

        {/* Debug info */}
        <div style={{ padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '8px', fontSize: '12px' }}>
          <strong>Debug:</strong> Items loaded: {inventoryItems.length} | Loading: {searchLoading ? 'Yes' : 'No'}
        </div>
        
        {searchLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>{translate('Searching catalog items...')}</div>
          </div>        ) : (          <Table
            dataSource={inventoryItems}
            rowKey="id"            scroll={{ 
              y: 'calc(85vh - 200px)', 
              x: 1000
            }}pagination={{ 
              pageSize: 25, 
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              size: 'small',
              pageSizeOptions: ['10', '25', '50', '100']
            }}
            size="small"
            rowSelection={{
              type: 'checkbox',
              onChange: handleInventoryRowSelection,              selectedRowKeys: selectedInventoryItems.map(item => item.id),
              columnWidth: 35            }}columns={[              {
                title: translate('Item Number'),
                dataIndex: 'itemNumber',
                key: 'itemNumber',
                width: 120,
                fixed: 'left',
                render: (text, record) => (
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '10px' }}>{text}</div>
                    <div style={{ marginTop: 1 }}>
                      <Tag color="green" size="small" style={{ fontSize: '8px' }}>
                        {translate('Approved')}
                      </Tag>
                    </div>
                  </div>
                )
              },              {
                title: translate('Description'),
                dataIndex: 'shortDescription',
                key: 'description',
                width: 160,
                render: (text, record) => (
                  <Tooltip title={`${text || ''} ${record.longDescription ? '- ' + record.longDescription : ''}`}>
                    <div style={{
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      maxHeight: '50px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        fontWeight: '500', 
                        fontSize: '10px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {text || record.standardDescription || 'No description'}
                      </div>
                      {record.longDescription && (
                        <div style={{ 
                          fontSize: '8px', 
                          color: '#666', 
                          marginTop: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {record.longDescription.length > 25 
                            ? record.longDescription.substring(0, 25) + '...' 
                            : record.longDescription}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                ),              },                {
                title: translate('Manufacturer'),
                width: 140,
                render: (_, record) => {
                  const manufacturerName = record.manufacturerName;
                  const partNumber = record.manufacturerPartNumber;
                  
                  if (!manufacturerName && !partNumber) {
                    return <span style={{ fontSize: '9px', color: '#999' }}>No manufacturer info</span>;
                  }
                  
                  return (
                    <Tooltip title={`${manufacturerName || 'Unknown'} ${partNumber ? '(P/N: ' + partNumber + ')' : ''}`}>
                      <div>
                        <div style={{ fontSize: '9px' }}>{manufacturerName || 'Unknown'}</div>
                        {partNumber && (
                          <div style={{ fontSize: '8px', color: '#666' }}>
                            {partNumber.length > 12 ? partNumber.substring(0, 12) + '...' : partNumber}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  );
                }
              },              {
                title: translate('Category'),
                width: 90,
                render: (_, record) => {
                  const category = record.equipmentCategory;
                  const subCategory = record.equipmentSubCategory;
                  
                  if (!category && !subCategory) {
                    return <span style={{ fontSize: '9px', color: '#999' }}>Not assigned</span>;
                  }
                  
                  return (
                    <div>
                      <div style={{ fontSize: '9px' }}>{category || 'Unknown'}</div>
                      {subCategory && (
                        <div style={{ fontSize: '8px', color: '#666' }}>
                          {subCategory.length > 10 ? subCategory.substring(0, 10) + '...' : subCategory}
                        </div>
                      )}
                    </div>
                  );
                }
              },              {
                title: translate('UOM'),
                dataIndex: 'uom',
                key: 'uom',
                width: 50,
                align: 'center',                render: (text) => (
                  <span style={{ fontSize: '9px', fontWeight: '500' }}>
                    {text || 'EA'}
                  </span>
                )
              },              {
                title: translate('Qty/kg & m³'),
                width: 80,
                align: 'center',
                render: (_, record) => {
                  const qtyPerKg = record.quantityPerKg;
                  const qtyPerM3 = record.quantityPerCubicMeter;
                  
                  if (!qtyPerKg && !qtyPerM3) {
                    return <span style={{ fontSize: '8px', color: '#999' }}>Not set</span>;
                  }
                  
                  return (
                    <div style={{ fontSize: '8px' }}>
                      {qtyPerKg && (
                        <div style={{ color: '#1890ff' }}>
                          {parseFloat(qtyPerKg).toFixed(2)}/kg
                        </div>
                      )}
                      {qtyPerM3 && (
                        <div style={{ color: '#52c41a' }}>
                          {parseFloat(qtyPerM3).toFixed(2)}/m³
                        </div>
                      )}
                    </div>
                  );
                }
              },              {
                title: translate('Stock Item'),
                dataIndex: 'stockItem',
                key: 'stockItem',
                width: 60,
                align: 'center',
                render: (text) => {
                  return (
                    <Tag color={text ? 'green' : 'orange'} size="small" style={{ fontSize: '8px' }}>
                      {text ? 'Yes' : 'No'}
                    </Tag>
                  );
                }
              },              {
                title: translate('Criticality'),
                dataIndex: 'criticality',
                width: 70,
                align: 'center',
                render: (text) => {
                  const criticalityMap = {
                    'A': { color: 'red', text: 'Critical' },
                    'B': { color: 'orange', text: 'Important' },
                    'C': { color: 'blue', text: 'Standard' },
                    'D': { color: 'green', text: 'Low' }
                  };
                  
                  if (!text) {
                    return <span style={{ fontSize: '8px', color: '#999' }}>Not set</span>;
                  }
                  
                  const criticality = criticalityMap[text] || { color: 'default', text: text };
                  return (
                    <Tag color={criticality.color} size="small" style={{ fontSize: '8px' }}>
                      {criticality.text}
                    </Tag>
                  );                }
              },              {
                title: translate('Price Info'),
                width: 80,
                align: 'center',
                render: (_, record) => {
                  const contractPrice = record.contractPrice;
                  const lastPrice = record.lastPurchasePrice;
                  
                  if (!contractPrice && !lastPrice) {
                    return <span style={{ fontSize: '8px', color: '#999' }}>No pricing</span>;
                  }
                  
                  return (
                    <div style={{ fontSize: '8px' }}>
                      {contractPrice && (
                        <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                          ${contractPrice.toFixed(2)}
                        </div>
                      )}
                      {lastPrice && !contractPrice && (
                        <div style={{ color: '#1890ff' }}>
                          ${lastPrice.toFixed(2)}
                        </div>
                      )}
                      <div style={{ color: '#666', fontSize: '7px' }}>
                        {contractPrice ? 'Contract' : 'Last Purchase'}
                      </div>
                    </div>
                  );
                }
              },{
                title: translate('Action'),
                key: 'actions',
                width: 65,
                fixed: 'right',
                render: (_, record) => (
                  <Button
                    type="primary"
                    onClick={() => handleInventoryItemSelect(record)}
                    size="small"
                    style={{ fontSize: '9px', padding: '2px 6px' }}
                  >
                    {translate('Select')}
                  </Button>
                ),
              },
            ]}
            locale={{ 
              emptyText: searchKeyword || Object.values(advancedSearchParams).some(v => v !== '' && v !== false) 
                ? translate('No items found') 
                : translate('Enter search term to find inventory items') 
            }}
          />        )}
      </Modal>

      {/* AI Assistant Modal */}
      <Modal
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8 }} />
            {translate('AI Description Assistant')}
          </span>
        }
        open={aiAssistant.visible}
        onCancel={() => setAiAssistant({ ...aiAssistant, visible: false })}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setAiAssistant({ ...aiAssistant, visible: false })}
          >
            {translate('Cancel')}
          </Button>,
          <Button
            key="use"
            type="primary"
            disabled={!aiAssistant.result}
            onClick={() => {
              // Find the item and update its description
              const currentItem = items.find(item => !item.description || item.description.trim() === '');
              if (currentItem) {
                updateItem(currentItem.key, 'description', aiAssistant.result);
              }
              setAiAssistant({ ...aiAssistant, visible: false });
              message.success('AI description applied successfully!');
            }}
          >
            {translate('Use This Description')}
          </Button>
        ]}
        width={600}
      >
        {aiAssistant.generating ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              {translate('AI is generating a professional description...')}
            </div>
          </div>
        ) : aiAssistant.result ? (
          <div>
            <Alert
              message={translate('Generated Description')}
              description={
                <div style={{ marginTop: 8 }}>
                  <TextArea
                    value={aiAssistant.result}
                    onChange={(e) => setAiAssistant({ ...aiAssistant, result: e.target.value })}
                    rows={4}
                    placeholder={translate('AI generated description will appear here...')}
                  />
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    {translate('You can edit this description before using it')}
                  </div>
                </div>
              }
              type="success"
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            {translate('Click the robot icon next to any item description to generate AI content')}
          </div>
        )}
      </Modal>

    </ErpLayout>
  );
}

// Wrapper component to provide App context
function PurchaseRequisitionCreate() {
  return (
    <App>
      <PurchaseRequisitionCreateSimple />
    </App>
  );
}

export default PurchaseRequisitionCreate;
