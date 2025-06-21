import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, DatePicker, Table, InputNumber, Card, Alert, message, Divider, Modal, Spin, Tabs, Tag, Tooltip, Typography, Badge, Row, Col, Space, Upload, App } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SearchOutlined, InfoCircleOutlined, WarningOutlined, CheckCircleOutlined, CameraOutlined, RobotOutlined } from '@ant-design/icons';
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
  });
  const [commentsValue, setCommentsValue] = useState(''); // Add state for comments
  const cameraInputRef = useRef(null);
  const [availableUOMs, setAvailableUOMs] = useState([
    { value: 'EA', label: 'Each (EA)' },
    { value: 'BOX', label: 'Box (BOX)' },
    { value: 'KG', label: 'Kilogram (KG)' },
    { value: 'LTR', label: 'Liter (LTR)' },
    { value: 'M', label: 'Meter (M)' },
    { value: 'CM', label: 'Centimeter (CM)' },
    { value: 'PC', label: 'Piece (PC)' },
    { value: 'SET', label: 'Set (SET)' }
  ]);
  
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
  };  // Load all inventory items when modal opens
  const loadAllInventoryItems = async () => {
    setSearchLoading(true);
    try {
      const response = await inventoryItemsService.getAllInventoryItems({ page: 1, limit: 100 });
      
      if (response.success) {
        setInventoryItems(response.data || []);
        if (response.data && response.data.length === 0) {
          message.info('No inventory items found in the system.');
        }
      } else {
        message.error(response.message || 'Failed to load inventory items');
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      message.error('Error loading inventory items. Please try again.');
      setInventoryItems([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Open inventory modal and load all items
  const openInventoryModal = () => {
    setInventoryModalVisible(true);
    loadAllInventoryItems(); // Load all items when modal opens
  };
  // Search inventory items
  const searchInventoryItems = async (keyword) => {
    // If no keyword, load all items
    if (!keyword || keyword.trim().length === 0) {
      loadAllInventoryItems();
      return;
    }
    
    if (keyword.trim().length < 2) {
      setInventoryItems([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      // Use the searchInventoryItems function for keyword search
      const response = await inventoryItemsService.searchInventoryItems(keyword);
      
      if (response.success) {
        setInventoryItems(response.data || []);
        if (response.data && response.data.length === 0) {
          message.info('No inventory items found matching your search.');
        }
      } else {
        message.error(response.message || 'Failed to search inventory items');
        setInventoryItems([]);
      }
    } catch (error) {
      console.error('Error searching inventory:', error);
      message.error('Error searching inventory items. Please try again.');
      setInventoryItems([]);
    } finally {
      setSearchLoading(false);
    }
  };    // Advanced search for inventory items
  const performAdvancedSearch = async () => {
    setSearchLoading(true);
    try {
      // Extract non-empty values only
      const searchParams = {};
      Object.entries(advancedSearchParams).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          searchParams[key] = value;
        }
      });
      
      // If no parameters are provided, load all items
      if (Object.keys(searchParams).length === 0) {
        loadAllInventoryItems();
        return;
      }
      
      // Use the advancedSearchInventoryItems function for advanced search
      const response = await inventoryItemsService.advancedSearchInventoryItems(searchParams);
      
      if (response.success) {
        setInventoryItems(response.data || []);
        if (response.data && response.data.length === 0) {
          message.info('No inventory items found matching your search criteria.');
        }
      } else {
        message.error(response.message || 'Failed to search inventory items');
        setInventoryItems([]);
      }
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
        loadAllInventoryItems();
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
        await searchInventoryItems(firstKeyword);
      } else {
        loadAllInventoryItems();
      }
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle inventory item selection
  const handleInventoryItemSelect = (inventoryItem) => {
    // Create a new item from the inventory item
    const newItem = {
      key: Date.now(),
      itemName: inventoryItem.itemMaster?.shortDescription || inventoryItem.inventoryNumber,
      description: inventoryItem.itemMaster?.longDescription || '',
      quantity: 1,
      uom: inventoryItem.itemMaster?.uom || 'EA',
      price: inventoryItem.unitPrice || 0,
      inventoryId: inventoryItem.id,
      itemMasterId: inventoryItem.itemMasterId,
      inventoryNumber: inventoryItem.inventoryNumber,
      physicalBalance: inventoryItem.physicalBalance || 0,
      minimumLevel: inventoryItem.minimumLevel || 0,
      warehouse: inventoryItem.warehouse || '',
      binLocationText: inventoryItem.binLocationText || '',
      manufacturerName: inventoryItem.itemMaster?.manufacturerName || '',
      manufacturerPartNumber: inventoryItem.itemMaster?.manufacturerPartNumber || ''
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
    
    const newItems = selectedInventoryItems.map(inventoryItem => ({
      key: Date.now() + Math.random(),
      itemName: inventoryItem.itemMaster?.shortDescription || inventoryItem.inventoryNumber,
      description: inventoryItem.itemMaster?.longDescription || '',
      quantity: 1,
      uom: inventoryItem.itemMaster?.uom || 'EA',
      price: inventoryItem.unitPrice || 0,
      inventoryId: inventoryItem.id,
      itemMasterId: inventoryItem.itemMasterId,
      inventoryNumber: inventoryItem.inventoryNumber,
      physicalBalance: inventoryItem.physicalBalance || 0,
      minimumLevel: inventoryItem.minimumLevel || 0,
      warehouse: inventoryItem.warehouse || '',
      binLocationText: inventoryItem.binLocationText || '',
      manufacturerName: inventoryItem.itemMaster?.manufacturerName || '',
      manufacturerPartNumber: inventoryItem.itemMaster?.manufacturerPartNumber || ''
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
      )
    },    {
      title: translate('Price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (text, record) => (
        <InputNumber
          min={0}
          precision={2}
          value={text}
          onChange={(value) => updateItem(record.key, 'price', value)}
          style={{ width: '100%' }}
          prefix="$"
          disabled={record.inventoryId !== null}
        />
      )
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
  ];
  // Handle form submission
  const handleSubmit = async (values) => {
    if (items.length === 0) {
      message.error(translate('Please add at least one item'));
      return;
    }
    
    // Additional validation for items
    const invalidItems = items.filter(item => !item.itemName || !item.quantity);
    if (invalidItems.length > 0) {
      message.error(translate('All items must have a name and quantity'));
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
      });
      
      const formData = {
        ...values,
        requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : null,
        // Ensure costCenter is provided (required field)
        costCenter: values.costCenter || 'General',
        // Ensure currency is provided
        currency: values.currency || 'USD',
        // Calculate total value from items
        totalValue: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
        // Items data
        items: processedItems
      };
      
      console.log('Submitting purchase requisition:', formData);
      console.log('Items being sent:', processedItems);
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
      });      message.error('Error generating comments. Please try again.');
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
          )}
            <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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
              <Select>
                <Option value="IT">IT</Option>
                <Option value="HR">HR</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Operations">Operations</Option>
                <Option value="Marketing">Marketing</Option>
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
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>            <Form.Item
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
                </Button>
              </div>
            </Form.Item>
              <Divider orientation="left">{translate('Items')}</Divider>
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
              )}
            </div>
                <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={items.length === 0}
              >
                {translate('Create Purchase Requisition')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>      {/* Inventory Item Selection Modal */}
      <Modal
        title={translate('Select Inventory Item')}
        open={inventoryModalVisible}
        onCancel={() => {
          setInventoryModalVisible(false);
          setSelectedInventoryItems([]);
          setSearchKeyword('');
          setInventoryItems([]);
        }}
        footer={[
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
          </Button>
        ]}        width="96vw"
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
                    </div>
                    <Button 
                      type="default" 
                      size="small"
                      onClick={loadAllInventoryItems}
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
                          </Button>
                          <Button
                            type="default"
                            onClick={loadAllInventoryItems}
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

        {searchLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>{translate('Searching inventory items...')}</div>
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
              columnWidth: 35
            }}columns={[              {
                title: translate('Inventory #'),
                dataIndex: 'inventoryNumber',
                key: 'inventoryNumber',
                width: 120,
                fixed: 'left',
                render: (text, record) => (
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '10px' }}>{text}</div>
                    <div style={{ marginTop: 1 }}>
                      {record.minimumLevel > 0 && record.physicalBalance <= record.minimumLevel && (
                        <Tag color="warning" size="small" style={{ fontSize: '8px', marginRight: 2 }}>
                          {translate('Low')}
                        </Tag>
                      )}
                      {record.physicalBalance <= 0 && (
                        <Tag color="error" size="small" style={{ fontSize: '8px' }}>
                          {translate('Out')}
                        </Tag>
                      )}
                    </div>
                  </div>
                )
              },              {
                title: translate('Description'),
                dataIndex: ['itemMaster', 'shortDescription'],
                key: 'description',
                width: 160,
                ellipsis: {
                  showTitle: false,
                },
                render: (text, record) => (
                  <Tooltip title={`${text || record.description || ''} ${record.itemMaster?.longDescription ? '- ' + record.itemMaster.longDescription : ''}`}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '10px' }}>
                        {text || record.description || '-'}
                      </div>
                      {record.itemMaster?.longDescription && (
                        <div style={{ fontSize: '8px', color: '#666', marginTop: 1 }}>
                          {record.itemMaster.longDescription.length > 25 
                            ? record.itemMaster.longDescription.substring(0, 25) + '...' 
                            : record.itemMaster.longDescription}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                ),
              },              {
                title: translate('Item #'),
                dataIndex: ['itemMaster', 'itemNumber'],
                key: 'itemNumber',
                width: 85,
                ellipsis: true,
                render: (text) => (
                  <span style={{ fontSize: '9px', fontFamily: 'monospace' }}>
                    {text || '-'}
                  </span>
                )
              },              {
                title: translate('Manufacturer'),
                width: 120,
                ellipsis: true,
                render: (_, record) => (
                  <Tooltip title={`${record.itemMaster?.manufacturerName || ''} ${record.itemMaster?.manufacturerPartNumber ? '(P/N: ' + record.itemMaster.manufacturerPartNumber + ')' : ''}`}>
                    <div>
                      <div style={{ fontSize: '9px' }}>{record.itemMaster?.manufacturerName || '-'}</div>
                      {record.itemMaster?.manufacturerPartNumber && (
                        <div style={{ fontSize: '8px', color: '#666' }}>
                          {record.itemMaster.manufacturerPartNumber.length > 10 
                            ? record.itemMaster.manufacturerPartNumber.substring(0, 10) + '...'
                            : record.itemMaster.manufacturerPartNumber}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                )
              },              {
                title: translate('Location'),
                width: 75,
                render: (_, record) => (
                  <div>
                    <div style={{ fontSize: '9px' }}>{record.warehouse || '-'}</div>
                    {record.binLocationText && (
                      <div style={{ fontSize: '8px', color: '#666' }}>
                        {record.binLocationText.length > 8 
                          ? record.binLocationText.substring(0, 8) + '...'
                          : record.binLocationText}
                      </div>
                    )}
                  </div>
                )
              },              {
                title: translate('UOM'),
                dataIndex: ['itemMaster', 'uom'],
                key: 'uom',
                width: 45,
                align: 'center',
                render: (text) => (
                  <span style={{ fontSize: '9px' }}>{text || '-'}</span>
                )
              },              {
                title: translate('Stock'),
                dataIndex: 'physicalBalance',
                key: 'physicalBalance',
                width: 55,
                align: 'right',
                render: (text, record) => (
                  <div style={{ 
                    color: text <= 0 ? '#ff4d4f' : (text < record.minimumLevel ? '#faad14' : '#52c41a'),
                    fontWeight: 'bold',
                    fontSize: '9px'
                  }}>
                    {text !== undefined ? text : '-'}
                  </div>
                )
              },              {
                title: translate('Min/Max'),
                width: 65,
                align: 'center',
                render: (_, record) => (
                  <div style={{ fontSize: '8px' }}>
                    <div>{record.minimumLevel || 0}</div>
                    <div style={{ color: '#666' }}>/{record.maximumLevel || 0}</div>
                  </div>
                )
              },              {
                title: translate('Price'),
                dataIndex: 'unitPrice',
                key: 'unitPrice',
                width: 65,
                align: 'right',
                render: (text) => (
                  <span style={{ fontSize: '9px' }}>
                    {text !== undefined ? `$${parseFloat(text).toFixed(2)}` : '-'}
                  </span>
                ),
              },              {
                title: translate('Condition'),
                dataIndex: 'condition',
                key: 'condition',
                width: 60,
                align: 'center',
                render: (text) => {
                  const conditionMap = {
                    'A': { color: 'green', text: 'New' },
                    'B': { color: 'blue', text: 'Good' },
                    'C': { color: 'orange', text: 'Fair' },
                    'D': { color: 'red', text: 'Poor' },
                    'E': { color: 'volcano', text: 'Scrap' }
                  };
                  const condition = conditionMap[text] || { color: 'default', text: text || '-' };
                  return (
                    <Tag color={condition.color} size="small" style={{ fontSize: '8px' }}>
                      {condition.text}
                    </Tag>
                  );
                }
              },              {
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

export default PurchaseRequisitionCreateSimple;
