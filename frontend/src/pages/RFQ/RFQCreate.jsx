import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Table,
  Card,
  Alert,
  Spin,
  Divider,
  Space,
  message,
  Typography,
  Transfer,
  Tooltip,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import storePersist from '@/redux/storePersist';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const RFQCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();

  // Helper function to create headers with optional authentication
  const createHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Get auth token from Redux store (same as axiosConfig.js)
    try {
      const auth = storePersist.get('auth');
      if (auth?.current?.token) {
        headers['Authorization'] = `Bearer ${auth.current.token}`;
        headers['x-auth-token'] = auth.current.token;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return headers;
  };

  const [loading, setLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [error, setError] = useState(null);

  const [purchaseRequisition, setPurchaseRequisition] = useState(null);
  const [prItems, setPrItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [manualItems, setManualItems] = useState([]);
  const [approvedPRs, setApprovedPRs] = useState([]);
  const [selectedPRId, setSelectedPRId] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const prId = queryParams.get('prId');

  const fetchApprovedPRs = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8888/api/supplier/approved-prs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approved PRs fetched:', data);
        setApprovedPRs(data.result || data.data || []);
      } else {
        console.error('Failed to fetch approved PRs:', response.status);
      }
    } catch (err) {
      console.error('Error fetching approved PRs:', err);
    }
  }, []);

  const fetchPurchaseRequisition = useCallback(async () => {
    if (prId || selectedPRId) {
      setPrLoading(true);
      try {
        const id = prId || selectedPRId;
        // Use direct API call to get PR details
        const response = await fetch(`http://localhost:8888/api/supplier/pr-details/${id}`, {
          method: 'GET',
          headers: createHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const { result } = data;
            setPurchaseRequisition(result);
            setPrItems(result.items || []);
            form.setFieldsValue({
              description: result.description || `RFQ for PR #${result.number || result.prNumber}`,
              prId: result._id || result.id,
            });
          } else {
            setError('Failed to load purchase requisition');
          }
        } else {
          setError('Failed to load purchase requisition');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching the purchase requisition');
      } finally {
        setPrLoading(false);
      }
    }
  }, [prId, selectedPRId, form]);

  const fetchSuppliers = useCallback(async () => {
    try {
      // Direct API call to get active suppliers from Suppliers table
      const response = await fetch('http://localhost:8888/api/supplier/list?status=active', {
        method: 'GET',
        headers: createHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Suppliers fetched:', data);
        setSuppliers(data.result || data.data || []);
      } else {
        console.error('Failed to fetch suppliers:', response.status);
        setError('Failed to load suppliers from database');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err.message || 'An error occurred while fetching suppliers');
    }
  }, []);

  useEffect(() => {
    fetchApprovedPRs();
    fetchSuppliers();
    if (prId) {
      fetchPurchaseRequisition();
    }
  }, [fetchApprovedPRs, fetchSuppliers, fetchPurchaseRequisition]);

  const handlePRSelection = (value) => {
    setSelectedPRId(value);
    // Clear previous PR data
    setPurchaseRequisition(null);
    setPrItems([]);
    form.setFieldsValue({
      description: '',
      prId: value,
    });
  };

  useEffect(() => {
    if (selectedPRId) {
      fetchPurchaseRequisition();
    }
  }, [selectedPRId, fetchPurchaseRequisition]);

  const handleSupplierChange = (newTargetKeys) => {
    setTargetKeys(newTargetKeys);
  };

  const handleAddManualItem = () => {
    setManualItems([
      ...manualItems,
      {
        key: Date.now(),
        itemName: '',
        description: '',
        quantity: 1,
        uom: 'each',
      },
    ]);
  };

  const handleManualItemChange = (key, field, value) => {
    setManualItems(
      manualItems.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveManualItem = (key) => {
    setManualItems(manualItems.filter((item) => item.key !== key));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    // Validate required fields before submission
    console.log('Form values:', values);
    console.log('Target keys (suppliers):', targetKeys);
    console.log('PR Items:', prItems);
    console.log('Manual Items:', manualItems);

    // Check if suppliers are selected
    if (!targetKeys || targetKeys.length === 0) {
      setError('Please select at least one supplier');
      setLoading(false);
      return;
    }

    // Check if items exist (either from PR or manual)
    const hasItems = (prItems && prItems.length > 0) || (manualItems && manualItems.length > 0);
    if (!hasItems) {
      setError('Please add at least one item or select a Purchase Requisition with items');
      setLoading(false);
      return;
    }

    // Validate manual items if they are being used
    if (manualItems.length > 0 && prItems.length === 0) {
      const invalidItems = manualItems.filter(item => 
        !item.itemName || !item.quantity || !item.uom
      );
      if (invalidItems.length > 0) {
        setError('All manual items must have Item Name, Quantity, and UOM filled');
        setLoading(false);
        return;
      }
    }

    // Prepare items data - database expects 'description' as main field
    const itemsToSubmit = prItems.length > 0 ? prItems.map(item => ({
      purchaseRequisitionItemId: item._id || item.id,
      itemNumber: item.itemNumber || null,
      description: item.itemName || item.name || item.description || '',
      quantity: parseFloat(item.quantity) || 0,
      uom: item.uom || item.unit || 'each',
    })) : manualItems.map(item => ({
      itemNumber: null,
      description: item.itemName || item.description || '',
      quantity: parseFloat(item.quantity) || 0,
      uom: item.uom || 'each',
    }));

    const rfqData = {
      description: values.description,
      submissionDeadline: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      supplierIds: targetKeys,
      purchaseRequisitionId: selectedPRId || prId,
      lineItems: itemsToSubmit,
    };

    // Additional validation
    if (!rfqData.description || rfqData.description.trim() === '') {
      setError('RFQ Description is required');
      setLoading(false);
      return;
    }

    if (!rfqData.purchaseRequisitionId) {
      setError('Purchase Requisition is required for creating RFQ');
      setLoading(false);
      return;
    }

    if (!rfqData.submissionDeadline) {
      setError('Due Date is required');
      setLoading(false);
      return;
    }

    if (!rfqData.supplierIds || rfqData.supplierIds.length === 0) {
      setError('At least one supplier must be selected');
      setLoading(false);
      return;
    }

    if (!rfqData.lineItems || rfqData.lineItems.length === 0) {
      setError('At least one item must be included');
      setLoading(false);
      return;
    }

    console.log('Submitting RFQ data:', JSON.stringify(rfqData, null, 2));

    try {
      // Use direct API call to create RFQ (POST to /api/rfq)
      const auth = storePersist.get('auth');
      console.log('Auth from Redux store:', auth);
      console.log('Token exists:', !!auth?.current?.token);
      
      const headers = createHeaders();
      console.log('Headers being sent:', JSON.stringify(headers, null, 2));
      
      const response = await fetch('http://localhost:8888/api/rfq', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(rfqData)
      });

      const data = await response.json();
      
      console.log('Full API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      console.log('Response data details:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        message.success(translate('RFQ created successfully'));
        navigate('/rfq');
        return;
      } else {
        console.error('RFQ creation failed - Full response:', response);
        console.error('RFQ creation failed - Response data:', data);
        console.error('RFQ creation failed - Submitted data:', rfqData);
        
        const errorMessage = data.message || data.error || 'Failed to create RFQ';
        const validationErrors = data.errors || data.validationErrors || [];
        
        if (validationErrors.length > 0) {
          const fieldErrors = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
          setError(`Validation errors: ${fieldErrors}`);
        } else {
          setError(`${errorMessage} (Status: ${response.status})`);
        }
        return;
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating the RFQ');
    } finally {
      setLoading(false);
    }
  };

  // Helper to truncate text with ellipsis and tooltip
  const renderEllipsis = (text, maxLength = 30) => {
    if (!text) return '';
    const display = text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
    return (
      <Tooltip title={text}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: 200 }}>{display}</span>
      </Tooltip>
    );
  };

  const itemColumns = [
    { 
      title: translate('Item Name'), 
      dataIndex: 'itemName', 
      key: 'itemName',
      render: (text) => renderEllipsis(text, 30),
    },
    { 
      title: translate('Description'), 
      dataIndex: 'description', 
      key: 'description',
      render: (text) => renderEllipsis(text, 50),
    },
    { title: translate('Quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: translate('UOM'), dataIndex: 'uom', key: 'uom' },
  ];

  const manualItemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleManualItemChange(record.key, 'itemName', e.target.value)}
        />
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleManualItemChange(record.key, 'description', e.target.value)}
        />
      ),
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleManualItemChange(record.key, 'quantity', e.target.value)}
        />
      ),
    },
    {
      title: translate('UOM'),
      dataIndex: 'uom',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleManualItemChange(record.key, 'uom', e.target.value)}
        />
      ),
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveManualItem(record.key)}>
          {translate('Remove')}
        </Button>
      ),
    },
  ];

  if (prLoading) {
    return <Spin />;
  }

  return (
    <div className="container">
      <Title level={2}>{translate('Create Request for Quotation')}</Title>
      {error && <Alert message={error} type="error" showIcon closable />}
      
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card title={translate('RFQ Details')} style={{ marginBottom: 16 }}>
          {!prId && (
            <Form.Item
              name="selectedPR"
              label={translate('Select Approved Purchase Requisition')}
              rules={[{ required: !prId, message: translate('Please select a Purchase Requisition') }]}
            >
              <Select
                placeholder={translate('Select an approved PR')}
                onChange={handlePRSelection}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {approvedPRs.map(pr => (
                  <Option key={pr.id} value={pr.id}>
                    {pr.prNumber} - {pr.description} ({pr.totalAmount} {pr.currency})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Form.Item
            name="description"
            label={translate('RFQ Description')}
            rules={[{ required: true, message: 'Please enter RFQ description' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item name="prId" label={translate('Purchase Requisition')} hidden>
            <Input disabled />
          </Form.Item>
          
          <Form.Item name="dueDate" label={translate('Due Date')} rules={[{ required: true, message: 'Please select due date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        {(selectedPRId || prId) && (
          <Card title={translate('Selected PR Information')} style={{ marginBottom: 16 }}>
            {purchaseRequisition && (
              <div>
                <p><strong>PR Number:</strong> {purchaseRequisition.prNumber || purchaseRequisition.number}</p>
                <p><strong>Description:</strong> {purchaseRequisition.description}</p>
                <p><strong>Total Amount:</strong> {purchaseRequisition.totalAmount} {purchaseRequisition.currency}</p>
                <p><strong>Cost Center:</strong> {purchaseRequisition.costCenter}</p>
                <p><strong>Status:</strong> {purchaseRequisition.status}</p>
                <p><strong>Items:</strong> {prItems.length} items found</p>
              </div>
            )}
          </Card>
        )}

        <Card 
          title={
            <span>
              {translate('Suppliers')} 
              <span style={{ color: 'red' }}>*</span>
              {targetKeys.length > 0 && (
                <span style={{ color: 'green', marginLeft: 8 }}>
                  ({targetKeys.length} selected)
                </span>
              )}
            </span>
          } 
          style={{ marginBottom: 16 }}
        >
          {targetKeys.length === 0 && (
            <Alert 
              message="Please select at least one supplier" 
              type="warning" 
              style={{ marginBottom: 16 }}
              showIcon 
            />
          )}
          <div style={{ marginBottom: 16 }}>
            <p>Found {suppliers.length} suppliers</p>
            {suppliers.length > 0 && (
              <ul>
                {suppliers.slice(0, 3).map(s => (
                  <li key={s._id || s.id}>
                    {renderEllipsis(s.name || s.legalName, 30)} - {renderEllipsis(s.email, 30)} - Status: {s.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Transfer
            dataSource={suppliers.map(s => ({ 
              key: s._id || s.id, 
              title: s.name || s.legalName || 'Unnamed Supplier', 
              description: s.email || 'No email' 
            }))}
            targetKeys={targetKeys}
            onChange={handleSupplierChange}
            render={(item) => (
              <span>
                {renderEllipsis(item.title, 30)} - {renderEllipsis(item.description, 30)}
              </span>
            )}
            listStyle={{ width: '45%', height: 300 }}
            showSearch
          />
        </Card>

        <Card 
          title={
            <span>
              {translate('Items')} 
              <span style={{ color: 'red' }}>*</span>
              {(prItems.length > 0 || manualItems.length > 0) && (
                <span style={{ color: 'green', marginLeft: 8 }}>
                  ({prItems.length > 0 ? `${prItems.length} from PR` : `${manualItems.length} manual`})
                </span>
              )}
            </span>
          }
        >
          {prItems.length === 0 && manualItems.length === 0 && (
            <Alert 
              message="Please add at least one item or select a Purchase Requisition with items" 
              type="warning" 
              style={{ marginBottom: 16 }}
              showIcon 
            />
          )}
          {prItems.length > 0 ? (
            <Table
              columns={itemColumns}
              dataSource={prItems}
              rowKey="_id"
              pagination={false}
            />
          ) : (
            <>
              <Button
                type="dashed"
                onClick={handleAddManualItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16 }}
              >
                {translate('Add Item')}
              </Button>
              <Table
                columns={manualItemColumns}
                dataSource={manualItems}
                rowKey="key"
                pagination={false}
              />
            </>
          )}
        </Card>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/rfq')}>{translate('Cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {translate('Create RFQ')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default RFQCreate;