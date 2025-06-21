import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  DatePicker,
  InputNumber,
  Space,
  Alert,
  Typography,
  Descriptions,
  Divider,
  message
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  SaveOutlined
} from '@ant-design/icons';
import moment from 'moment';

import procurementService from '@/services/procurementService';

const { TextArea } = Input;
const { Title } = Typography;

export default function RFQResponse() {
  const { token } = useParams();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rfqResponse, setRFQResponse] = useState(null);

  useEffect(() => {
    loadRFQResponse();
  }, [token]);

  const loadRFQResponse = async () => {
    try {
      const response = await procurementService.getRFQResponse(token);
      if (response.success) {
        setRFQResponse(response.data);
        
        // Pre-fill form with line items
        form.setFieldsValue({
          lineItems: response.data.rfq.lineItems.map(item => ({
            rfqLineItemId: item.id,
            description: item.description,
            quantity: item.quantity,
            uom: item.uom
          }))
        });
      } else {
        setError(response.message || 'Failed to load RFQ details');
      }
    } catch (error) {
      console.error('Error loading RFQ response:', error);
      setError(error.message || 'Error loading RFQ details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await procurementService.submitRFQResponse(token, {
        ...values,
        validUntil: values.validUntil.toISOString(),
        totalAmount: values.lineItems.reduce((sum, item) => 
          sum + (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0)), 0)
      });

      if (response.success) {
        message.success('Quotation submitted successfully');
        // Reload to show updated status
        loadRFQResponse();
      } else {
        setError(response.message || 'Failed to submit quotation');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setError(error.message || 'Error submitting quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom'
    },
    {
      title: 'Unit Price',
      key: 'unitPrice',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'unitPrice']}
          rules={[{ required: true, message: 'Please enter unit price' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    {
      title: 'Lead Time (days)',
      key: 'leadTime',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'leadTime']}
          rules={[{ required: true, message: 'Please enter lead time' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )
    },
    {
      title: 'Comments',
      key: 'comments',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'comments']}
        >
          <Input />
        </Form.Item>
      )
    }
  ];

  if (loading) {
    return <Card loading={true} />;
  }

  if (!rfqResponse) {
    return (
      <Alert
        message="Error"
        description="RFQ not found or access denied"
        type="error"
        showIcon
      />
    );
  }

  const { rfq, supplier, status } = rfqResponse;

  return (
    <Card>
      <Title level={2}>
        <Space>
          <ShoppingOutlined />
          Request for Quotation: {rfq.rfqNumber}
        </Space>
      </Title>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Descriptions title="RFQ Details" bordered column={2}>
        <Descriptions.Item label="Supplier">
          {supplier.legalName}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {status}
        </Descriptions.Item>
        <Descriptions.Item label="Submission Deadline">
          {moment(rfq.submissionDeadline).format('YYYY-MM-DD')}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {rfq.description}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {status === 'submitted' ? (
        <Alert
          message="Quotation Submitted"
          description="Your quotation has been submitted successfully. You will be notified of any updates."
          type="success"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Table
            dataSource={rfq.lineItems}
            columns={columns}
            pagination={false}
            rowKey="id"
          />

          <Divider />

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
            initialValue="USD"
          >
            <Input style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="validUntil"
            label="Valid Until"
            rules={[{ required: true, message: 'Please specify validity period' }]}
          >
            <DatePicker
              style={{ width: 200 }}
              disabledDate={current => current && current < moment().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="deliveryTerms"
            label="Delivery Terms"
            rules={[{ required: true, message: 'Please specify delivery terms' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="paymentTerms"
            label="Payment Terms"
            rules={[{ required: true, message: 'Please specify payment terms' }]}
          >
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="comments"
            label="Additional Comments"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SaveOutlined />}
              size="large"
            >
              Submit Quotation
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}
