import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, DatePicker, Switch, Spin, Alert, Card, App } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import moment from 'moment';
import { ErpLayout } from '@/layout';

/**
 * A simplified form component for creating and updating items
 */
const SimpleForm = ({
  entity,
  id = null, // If provided, this is an update form
  fields = [],
  onSuccess = null,
  isUpdateForm = false,
  title = 'Create Form',
  submitButtonText = 'Submit'
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isUpdateForm);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data for edit forms
  useEffect(() => {
    const fetchData = async () => {
      if (!isUpdateForm || !id) return;
      
      try {
        setInitialLoading(true);
        const response = await axios.get(`${API_BASE_URL}/${entity}/${id}`);
        
        if (response.data && response.data.result) {
          const data = response.data.result;
          
          // Format date fields using moment for DatePicker
          const formattedData = {};
          
          for (const [key, value] of Object.entries(data)) {
            // If the field is a date field and has a value
            const field = fields.find(f => f.name === key);
            if (field && field.type === 'date' && value) {
              formattedData[key] = moment(value);
            } else {
              formattedData[key] = value;
            }
          }
          
          form.setFieldsValue(formattedData);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch item details');
        message.error('Error loading data: ' + (err.message || 'Unknown error'));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, entity, isUpdateForm, form, fields]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format date fields back to ISO strings
      const formattedValues = { ...values };
      fields.forEach(field => {
        if (field.type === 'date' && formattedValues[field.name]) {
          formattedValues[field.name] = formattedValues[field.name].toISOString();
        }
      });
        let response;
      
      // Normalize API URLs to prevent double slashes
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const normalizedEntity = entity.replace(/^\/+/, '');
      
      if (isUpdateForm) {
        response = await axios.patch(`${normalizedBase}/${normalizedEntity}/${id}`, formattedValues);
        message.success('Item updated successfully');
      } else {
        response = await axios.post(`${normalizedBase}/${normalizedEntity}`, formattedValues);
        message.success('Item created successfully');
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        // If no success callback, navigate back to the entity list
        navigate(`/${entity}`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while submitting the form');
      message.error('Error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Generate form fields based on the fields configuration
  const renderFormFields = () => {
    return fields.map(field => {
      const { name, label, type = 'text', rules = [], options, ...rest } = field;
      
      // Common field props
      const fieldProps = {
        name,
        label,
        rules: [
          { required: field.required || false, message: `${label} is required` },
          ...rules
        ],
        ...rest
      };
      
      // Render different field types
      switch (type) {
        case 'select':
          return (
            <Form.Item key={name} {...fieldProps}>
              <Select placeholder={`Select ${label}`}>
                {options && options.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          );
          
        case 'number':
          return (
            <Form.Item key={name} {...fieldProps}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          );
          
        case 'date':
          return (
            <Form.Item key={name} {...fieldProps}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          );
          
        case 'switch':
          return (
            <Form.Item key={name} {...fieldProps} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
          
        case 'textarea':
          return (
            <Form.Item key={name} {...fieldProps}>
              <Input.TextArea rows={4} />
            </Form.Item>
          );
          
        case 'text':
        default:
          return (
            <Form.Item key={name} {...fieldProps}>
              <Input />
            </Form.Item>
          );
      }
    });
  };

  return (
    <App>
      <ErpLayout>
        <Card 
          title={title}
          extra={
            <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
              Back
            </Button>
          }
        >
          {initialLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {error && (
                <Alert
                  message="Error"
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
                initialValues={{ active: true }} // Default values
              >
                {renderFormFields()}
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {submitButtonText}
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </ErpLayout>
    </App>
  );
};

export default SimpleForm;
