import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Divider, Spin, Alert, Space, message } from 'antd';
import { FileProtectOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import moment from 'moment';

function PurchaseOrderReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPO = async () => {
      setLoading(true);
      setError(null);
      try {
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
        } else {
          setError('Failed to load purchase order details');
        }
      } catch (err) {
        setError(err.message || 'Error loading purchase order details');
      } finally {
        setLoading(false);
      }
    };
    fetchPO();
  }, [id]);

  const handleSubmitForApproval = async () => {
    setActionLoading(true);
    try {
      // Use PATCH to update status to submitted (RESTful pattern)
      const response = await fetch(`http://localhost:8888/api/procurement/purchase-order/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'pending_approval' })
      });
      
      if (response.status === 404) {
        message.error(translate('Submit endpoint not found. Please check your backend API route.'));
        setActionLoading(false);
        return;
      }
      
      // If no content, treat as success
      if (response.status === 204 || (response.status === 200 && response.headers.get('content-length') === '0')) {
        message.success(translate('Purchase Order submitted for approval'));
        navigate('/purchase-order');
        setActionLoading(false);
        return;
      }
      
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // If not JSON, treat as success
        message.success(translate('Purchase Order submitted for approval'));
        navigate('/purchase-order');
        setActionLoading(false);
        return;
      }
      
      if (data.success !== false) {
        message.success(translate('Purchase Order submitted for approval'));
        navigate('/purchase-order');
      } else {
        message.error(data.message || translate('Failed to submit Purchase Order'));
      }
    } catch (err) {
      message.error(err.message || translate('An error occurred'));
      console.error('Error submitting PO:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" />;
  if (!purchaseOrder) return <Alert message={translate('Purchase Order not found')} type="warning" />;

  return (
    <div className="purchase-order-review-page">
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>{translate('Review Purchase Order')} - {purchaseOrder.poNumber}</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<FileProtectOutlined />}
            loading={actionLoading}
            onClick={handleSubmitForApproval}
          >
            {translate('Submit for Approval')}
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label={translate('PO Number')}>
            {purchaseOrder.poNumber || 'Not Assigned'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Status')}>
            <Tag>{translate(purchaseOrder.status?.toUpperCase() || 'DRAFT')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={translate('Supplier')}>
            {purchaseOrder.supplier?.legalName || purchaseOrder.supplier?.name || purchaseOrder.supplierId || 'Not Assigned'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Date')}>
            {purchaseOrder.date ? moment(purchaseOrder.date).format('YYYY-MM-DD') : 'Not Assigned'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Department')}>
            {purchaseOrder.department || 'Not Assigned'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Total Amount')}>
            {purchaseOrder.totalAmount ? `$${parseFloat(purchaseOrder.totalAmount).toFixed(2)}` : 'Not Assigned'}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Table
          columns={[
            { title: translate('Item'), dataIndex: 'name', key: 'name' },
            { title: translate('Description'), dataIndex: 'description', key: 'description' },
            { title: translate('Quantity'), dataIndex: 'quantity', key: 'quantity' },
            { title: translate('Unit'), dataIndex: 'uom', key: 'uom' },
            { title: translate('Unit Price'), dataIndex: 'unitPrice', key: 'unitPrice', render: (v) => `$${parseFloat(v).toFixed(2)}` },
            { title: translate('Total'), key: 'total', render: (_, r) => `$${(parseFloat(r.quantity) * parseFloat(r.unitPrice)).toFixed(2)}` }
          ]}
          dataSource={purchaseOrder.items?.map(item => ({ ...item, key: item.id })) || []}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
}

export default PurchaseOrderReview;
