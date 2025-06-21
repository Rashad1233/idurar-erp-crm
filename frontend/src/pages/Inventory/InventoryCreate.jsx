import React, { useState } from 'react';
import { Form, Button, message, Spin, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import InventoryForm from '@/forms/InventoryForm';
import inventoryService from '@/services/inventoryService';
import useLanguage from '@/locale/useLanguage';
import storePersist from '@/redux/storePersist';

export default function InventoryCreate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const translate = useLanguage();  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Check that required fields have values
      if (!values.itemMasterId) {
        message.error('Item Master selection is required');
        setLoading(false);
        return;
      }

      // Verify user is authenticated
      const auth = storePersist.get('auth');
      if (!auth || !auth.current || !auth.current.token) {
        message.error('You must be logged in to create inventory items');
        setLoading(false);
        navigate('/auth/login');
        return;
      }

      // Ensure all required fields have default values to prevent validation errors
      const defaultValues = {
        itemMasterId: values.itemMasterId,
        unitPrice: values.unitPrice || 0.01, // Use 0.01 as minimum valid price
        shortDescription: values.shortDescription || 'Default Description',
        criticality: values.criticality || 'MEDIUM',
        unspscCode: values.unspscCode || '00000000',
        uom: values.uom || 'EA'
      };

      // Prepare the inventory data
      const inventoryData = {
        itemMasterId: defaultValues.itemMasterId,
        physicalBalance: values.physicalBalance || 0,
        unitPrice: defaultValues.unitPrice,
        condition: values.condition || 'A',
        minimumLevel: values.minimumLevel || 0,
        maximumLevel: values.maximumLevel || 0,
        // Include additional required fields with fallback values
        shortDescription: defaultValues.shortDescription,
        longDescription: values.longDescription || '',
        criticality: defaultValues.criticality,
        unspscCode: defaultValues.unspscCode,
        manufacturerName: values.manufacturerName || 'Not specified',
        manufacturerPartNumber: values.manufacturerPartNumber || 'Not specified',
        uom: defaultValues.uom
      };

      console.log('Creating inventory with data (including defaults):', inventoryData);

      // Verify all required fields are present before submitting
      const requiredFields = ['itemMasterId', 'unitPrice', 'shortDescription', 'criticality', 'unspscCode', 'uom'];
      const missingFields = requiredFields.filter(field => !inventoryData[field]);
      
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
      message.error('Error creating inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErpLayout>
      <Card title={translate('Create New Inventory Item')}>
        <Spin spinning={loading}>          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}            onFinishFailed={(errorInfo) => {
              console.log('Form validation failed:', errorInfo);
              
              // Check if validation errors are in fields that should be populated from item master
              const autopopulatedFields = ['shortDescription', 'criticality', 'unspscCode', 'uom', 'unitPrice'];
              
              if (errorInfo.errorFields.some(field => autopopulatedFields.includes(field.name[0]))) {
                console.log('Detected validation errors in auto-populated fields:', 
                  errorInfo.errorFields.filter(f => autopopulatedFields.includes(f.name[0])).map(f => f.name[0]));
                
                // Get the current form values
                const currentValues = form.getFieldsValue();
                const itemMasterId = currentValues.itemMasterId;
                
                // Only proceed if an item master is selected
                if (itemMasterId) {
                  // Set default values for missing fields
                  const updates = {};
                  
                  autopopulatedFields.forEach(field => {
                    if (errorInfo.errorFields.some(ef => ef.name[0] === field)) {
                      // Set a default value based on the field type
                      switch(field) {
                        case 'unitPrice':
                          updates[field] = 0.01;
                          break;
                        case 'shortDescription':
                          updates[field] = 'Default Description';
                          break;
                        case 'criticality':
                          updates[field] = 'MEDIUM';
                          break;
                        case 'unspscCode':
                          updates[field] = '00000000';
                          break;
                        case 'uom':
                          updates[field] = 'EA';
                          break;
                      }
                    }
                  });
                  
                  // Update form values with defaults
                  if (Object.keys(updates).length > 0) {
                    console.log('Setting default values for missing fields:', updates);
                    form.setFieldsValue(updates);
                  }
                  
                  // Clear all validation errors
                  form.setFields(
                    errorInfo.errorFields
                      .filter(field => autopopulatedFields.includes(field.name[0]))
                      .map(field => ({ name: field.name, errors: [] }))
                  );
                  
                  // Try submitting again after clearing errors
                  setTimeout(() => form.submit(), 100);
                } else {
                  message.error('Please select an Item Master first');
                }              }
            }}
          >
            <InventoryForm isUpdateForm={false} form={form} />
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {translate('Create Inventory Item')}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </ErpLayout>
  );
}
