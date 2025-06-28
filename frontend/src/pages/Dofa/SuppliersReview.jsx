import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Modal, Form, Input, Select, Tag } from 'antd';
import { TeamOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const SuppliersReview = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form] = Form.useForm();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/suppliers/pending/approval');
      if (response.data.success) {
        setSuppliers(response.data.result);
      } else {
        message.error('Failed to load suppliers for review');
      }
    } catch (error) {
      message.error('Failed to load suppliers for review');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAction = async (supplier, action) => {
    setSelectedSupplier(supplier);
    setModalVisible(true);
    form.setFieldsValue({ action });
  };

  const submitReview = async () => {
    try {
      const values = await form.validateFields();
      const endpoint = values.action === 'approve' 
        ? `/api/suppliers/${selectedSupplier.id}/approve`
        : `/api/suppliers/${selectedSupplier.id}/reject`;
      
      const payload = values.action === 'approve' 
        ? { approvalNotes: values.comments }
        : { rejectionReason: values.comments };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        const actionText = values.action === 'approve' ? 'approved' : 'rejected';
        if (values.action === 'approve') {
          message.success(`Supplier ${actionText} successfully! Acceptance email sent to supplier.`);
        } else {
          message.success(`Supplier ${actionText} successfully!`);
        }
      } else {
        message.error(response.data.message || `Failed to ${values.action} supplier`);
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchSuppliers();
    } catch (error) {
      message.error(`Failed to ${form.getFieldValue('action')} supplier`);
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Supplier Number',
      dataIndex: 'supplierNumber',
      key: 'supplierNumber',
    },
    {
      title: 'Legal Name',
      dataIndex: 'legalName',
      key: 'legalName',
    },
    {
      title: 'Trade Name',
      dataIndex: 'tradeName',
      key: 'tradeName',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: 'Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: 'Phone',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending_approval' ? 'gold' : status === 'approved' ? 'green' : 'red'}>
          {status === 'pending_approval' ? 'PENDING APPROVAL' : status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Submitted By',
      key: 'submittedBy',
      render: (_, record) => record.createdBy ? record.createdBy.name : 'N/A',
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAction(record, 'approve')}
            disabled={record.status !== 'pending_approval'}
            size="small"
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleAction(record, 'reject')}
            disabled={record.status !== 'pending_approval'}
            size="small"
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <TeamOutlined />
            Suppliers Review (DoFA)
          </Space>
        }
        extra={
          <Button onClick={fetchSuppliers} loading={loading}>
            Refresh
          </Button>
        }
      >
        <p>Review and approve/reject suppliers submitted for DoFA approval.</p>
        
        <Table
          columns={columns}
          dataSource={suppliers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`${form.getFieldValue('action')} Supplier`}
        visible={modalVisible}
        onOk={submitReview}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="Submit"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="action" label="Action" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="comments"
            label="Comments"
            rules={[{ required: true, message: 'Please provide comments' }]}
          >
            <TextArea rows={4} placeholder="Enter your review comments..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersReview;
