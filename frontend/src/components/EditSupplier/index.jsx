import React, { useState } from 'react';
import { Button, Form, Modal, Input, Select, Switch, message, Space, Typography, Descriptions } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import useLanguage from '@/locale/useLanguage';

const { Text } = Typography;

const EditSupplier = ({ supplier, onSuccess }) => {
  const translate = useLanguage();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Handle View Modal
  const showViewModal = () => {
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
  };

  // Handle Edit Modal
  const showEditModal = () => {
    form.setFieldsValue({
      legalName: supplier.legalName,
      tradeName: supplier.tradeName,
      email: supplier.email,
      secondaryEmail: supplier.secondaryEmail || undefined,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms || undefined,
      supplierType: supplier.supplierType || 'transactional',
      complianceChecked: supplier.complianceChecked || false,
      comments: supplier.comments || undefined,
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  // Handle Delete
  const showDeleteConfirm = () => {
    Modal.confirm({
      title: translate('Are you sure you want to delete this supplier?'),
      icon: <ExclamationCircleOutlined />,
      content: `${supplier.tradeName} - ${supplier.legalName}`,
      okText: translate('Yes'),
      okType: 'danger',
      cancelText: translate('No'),
      onOk() {
        handleDelete();
      },
    });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const supplierId = supplier.id || supplier._id;
      
      if (!supplierId) {
        message.error('Invalid supplier ID');
        return;
      }

      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const url = `${normalizedBase}/supplier/${supplierId}`;
      
      const response = await axios.delete(url);
      
      if (response.data.success) {
        message.success('Supplier deleted successfully');
        onSuccess && onSuccess();
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error('Error deleting supplier: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const supplierId = supplier.id || supplier._id;
      if (!supplierId) {
        message.error('Invalid supplier ID');
        return;
      }

      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const url = `${normalizedBase}/supplier/${supplierId}`;
      
      const response = await axios.patch(url, {
        ...values,
        type: 'supplier'
      });
      
      if (response.data.success) {
        message.success('Supplier updated successfully');
        setIsEditModalVisible(false);
        onSuccess && onSuccess();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      message.error('Error updating supplier: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Space>
        <Button type="primary" size="small" onClick={showViewModal}>
          {translate('View')}
        </Button>
        <Button size="small" onClick={showEditModal}>
          {translate('Edit')}
        </Button>
        <Button danger size="small" onClick={showDeleteConfirm}>
          {translate('Delete')}
        </Button>
      </Space>

      {/* View Modal */}
      <Modal
        title={translate('View Supplier')}
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            {translate('Close')}
          </Button>
        ]}
        width={700}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label={translate('Legal Name')}>
            {supplier.legalName}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Trade Name')}>
            {supplier.tradeName}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Email')}>
            {supplier.email}
          </Descriptions.Item>
          {supplier.secondaryEmail && (
            <Descriptions.Item label={translate('Secondary Email')}>
              {supplier.secondaryEmail}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={translate('Phone')}>
            {supplier.phone}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Address')}>
            {supplier.address}
          </Descriptions.Item>
          {supplier.paymentTerms && (
            <Descriptions.Item label={translate('Payment Terms')}>
              {supplier.paymentTerms}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={translate('Supplier Type')}>
            {supplier.supplierType === 'strategic' ? 'Strategic' : 'Transactional'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Compliance Checked')}>
            {supplier.complianceChecked ? 'Yes' : 'No'}
          </Descriptions.Item>
          {supplier.comments && (
            <Descriptions.Item label={translate('Comments')}>
              {supplier.comments}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={translate('Edit Supplier')}
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            supplierType: 'transactional',
            complianceChecked: false
          }}
        >
          <Form.Item
            name="legalName"
            label={translate('Supplier Legal Name')}
            rules={[{ required: true, message: translate('Please input the supplier legal name!') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="tradeName"
            label={translate('Supplier Trade Name')}
            rules={[{ required: true, message: translate('Please input the supplier trade name!') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={translate('Contact Email')}
            rules={[
              { type: 'email', message: translate('Please enter a valid email address!') },
              { required: true, message: translate('Please input the supplier email!') }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="secondaryEmail"
            label={translate('Secondary Contact Email')}
            rules={[{ type: 'email', message: translate('Please enter a valid email address!') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label={translate('Phone')}
            rules={[{ required: true, message: translate('Please input the supplier phone number!') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label={translate('Address')}
            rules={[{ required: true, message: translate('Please input the supplier address!') }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="paymentTerms"
            label={translate('Payment Terms')}
          >
            <Select>
              <Select.Option value="30">{translate('30 days')}</Select.Option>
              <Select.Option value="45">{translate('45 days')}</Select.Option>
              <Select.Option value="60">{translate('60 days')}</Select.Option>
              <Select.Option value="immediate">{translate('Immediate payment')}</Select.Option>
              <Select.Option value="prepaid">{translate('Prepaid')}</Select.Option>
              <Select.Option value="partial">{translate('Partial prepayment')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="supplierType"
            label={translate('Supplier Type')}
            rules={[{ required: true, message: translate('Please select the supplier type!') }]}
          >
            <Select>
              <Select.Option value="transactional">{translate('Transactional')}</Select.Option>
              <Select.Option value="strategic">{translate('Strategic')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="complianceChecked"
            label={translate('Compliance Checked')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="comments"
            label={translate('Comments')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {translate('Update Supplier')}
              </Button>
              <Button onClick={handleEditCancel}>
                {translate('Cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditSupplier;
