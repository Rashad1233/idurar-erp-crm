import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Card, 
  Alert, 
  Spin, 
  Divider,
  Switch,
  Row,
  Col,
  Space
} from 'antd';
import { ShopOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import procurementService from '@/services/procurementService';

const { Option } = Select;
const { TextArea } = Input;

function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  
  useEffect(() => {
    if (id) {
      setIsUpdate(true);
      loadSupplier(id);
    }
  }, [id]);
  
  const loadSupplier = async (supplierId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await procurementService.getSupplier(supplierId);
      if (response.success) {
        const supplier = response.data;
        form.setFieldsValue({
          legalName: supplier.legalName,
          tradeName: supplier.tradeName,
          contactEmail: supplier.contactEmail,
          contactEmailSecondary: supplier.contactEmailSecondary,
          contactPhone: supplier.contactPhone,
          contactName: supplier.contactName,
          supplierType: supplier.supplierType,
          paymentTerms: supplier.paymentTerms,
          address: supplier.address,
          city: supplier.city,
          state: supplier.state,
          country: supplier.country,
          postalCode: supplier.postalCode,
          taxId: supplier.taxId,
          registrationNumber: supplier.registrationNumber,
          complianceChecked: supplier.complianceChecked,
          status: supplier.status,
          notes: supplier.notes
        });
      } else {
        setError(response.message || 'Failed to load supplier data');
      }
    } catch (err) {
      setError(err.message || 'Error loading supplier');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    
    try {
      let response;
      
      if (isUpdate) {
        response = await procurementService.updateSupplier(id, values);
      } else {
        response = await procurementService.createSupplier(values);
      }
      
      if (response.success) {
        // Navigate back to supplier list
        navigate('/supplier');
      } else {
        setError(response.message || `Failed to ${isUpdate ? 'update' : 'create'} supplier`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card
      title={
        <Space>
          <ShopOutlined />
          {isUpdate ? translate('Update Supplier') : translate('Create New Supplier')}
        </Space>
      }
      extra={
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/supplier')}
        >
          {translate('Back to Suppliers')}
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
      
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            supplierType: 'transactional',
            complianceChecked: false,
            status: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="legalName"
                label={translate('Legal Name')}
                rules={[{ required: true, message: translate('Please enter the legal name') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tradeName"
                label={translate('Trade Name')}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contactEmail"
                label={translate('Contact Email')}
                rules={[
                  { 
                    type: 'email',
                    message: translate('Please enter a valid email address')
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactEmailSecondary"
                label={translate('Secondary Email')}
                rules={[
                  { 
                    type: 'email',
                    message: translate('Please enter a valid email address')
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactPhone"
                label={translate('Contact Phone')}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="contactName"
                label={translate('Contact Person')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="supplierType"
                label={translate('Supplier Type')}
                rules={[{ required: true, message: translate('Please select a supplier type') }]}
              >
                <Select>
                  <Option value="transactional">{translate('Transactional')}</Option>
                  <Option value="strategic">{translate('Strategic')}</Option>
                  <Option value="preferred">{translate('Preferred')}</Option>
                  <Option value="blacklisted">{translate('Blacklisted')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentTerms"
                label={translate('Payment Terms')}
              >
                <Input placeholder="e.g., Net 30" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>{translate('Address Information')}</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label={translate('Address')}
              >
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="city"
                label={translate('City')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="state"
                label={translate('State/Province')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="country"
                label={translate('Country')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="postalCode"
                label={translate('Postal Code')}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>{translate('Additional Information')}</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="taxId"
                label={translate('Tax ID')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="registrationNumber"
                label={translate('Registration Number')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="complianceChecked"
                label={translate('Compliance Checked')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          {isUpdate && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label={translate('Status')}
                  rules={[{ required: true, message: translate('Please select a status') }]}
                >
                  <Select>
                    <Option value="active">{translate('Active')}</Option>
                    <Option value="inactive">{translate('Inactive')}</Option>
                    <Option value="pending_approval">{translate('Pending Approval')}</Option>
                    <Option value="rejected">{translate('Rejected')}</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="notes"
                label={translate('Notes')}
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SaveOutlined />}
            >
              {isUpdate ? translate('Update Supplier') : translate('Create Supplier')}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
}

export default SupplierForm;
