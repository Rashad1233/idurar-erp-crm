import React, { useState, useEffect } from 'react';
import { 
  Form, Input, InputNumber, Select, Typography, Spin, message, 
  Card, Row, Col, Space, Divider, Button, Tooltip, Alert
} from 'antd';
import { 
  InfoCircleOutlined, SearchOutlined, ShopOutlined, 
  InboxOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';
import apiClient from '@/api/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ImprovedInventoryForm({ isUpdateForm = false, current = {} }) {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  
  // State management
  const [itemMasters, setItemMasters] = useState([]);
  const [selectedItemMaster, setSelectedItemMaster] = useState(null);
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingItemMasters, setLoadingItemMasters] = useState(false);
  const [loadingBinLocations, setLoadingBinLocations] = useState(false);

  // Load initial data
  useEffect(() => {
    loadItemMasters();
    loadStorageLocations();
  }, []);

  // Load item masters
  const loadItemMasters = async () => {
    setLoadingItemMasters(true);
    try {
      const response = await apiClient.get('/item-master');
      if (response.data && response.data.success) {
        console.log('Loaded item masters:', response.data.data.length);
        setItemMasters(response.data.data || []);
      } else {
        message.error('Failed to load item masters');
      }
    } catch (error) {
      console.error('Error loading item masters:', error);
      message.error('Error loading item masters');
    } finally {
      setLoadingItemMasters(false);
    }
  };

  // Load storage locations
  const loadStorageLocations = async () => {
    try {
      const response = await apiClient.get('/storage-locations');
      if (response.data && response.data.success) {
        setStorageLocations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading storage locations:', error);
      // Don't show error for storage locations as they might not be required
    }
  };

  // Load bin locations when storage location changes
  const loadBinLocations = async (storageLocationId) => {
    if (!storageLocationId) {
      setBinLocations([]);
      return;
    }

    setLoadingBinLocations(true);
    try {
      const response = await apiClient.get(`/bin-locations?storageLocationId=${storageLocationId}`);
      if (response.data && response.data.success) {
        setBinLocations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading bin locations:', error);
      setBinLocations([]);
    } finally {
      setLoadingBinLocations(false);
    }
  };

  // Handle item master selection
  const handleItemMasterChange = async (itemMasterId) => {
    if (!itemMasterId) {
      setSelectedItemMaster(null);
      return;
    }

    setLoading(true);
    try {
      // Find the item master in the loaded list first
      let itemMaster = itemMasters.find(item => item.id === itemMasterId);
      
      if (!itemMaster) {
        // If not found, fetch it directly
        const response = await apiClient.get(`/item-master/${itemMasterId}`);
        if (response.data && response.data.success) {
          itemMaster = response.data.data;
        } else {
          throw new Error('Failed to fetch item master details');
        }
      }

      setSelectedItemMaster(itemMaster);

      // Auto-populate form fields from item master
      const formUpdates = {
        shortDescription: itemMaster.shortDescription || '',
        longDescription: itemMaster.longDescription || '',
        manufacturerName: itemMaster.manufacturerName || '',
        manufacturerPartNumber: itemMaster.manufacturerPartNumber || '',
        uom: itemMaster.uom || 'EA',
        unspscCode: itemMaster.unspscCode || '',
        criticality: itemMaster.criticality || 'MEDIUM',
        equipmentCategory: itemMaster.equipmentCategory || '',
        equipmentSubCategory: itemMaster.equipmentSubCategory || '',
        // Set a default unit price if not already set
        unitPrice: form.getFieldValue('unitPrice') || 0.01
      };

      form.setFieldsValue(formUpdates);
      message.success(`Item master "${itemMaster.itemNumber}" selected and data populated`);

    } catch (error) {
      console.error('Error selecting item master:', error);
      message.error('Error loading item master details');
    } finally {
      setLoading(false);
    }
  };

  // Handle storage location change
  const handleStorageLocationChange = (storageLocationId) => {
    // Clear bin location when storage location changes
    form.setFieldValue('binLocationId', null);
    setBinLocations([]);
    
    if (storageLocationId) {
      loadBinLocations(storageLocationId);
    }
  };

  // Render item master options with search
  const renderItemMasterOptions = () => {
    return itemMasters.map(item => (
      <Option key={item.id} value={item.id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong>{item.itemNumber}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.shortDescription}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {item.manufacturerPartNumber}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {item.equipmentCategory}
            </Text>
          </div>
        </div>
      </Option>
    ));
  };

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Item Master Selection */}
        <Card 
          title={
            <Space>
              <ShopOutlined />
              <Text strong>Item Master Selection</Text>
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Alert
            message="Select Item Master"
            description="Choose the item master record to create an inventory item from. All item details will be populated automatically."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Row gutter={16}>
            <Col span={20}>
              <Form.Item
                label="Item Master"
                name="itemMasterId"
                rules={[{ required: true, message: 'Please select an item master' }]}
              >
                <Select
                  showSearch
                  placeholder="Search by item number, description, or part number"
                  optionFilterProp="children"
                  onChange={handleItemMasterChange}
                  loading={loadingItemMasters}
                  filterOption={(input, option) => {
                    const item = itemMasters.find(i => i.id === option.value);
                    if (!item) return false;
                    
                    const searchText = input.toLowerCase();
                    return (
                      item.itemNumber?.toLowerCase().includes(searchText) ||
                      item.shortDescription?.toLowerCase().includes(searchText) ||
                      item.manufacturerPartNumber?.toLowerCase().includes(searchText) ||
                      item.manufacturerName?.toLowerCase().includes(searchText)
                    );
                  }}
                >
                  {renderItemMasterOptions()}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Link to="/item-master/create">
                  <Button icon={<ShopOutlined />} block>
                    Create New Item Master
                  </Button>
                </Link>
              </Form.Item>
            </Col>
          </Row>

          {/* Display selected item master details */}
          {selectedItemMaster && (
            <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Item Number:</Text> {selectedItemMaster.itemNumber}
                  <br />
                  <Text strong>Description:</Text> {selectedItemMaster.shortDescription}
                </Col>
                <Col span={8}>
                  <Text strong>Manufacturer:</Text> {selectedItemMaster.manufacturerName || 'N/A'}
                  <br />
                  <Text strong>Part Number:</Text> {selectedItemMaster.manufacturerPartNumber || 'N/A'}
                </Col>
                <Col span={8}>
                  <Text strong>Category:</Text> {selectedItemMaster.equipmentCategory || 'N/A'}
                  <br />
                  <Text strong>UOM:</Text> {selectedItemMaster.uom || 'EA'}
                </Col>
              </Row>
            </Card>
          )}
        </Card>

        {/* Inventory Details */}
        <Card 
          title={
            <Space>
              <InboxOutlined />
              <Text strong>Inventory Details</Text>
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <Tooltip title="Current physical quantity in stock">
                    <Space>
                      Physical Balance
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="physicalBalance"
                rules={[{ required: true, message: 'Please enter physical balance' }]}
              >
                <InputNumber
                  placeholder="Enter quantity"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <Tooltip title="Unit price for this inventory item">
                    <Space>
                      Unit Price
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="unitPrice"
                rules={[
                  { required: true, message: 'Please enter unit price' },
                  { type: 'number', min: 0.01, message: 'Unit price must be greater than 0' }
                ]}
              >
                <InputNumber
                  placeholder="Enter unit price"
                  style={{ width: '100%' }}
                  min={0.01}
                  precision={2}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Condition"
                name="condition"
                initialValue="A"
              >
                <Select>
                  <Option value="A">Active</Option>
                  <Option value="I">Inactive</Option>
                  <Option value="D">Damaged</Option>
                  <Option value="O">Obsolete</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Minimum Level"
                name="minimumLevel"
                initialValue={0}
              >
                <InputNumber
                  placeholder="Minimum stock level"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Maximum Level"
                name="maximumLevel"
                initialValue={0}
              >
                <InputNumber
                  placeholder="Maximum stock level"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Reorder Point"
                name="reorderPoint"
                initialValue={0}
              >
                <InputNumber
                  placeholder="Reorder point"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Location Information */}
        <Card 
          title={
            <Space>
              <EnvironmentOutlined />
              <Text strong>Location Information</Text>
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Storage Location"
                name="storageLocationId"
              >
                <Select
                  placeholder="Select storage location"
                  onChange={handleStorageLocationChange}
                  allowClear
                >
                  {storageLocations.map(location => (
                    <Option key={location.id} value={location.id}>
                      {location.code} - {location.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bin Location"
                name="binLocationId"
              >
                <Select
                  placeholder="Select bin location"
                  loading={loadingBinLocations}
                  disabled={!form.getFieldValue('storageLocationId')}
                  allowClear
                >                  {binLocations.map(bin => (
                    <Option key={bin.id} value={bin.id}>
                      {bin.binCode || bin.code} - {bin.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Item Master Details (Read-only, populated from selection) */}
        <Card 
          title={
            <Space>
              <InfoCircleOutlined />
              <Text strong>Item Master Details</Text>
              <Text type="secondary">(Auto-populated from Item Master)</Text>
            </Space>
          }
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Short Description" name="shortDescription">
                <Input readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
              <Form.Item label="Manufacturer" name="manufacturerName">
                <Input readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
              <Form.Item label="UOM" name="uom">
                <Input readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Long Description" name="longDescription">
                <TextArea rows={2} readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
              <Form.Item label="Part Number" name="manufacturerPartNumber">
                <Input readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
              <Form.Item label="Criticality" name="criticality">
                <Input readOnly placeholder="Will be populated when item master is selected" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hidden fields for form submission */}
          <Form.Item name="unspscCode" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="equipmentCategory" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="equipmentSubCategory" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </Card>
      </div>
    </Spin>
  );
}
