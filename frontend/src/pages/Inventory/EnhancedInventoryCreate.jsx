import React, { useState } from 'react';
import { Form, Button, message, Card, Space, Divider } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import ImprovedInventoryForm from '@/components/Inventory/ImprovedInventoryForm';
import inventoryService from '@/services/inventoryService';
import useLanguage from '@/locale/useLanguage';

export default function EnhancedInventoryCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();
  
  // Get itemMasterId from query params if available
  const queryParams = new URLSearchParams(location.search);
  const preselectedItemMasterId = queryParams.get('itemMasterId');  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Check if itemMasterId is provided
      if (!values.itemMasterId) {
        message.error('Item Master selection is required');
        setLoading(false);
        return;
      }

      // Prepare the inventory data with proper validation
      const inventoryData = {
        itemMasterId: values.itemMasterId,
        physicalBalance: values.physicalBalance || 0,
        unitPrice: values.unitPrice,
        condition: values.condition || 'A',
        minimumLevel: values.minimumLevel || 0,
        maximumLevel: values.maximumLevel || 0,
        reorderPoint: values.reorderPoint || 0,
        // Location information
        storageLocationId: values.storageLocationId || null,
        binLocationId: values.binLocationId || null,
        // Item master fields (for database requirements)
        shortDescription: values.shortDescription,
        longDescription: values.longDescription || '',
        criticality: values.criticality,
        unspscCode: values.unspscCode,
        manufacturerName: values.manufacturerName || '',
        manufacturerPartNumber: values.manufacturerPartNumber || '',
        uom: values.uom,
        equipmentCategory: values.equipmentCategory || '',
        equipmentSubCategory: values.equipmentSubCategory || ''
      };

      console.log('Creating inventory with data:', inventoryData);

      // Validate required fields
      const requiredFields = ['itemMasterId', 'physicalBalance', 'unitPrice'];
      const missingFields = requiredFields.filter(field => !inventoryData[field] && inventoryData[field] !== 0);
      
      if (missingFields.length > 0) {
        message.error(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await inventoryService.createInventory(inventoryData);
      
      if (response.success) {
        message.success('Inventory item created successfully');
        navigate('/inventory');
      } else {
        message.error(response.message || 'Failed to create inventory item');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      message.error('Error creating inventory item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <ErpLayout>      <Card 
        title={translate('Create Inventory Item from Item Master')}
        extra={
          <Space>
            <Button onClick={handleCancel} icon={<CloseOutlined />}>
              {translate('Cancel')}
            </Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()} 
              loading={loading}
              icon={<SaveOutlined />}
            >
              {translate('Save')}
            </Button>
          </Space>
        }
      >        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={preselectedItemMasterId ? { itemMasterId: preselectedItemMasterId } : {}}
        >
          <ImprovedInventoryForm isUpdateForm={false} />
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {translate('Create Inventory Item')}
              </Button>
              <Button 
                onClick={handleCancel}
                icon={<CloseOutlined />}
              >
                {translate('Cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </ErpLayout>
  );
}
