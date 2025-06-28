import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Alert,
  message,
  Spin
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from '../api/axiosConfig';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ItemEditFromNotificationModal = ({ 
  visible, 
  onCancel, 
  notification, 
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  // Load suppliers
  const loadSuppliers = async () => {
    try {
      const response = await axios.get('/supplier');
      if (response.data.success) {
        setSuppliers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (visible && notification?.originalItemData) {
      try {
        // Parse original data - it might already be an object from Sequelize
        const data = typeof notification.originalItemData === 'string' 
          ? JSON.parse(notification.originalItemData)
          : notification.originalItemData;
        
        setOriginalData(data);
        
        // Set form values
        form.setFieldsValue({
          shortDescription: data.shortDescription || '',
          longDescription: data.longDescription || '',
          standardDescription: data.standardDescription || '',
          manufacturerName: data.manufacturerName || '',
          manufacturerPartNumber: data.manufacturerPartNumber || '',
          equipmentCategory: data.equipmentCategory || '',
          equipmentSubCategory: data.equipmentSubCategory || '',
          criticality: data.criticality || '',
          uom: data.uom || '',
          stockItem: data.stockItem || 'Y',
          plannedStock: data.plannedStock || 'N',
          unspscCodeId: data.unspscCodeId || null,
          unspscCode: data.unspscCode || '',
          supplierId: data.supplierId || null,
          equipmentTag: data.equipmentTag || ''
        });
        
        loadSuppliers();
      } catch (error) {
        console.error('Error parsing original data:', error);
        message.error('Error loading original item data');
      }
    }
  }, [visible, notification, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Create the item with edited data
      const response = await axios.post('/item', {
        ...values,
        // Ensure enum values are correct
        stockItem: values.stockItem || 'Y',
        plannedStock: values.plannedStock || 'N'
      });

      if (response.data.success) {
        message.success({
          content: `Item recreated and edited successfully! Item number: ${response.data.data.itemNumber}`,
          duration: 6
        });

        // Mark notification as read
        try {
          await axios.put(`/item/notifications/${notification.id}/read`);
        } catch (readError) {
          console.error('Error marking notification as read:', readError);
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.data);
        }

        // Close modal
        onCancel();
      }
    } catch (error) {
      console.error('Error creating edited item:', error);
      message.error(
        error.response?.data?.message || 'Failed to create item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOriginalData(null);
    onCancel();
  };

  return (
    <Modal      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Edit & Recreate Item</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSubmit}
        >
          Create Edited Item
        </Button>
      ]}
      destroyOnClose
    >
      {notification && (
        <div>
          {/* Original Item Info */}
          <Alert
            message="Editing Rejected Item"
            description={
              <div>
                <Text strong>Original Item: </Text>
                <Text code>{notification.itemNumber}</Text>
                <br />
                <Text strong>Rejection Reason: </Text>
                <Text>{notification.rejectionReason}</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          {/* Edit Form */}
          <Form
            form={form}
            layout="vertical"
            style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '16px' }}
          >
            {/* Item Descriptions */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Short Description"
                  name="shortDescription"
                  rules={[{ required: true, message: 'Short description is required' }]}
                >
                  <Input placeholder="Enter short description" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Long Description"
                  name="longDescription"
                  rules={[{ required: true, message: 'Long description is required' }]}
                >
                  <TextArea rows={4} placeholder="Enter detailed description" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Standard Description"
                  name="standardDescription"
                  rules={[{ required: true, message: 'Standard description is required' }]}
                >
                  <Input placeholder="Enter standard description" />
                </Form.Item>
              </Col>
            </Row>

            {/* Manufacturer Information */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Manufacturer Name"
                  name="manufacturerName"
                  rules={[{ required: true, message: 'Manufacturer name is required' }]}
                >
                  <Input placeholder="Enter manufacturer name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Manufacturer Part Number"
                  name="manufacturerPartNumber"
                  rules={[{ required: true, message: 'Part number is required' }]}
                >
                  <Input placeholder="Enter part number" />
                </Form.Item>
              </Col>
            </Row>

            {/* Categories */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Equipment Category"
                  name="equipmentCategory"
                  rules={[{ required: true, message: 'Equipment category is required' }]}
                >
                  <Select placeholder="Select equipment category">
                    <Option value="ELECTRICAL">Electrical</Option>
                    <Option value="MECHANICAL">Mechanical</Option>
                    <Option value="INSTRUMENTATION">Instrumentation</Option>
                    <Option value="HVAC">HVAC</Option>
                    <Option value="PIPING">Piping</Option>
                    <Option value="STRUCTURAL">Structural</Option>
                    <Option value="SAFETY">Safety</Option>
                    <Option value="OTHER">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Equipment Sub-Category"
                  name="equipmentSubCategory"
                >
                  <Input placeholder="Enter sub-category" />
                </Form.Item>
              </Col>
            </Row>

            {/* Criticality and UOM */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Criticality"
                  name="criticality"
                  rules={[{ required: true, message: 'Criticality is required' }]}
                >
                  <Select placeholder="Select criticality">
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                    <Option value="CRITICAL">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Unit of Measure (UOM)"
                  name="uom"
                  rules={[{ required: true, message: 'UOM is required' }]}
                >
                  <Select placeholder="Select UOM">
                    <Option value="EA">Each (EA)</Option>
                    <Option value="SET">Set</Option>
                    <Option value="LOT">Lot</Option>
                    <Option value="ROLL">Roll</Option>
                    <Option value="M">Meter (M)</Option>
                    <Option value="KG">Kilogram (KG)</Option>
                    <Option value="L">Liter (L)</Option>
                    <Option value="PCS">Pieces (PCS)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="UNSPSC Code"
                  name="unspscCode"
                >
                  <Input placeholder="Enter UNSPSC code" />
                </Form.Item>
              </Col>
            </Row>

            {/* Stock Information */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Stock Item"
                  name="stockItem"
                  rules={[{ required: true, message: 'Stock item status is required' }]}
                >
                  <Select placeholder="Select stock item status">
                    <Option value="Y">Yes</Option>
                    <Option value="N">No</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Planned Stock"
                  name="plannedStock"
                  rules={[{ required: true, message: 'Planned stock status is required' }]}
                >
                  <Select placeholder="Select planned stock status">
                    <Option value="Y">Yes</Option>
                    <Option value="N">No</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Equipment Tag"
                  name="equipmentTag"
                >
                  <Input placeholder="Enter equipment tag" />
                </Form.Item>
              </Col>
            </Row>

            {/* Supplier */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Supplier"
                  name="supplierId"
                >
                  <Select 
                    placeholder="Select supplier" 
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default ItemEditFromNotificationModal;
