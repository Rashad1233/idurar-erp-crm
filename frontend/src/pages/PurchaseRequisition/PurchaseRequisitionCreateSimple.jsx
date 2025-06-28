import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Table, Space, message, Card, Row, Col, Divider, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { request } from '@/request';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const PurchaseRequisitionCreateSimple = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [itemMasters, setItemMasters] = useState([]);

  // Fetch item masters on component mount
  useEffect(() => {
    fetchItemMasters();
  }, []);

  const fetchItemMasters = async () => {
    try {
      console.log('🔍 Fetching item masters...');
      // Fetch all item masters, ordered by id ASC
      const response = await request.get({ entity: 'item-master?orderBy=id&order=asc' });
      console.log('📡 Item masters response:', response);
      console.log('📡 Response structure:', {
        success: response.success,
        data: response.data,
        result: response.result,
        hasData: !!response.data,
        hasResult: !!response.result,
        dataLength: response.data ? response.data.length : 'N/A',
        resultLength: response.result ? response.result.length : 'N/A'
      });
      
      if (response.success && response.data) {
        console.log('✅ Item masters loaded:', response.data.length);
        setItemMasters(response.data);
      } else if (response.success && response.result) {
        console.log('✅ Item masters loaded from result:', response.result.length);
        setItemMasters(response.result);
      } else {
        console.log('❌ Item masters response not successful:', response);
        console.log('❌ Response keys:', Object.keys(response));
      }
    } catch (error) {
      console.error('❌ Error fetching item masters:', error);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      itemMasterId: null,
      itemNumber: '',
      description: '',
      uom: 'EA',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      deliveryDate: null,
      comments: ''
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (key) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key, field, value, extraFields = {}) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value, ...extraFields };
        // Auto-calculate total price
        if (field === 'quantity' || field === 'unitPrice' || extraFields.unitPrice !== undefined || extraFields.quantity !== undefined) {
          updatedItem.totalPrice = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleSubmit = async (values) => {
    console.log('🚀 handleSubmit called with values:', values);
    console.log('🚀 Current items:', items);
    
    if (items.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      // Prepare the data in the format expected by the backend
      const prData = {
        description: values.description,
        costCenter: values.costCenter,
        currency: values.currency || 'USD',
        notes: values.notes,
        requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : null,
        totalValue: calculateTotalAmount(),
        items: items.map(item => ({
          itemNumber: item.itemNumber || null,
          description: item.description || item.itemName || 'Unnamed Item',
          itemName: item.description, // For compatibility
          uom: item.uom || 'EA',
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0,
          supplierId: item.supplierId || null,
          supplierName: item.supplierName || null,
          contractId: item.contractId || null,
          deliveryDate: item.deliveryDate ? moment(item.deliveryDate).format('YYYY-MM-DD') : null,
          comments: item.comments || null
        }))
      };

      console.log('Submitting PR data:', prData);

      const response = await request.post({ entity: '/procurement/purchase-requisition', jsonData: prData });
      
      if (response.success) {
        message.success('Purchase Requisition created successfully');
        navigate('/purchase-requisition');
      } else {
        message.error(response.message || 'Failed to create Purchase Requisition');
      }
    } catch (error) {
      console.error('Error creating PR:', error);
      message.error(error.message || 'Failed to create Purchase Requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const values = await form.validateFields();
    await handleSubmit(values);
  };

  const columns = [
    {
      title: 'Item Master',
      dataIndex: 'itemMasterId',
      width: 200,
      render: (value, record) => (
        <Select
          value={value || undefined}
          onChange={val => {
            const selected = itemMasters.find(im => im.id === val);
            handleItemChange(record.key, 'itemMasterId', val, {
              itemNumber: selected ? selected.itemNumber : '',
              description: selected ? selected.shortDescription : '',
              uom: selected ? selected.uom : 'EA',
              quantity: 1,
              unitPrice: 0
            });
          }}
          placeholder={`Select item master (${itemMasters.length} available)`}
          showSearch
          optionFilterProp="children"
          style={{ width: '100%' }}
          notFoundContent={itemMasters.length === 0 ? "Loading item masters..." : "No items found"}
        >
          {itemMasters.map(im => (
            <Option key={im.id} value={im.id}>{im.itemNumber} - {im.shortDescription}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
      render: (text, record) => {
        console.log('🔍 Description render - text:', text, 'record.description:', record.description, 'full record:', record);
        return (
          <Input.TextArea
            value={record.description || ''}
            onChange={(e) => handleItemChange(record.key, 'description', e.target.value)}
            placeholder="Item description"
            autoSize={{ minRows: 1, maxRows: 3 }}
          />
        );
      },
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      width: 120, // Increased width for better dropdown visibility
      render: (text, record) => (
        <Select
          value={record.uom || 'EA'}
          onChange={(value) => handleItemChange(record.key, 'uom', value)}
          style={{ width: 120 }} // Increased width for dropdown
          getPopupContainer={triggerNode => triggerNode.parentNode}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 160 }}
        >
          <Option value="EA">EA</Option>
          <Option value="BOX">BOX</Option>
          <Option value="KG">KG</Option>
          <Option value="LTR">LTR</Option>
          <Option value="MTR">MTR</Option>
          <Option value="PCS">PCS</Option>
        </Select>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={record.quantity || 0}
          onChange={(value) => handleItemChange(record.key, 'quantity', value)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={record.unitPrice || 0}
          onChange={(value) => handleItemChange(record.key, 'unitPrice', value)}
          min={0}
          precision={2}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      width: 120,
      render: (text, record) => `$${(record.totalPrice || 0).toFixed(2)}`,
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      width: 140,
      render: (text, record) => (
        <DatePicker
          value={record.deliveryDate ? moment(record.deliveryDate) : null}
          onChange={(date) => handleItemChange(record.key, 'deliveryDate', date)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      width: 150,
      render: (text, record) => (
        <Input
          value={record.comments || ''}
          onChange={(e) => handleItemChange(record.key, 'comments', e.target.value)}
          placeholder="Comments"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>Create Purchase Requisition</Title>
        
        {/* Debug Info */}
        {/* <div style={{ padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '16px', fontSize: '12px' }}>
          <strong>Debug:</strong> Item Masters loaded: {itemMasters.length} | 
          Items in table: {items.length}
          <br />
          <strong>Current Items:</strong> {JSON.stringify(items, null, 2)}
        </div> */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} placeholder="Enter purchase requisition description" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="costCenter"
                    label="Cost Center"
                    rules={[{ required: true, message: 'Please select cost center' }]}
                  >
                    <Select placeholder="Select cost center">
                      <Option value="IT">IT Department</Option>
                      <Option value="HR">HR Department</Option>
                      <Option value="ADMIN">Administration</Option>
                      <Option value="OPS">Operations</Option>
                      <Option value="SALES">Sales</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="currency"
                    label="Currency"
                    initialValue="USD"
                  >
                    <Select>
                      <Option value="USD">USD</Option>
                      <Option value="EUR">EUR</Option>
                      <Option value="GBP">GBP</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="requiredDate"
                    label="Required Date"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="notes"
                    label="Notes"
                  >
                    <TextArea rows={1} placeholder="Additional notes" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              onClick={handleAddItem}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Item
            </Button>
          </div>

          <Table
            key={items.length}
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 1500 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <strong>${calculateTotalAmount().toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} colSpan={5} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => navigate('/purchase-requisition')}
            >
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default PurchaseRequisitionCreateSimple;
