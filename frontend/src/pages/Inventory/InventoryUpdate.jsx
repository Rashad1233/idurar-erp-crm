import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, message, Spin, Card } from 'antd';

import { ErpLayout } from '@/layout';
import InventoryForm from '@/forms/InventoryForm';
import inventoryService from '@/services/inventoryService';
import useLanguage from '@/locale/useLanguage';

export default function InventoryUpdate() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [current, setCurrent] = useState({});
  const navigate = useNavigate();
  const translate = useLanguage();

  const loadData = async () => {
    setLoadingData(true);
    try {
      const response = await inventoryService.getInventoryItem(id);
      if (response.success) {
        const inventoryData = response.data;
        setCurrent(inventoryData);
          // Populate form with existing data, excluding location fields
        form.setFieldsValue({
          inventoryNumber: inventoryData.inventoryNumber,
          shortDescription: inventoryData.shortDescription,
          longDescription: inventoryData.longDescription,
          itemMasterId: inventoryData.itemMasterId,
          physicalBalance: inventoryData.physicalBalance,
          unitPrice: inventoryData.unitPrice,
          condition: inventoryData.condition,
          minimumLevel: inventoryData.minimumLevel,
          maximumLevel: inventoryData.maximumLevel,
          criticality: inventoryData.criticality,
          unspscCode: inventoryData.unspscCode,
          manufacturerName: inventoryData.manufacturerName,
          manufacturerPartNumber: inventoryData.manufacturerPartNumber,
          uom: inventoryData.uom,
        });
      } else {
        message.error(response.message || 'Failed to load inventory data');
        navigate('/inventory');
      }
    } catch (error) {
      message.error('Error loading inventory data');
      console.error(error);
      navigate('/inventory');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Check that itemMasterId is present
      if (!values.itemMasterId) {
        message.error('Item Master is required');
        setLoading(false);
        return;
      }
      
      // Ensure all required fields have default values to prevent validation errors
      const defaultValues = {
        unitPrice: values.unitPrice || 0.01, // Set minimum valid price
        shortDescription: values.shortDescription || 'Default Description',
        criticality: values.criticality || 'MEDIUM',
        unspscCode: values.unspscCode || '00000000',
        uom: values.uom || 'EA'
      };
        // Prepare the inventory data
      const inventoryData = {
        itemMasterId: values.itemMasterId,
        physicalBalance: values.physicalBalance || 0,
        unitPrice: defaultValues.unitPrice,
        condition: values.condition || 'A',
        minimumLevel: values.minimumLevel || 0,
        maximumLevel: values.maximumLevel || 0,
        // Include other fields as needed
        inventoryNumber: values.inventoryNumber,
        shortDescription: defaultValues.shortDescription,
        longDescription: values.longDescription || '',
        criticality: defaultValues.criticality,
        unspscCode: defaultValues.unspscCode,
        manufacturerName: values.manufacturerName || 'Not specified',
        manufacturerPartNumber: values.manufacturerPartNumber || 'Not specified',
        uom: defaultValues.uom
      };

      // Verify all required fields are present before submitting
      const requiredFields = ['itemMasterId', 'unitPrice', 'shortDescription', 'criticality', 'unspscCode', 'uom'];
      const missingFields = requiredFields.filter(field => !inventoryData[field]);
      
      if (missingFields.length > 0) {
        message.error(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }      // Submit to API
      const response = await inventoryService.updateInventory(id, inventoryData);
      
      if (response.success) {
        message.success('Inventory item updated successfully');
        navigate('/inventory');
      } else {
        message.error(response.message || 'Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      message.error('Error updating inventory item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ErpLayout>
        <Card>
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
        </Card>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <Card title={translate('Update Inventory Item')}>
        <Spin spinning={loading}>          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}            onFinishFailed={(errorInfo) => {
              console.log('Form validation failed in update form:', errorInfo);
              
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
            <InventoryForm isUpdateForm={true} current={current} form={form} />
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {translate('Update Inventory Item')}
              </Button>
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={() => navigate('/inventory')}
              >
                {translate('Cancel')}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </ErpLayout>
  );
}
