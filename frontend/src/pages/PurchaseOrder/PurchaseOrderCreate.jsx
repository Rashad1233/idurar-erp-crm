import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Table, 
  Divider,
  Space,
  Typography,
  InputNumber,
  App,
  Tooltip,
  Card
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function POCreateForm({ form }) {
  const location = useLocation();
  const translate = useLanguage();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);

  const [rfqData, setRfqData] = useState(null);
  const [availableRfqs, setAvailableRfqs] = useState([]);
  const [allRfqs, setAllRfqs] = useState([]);
  const [availableContracts, setAvailableContracts] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [availablePRs, setAvailablePRs] = useState([]);
  const [allPRs, setAllPRs] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [items, setItems] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  const rfqId = queryParams.get('rfqId');
  const contractId = queryParams.get('contractId');
  const supplierId = queryParams.get('supplierId');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      request.list({ entity: 'supplier' }),
      request.list({ entity: 'rfq' }),
      request.list({ entity: 'contract' }),
      request.get({ entity: 'purchase-requisition' })
    ])
    .then(([suppliersResponse, rfqsResponse, contractsResponse, prsResponse]) => {
      if (suppliersResponse.success) {
        const suppliersData = suppliersResponse.result || suppliersResponse.data || [];
        setSuppliers(suppliersData);
      }
      if (rfqsResponse.success) {
        const rfqsData = rfqsResponse.result || rfqsResponse.data || [];
        setAllRfqs(rfqsData);
        const inProgressRfqs = rfqsData.filter(rfq => rfq.status === 'in_progress');
        setAvailableRfqs(inProgressRfqs);
      }
      if (contractsResponse.success) {
        const contractsData = contractsResponse.result || contractsResponse.data || [];
        setAllContracts(contractsData);
        setAvailableContracts(contractsData);
      }
      if (prsResponse.success) {
        const prsData = prsResponse.result || prsResponse.data || [];
        setAllPRs(prsData);
        const approvedPRs = prsData.filter(pr => pr.status === 'approved');
        setAvailablePRs(approvedPRs);
      }
    })
    .catch(() => {
      message.error('Failed to load suppliers, RFQs, contracts, or PRs');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (rfqId) {
      setRfqLoading(true);
      request.read({ entity: 'rfq', id: rfqId })
      .then(response => {
        if (response.success && response.result) {
          const rfqResult = response.result;
          if (rfqResult.status !== 'in_progress') {
            message.error('Only RFQs with status "in_progress" can be used for Purchase Orders');
            setRfqLoading(false);
            return;
          }
          setRfqData(rfqResult);
          if (supplierId) {
            const supplier = rfqResult.suppliers?.find(s => (s._id || s.id) === supplierId);
            if (supplier) {
              setSelectedSupplier(supplier);
              request.filter({
                entity: 'rfqsupplierresponse',
                filter: { rfq: rfqId, supplier: supplierId }
              })
              .then(quoteResponse => {
                if (quoteResponse.success && quoteResponse.result && quoteResponse.result.length > 0) {
                  const quoteItems = quoteResponse.result[0].items || [];
                  const rfqItems = rfqResult.items || [];
                  // Use RFQ data as primary source, with supplier quote prices when available
                  const mergedItems = rfqItems.map(rfqItem => {
                    const quoteItem = quoteItems.find(qi => 
                      (qi.itemId === (rfqItem._id || rfqItem.id)) || 
                      (qi.itemName === rfqItem.name)
                    );
                    return {
                      key: rfqItem._id || rfqItem.id,
                      itemId: rfqItem._id || rfqItem.id,
                      name: rfqItem.name || rfqItem.itemName || '',
                      description: rfqItem.description || '',
                      quantity: rfqItem.quantity || 0,
                      price: quoteItem?.price || rfqItem.price || rfqItem.unitPrice || 0,
                      unit: rfqItem.unit || rfqItem.uom || 'each'
                    };
                  });
                  setItems(mergedItems);
                  form.setFieldsValue({
                    supplier: supplierId,
                    rfq: rfqId,
                    date: moment(),
                    expectedDeliveryDate: moment().add(14, 'days'),
                    incoterms: 'DDP',
                    paymentTerms: '30 days after delivery',
                    items: mergedItems,
                    description: rfqResult.description || `Purchase Order for RFQ: ${rfqResult.rfqNumber || rfqId}`
                  });
                }
              })
              .catch(() => {});
            }
          } else {
            // No supplier specified, use RFQ data directly
            const rfqItems = rfqResult.items || [];
            const formattedItems = rfqItems.map(item => ({
              key: item._id || item.id,
              itemId: item._id || item.id,
              name: item.name || item.itemName || '',
              description: item.description || '',
              quantity: item.quantity || 0,
              price: item.price || item.unitPrice || 0,
              unit: item.unit || item.uom || 'each'
            }));
            setItems(formattedItems);
            form.setFieldsValue({
              rfq: rfqId,
              date: moment(),
              expectedDeliveryDate: moment().add(14, 'days'),
              incoterms: 'DDP',
              paymentTerms: '30 days after delivery',
              items: formattedItems,
              description: rfqResult.description || `Purchase Order for RFQ: ${rfqResult.rfqNumber || rfqId}`
            });
          }
        }
      })
      .catch(() => {
        message.error('Failed to load RFQ data');
      })
      .finally(() => {
        setRfqLoading(false);
      });
    } else if (contractId) {
      setRfqLoading(true);
      request.read({ entity: 'contract', id: contractId })
      .then(response => {
        if (response.success && response.result) {
          const contractResult = response.result;
          setContractData(contractResult);
          const contractItems = contractResult.items || [];
          const formattedItems = contractItems.map(item => ({
            key: item._id || item.id,
            itemId: item._id || item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price || 0,
            unit: item.unit
          }));
          setItems(formattedItems);
          form.setFieldsValue({
            supplier: contractResult.supplierId,
            contract: contractId,
            date: moment(),
            expectedDeliveryDate: moment().add(14, 'days'),
            incoterms: contractResult.incoterms || 'DDP',
            paymentTerms: contractResult.paymentTerms || '30 days after delivery',
            items: formattedItems,
            description: contractResult.description || `Purchase Order for Contract: ${contractResult.contractNumber || contractId}`
          });
        }
      })
      .catch(() => {
        message.error('Failed to load Contract data');
      })
      .finally(() => {
        setRfqLoading(false);
      });
    }
  }, [rfqId, contractId, supplierId]);

  const handlePRSelect = async (selectedPRId) => {
    // Handle empty string (Not Assigned) case
    if (!selectedPRId || selectedPRId === "") {
      setSelectedPR(null);
      setContractData(null);
      setRfqData(null);
      setAvailableRfqs([]);
      setItems([]);
      form.setFieldsValue({
        purchaseRequisition: selectedPRId,
        rfq: null,
        contract: null,
        items: []
      });
      return;
    }

    try {
      setLoading(true);
      // Fetch PR details using direct API call (same as RFQ create)
      const response = await fetch(`http://localhost:8888/api/supplier/pr-details/${selectedPRId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('PR Response:', data); // Debug log
        
        if (data.success) {
          const prData = data.result;
          console.log('PR Data:', prData); // Debug log
        setSelectedPR(prData);
        setContractData(null);
        setRfqData(null);

        // Filter RFQs associated with this PR using correct foreign key
        const relatedRfqs = allRfqs.filter(rfq =>
          (rfq.purchaseRequisitionId === selectedPRId || rfq.purchaseRequisition === selectedPRId) && rfq.status === 'in_progress'
        );
        setAvailableRfqs(relatedRfqs);

        if (relatedRfqs.length === 1) {
          setRfqData(relatedRfqs[0]);
          form.setFieldsValue({ rfq: relatedRfqs[0]._id || relatedRfqs[0].id });
        } else {
          setRfqData(null);
          form.setFieldsValue({ rfq: null });
        }

        // Use PR data as the primary and exclusive source for all item information
        const prItems = prData.items || [];
        console.log('PR Items:', prItems); // Debug log
        
        const formattedItems = prItems.map(item => ({
          key: item.id || item._id || Date.now() + Math.random(),
          itemId: item.id || item._id,
          name: item.itemName || item.name || '',
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          price: parseFloat(item.unitPrice) || 0,
          unit: item.uom || item.unit || 'each'
        }));

        console.log('Formatted Items:', formattedItems); // Debug log
        setItems(formattedItems);
        form.setFieldsValue({
          items: formattedItems,
          contract: null,
          purchaseRequisition: selectedPRId,
          rfq: null, // Clear RFQ selection when PR is selected
          description: prData.description || `Purchase Order for PR: ${prData.prNumber || selectedPRId}`
        });
        } else {
          console.error('PR API response not successful:', data);
          message.error('Failed to load Purchase Requisition items - API response not successful');
        }
      } else {
        console.error('HTTP response not ok:', response.status, response.statusText);
        message.error(`Failed to load Purchase Requisition items - HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching Purchase Requisition items:', error);
      message.error(`Error fetching Purchase Requisition items: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRfqSelect = (selectedRfqId) => {
    if (!selectedRfqId) return;
    const selectedRfq = availableRfqs.find(rfq => (rfq._id || rfq.id) === selectedRfqId);
    if (selectedRfq) {
      setRfqData(selectedRfq);
      setContractData(null);
      setSelectedPR(null);
      form.setFieldsValue({ purchaseRequisition: null, contract: null });
      setAvailablePRs([]);
      setAvailableContracts([]);
      
      // Use RFQ data as the primary and exclusive source for all item information
      // This ensures no mixing with PR data - RFQ is self-contained
      const rfqItems = selectedRfq.items || [];
      const formattedItems = rfqItems.map(item => ({
        key: item._id || item.id,
        itemId: item._id || item.id,
        name: item.name || item.itemName || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        price: item.price || item.unitPrice || 0,
        unit: item.unit || item.uom || 'each'
      }));
      
      setItems(formattedItems);
      form.setFieldsValue({
        items: formattedItems,
        rfq: selectedRfqId,
        purchaseRequisition: null,
        contract: null,
        description: selectedRfq.description || `Purchase Order for RFQ: ${selectedRfq.rfqNumber || selectedRfqId}`
      });
    }
  };

  const handleContractSelect = (selectedContractId) => {
    if (!selectedContractId) return;
    const selectedContract = availableContracts.find(contract => (contract._id || contract.id) === selectedContractId);
    if (selectedContract) {
      setContractData(selectedContract);
      setRfqData(null);
      setSelectedPR(null);
      form.setFieldsValue({ rfq: null });
      setAvailableRfqs(allRfqs.filter(rfq => rfq.status === 'in_progress'));
      
      // Use Contract data as the primary and exclusive source for all item information
      const contractItems = selectedContract.items || [];
      const formattedItems = contractItems.map(item => ({
        key: item._id || item.id,
        itemId: item._id || item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price || 0,
        unit: item.unit
      }));
      setItems(formattedItems);
      const supplierValue = selectedContract.supplierId || selectedContract.supplier;
      form.setFieldsValue({
        items: formattedItems,
        contract: selectedContractId,
        purchaseRequisition: null,
        rfq: null,
        supplier: supplierValue,
        description: selectedContract.description || `Purchase Order for Contract: ${selectedContract.contractNumber || selectedContractId}`
      });
      setAvailablePRs(allPRs.filter(pr => pr.status === 'approved'));
    }
  };

  const handleReset = () => {
    form.resetFields();
    setRfqData(null);
    setContractData(null);
    setSelectedPR(null);
    setItems([]);
    setAvailableRfqs(allRfqs.filter(rfq => rfq.status === 'in_progress'));
    setAvailablePRs(allPRs.filter(pr => pr.status === 'approved'));
    message.success('Form has been reset');
  };

  const addItem = () => {
    if (rfqData || contractData || selectedPR) {
      message.warning('Cannot add items when RFQ, Contract, or Purchase Requisition is selected. Only items from the selected source can be ordered.');
      return;
    }
    const newItem = {
      key: Date.now(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      unit: 'each'
    };
    setItems([...items, newItem]);
    const formItems = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: [...formItems, newItem]
    });
  };

  const removeItem = (itemKey) => {
    if (rfqData || contractData || selectedPR) {
      message.warning('Cannot remove items when RFQ, Contract, or Purchase Requisition is selected. Only items from the selected source can be ordered.');
      return;
    }
    const newItems = items.filter(item => item.key !== itemKey);
    setItems(newItems);
    const formItems = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: formItems.filter(item => item.key !== itemKey)
    });
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
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

  // Read-only columns for PR/RFQ/Contract items
  const readOnlyItemColumns = [
    { 
      title: translate('Item Name'), 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => renderEllipsis(text, 30),
    },
    { 
      title: translate('Description'), 
      dataIndex: 'description', 
      key: 'description',
      render: (text) => renderEllipsis(text, 50),
    },
    { title: translate('Quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: translate('Unit'), dataIndex: 'unit', key: 'unit' },
    { 
      title: translate('Price'), 
      dataIndex: 'price', 
      key: 'price',
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: translate('Total'),
      key: 'total',
      render: (_, record) => {
        const total = calculateItemTotal(record);
        return `$${total.toFixed(2)}`;
      }
    }
  ];

  // Editable columns for manual items
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'name']}
          rules={[{ required: true, message: translate('Please enter item name') }]}
          style={{ margin: 0 }}
        >
          <Input placeholder={translate('Item name')} />
        </Form.Item>
      )
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'description']}
          style={{ margin: 0 }}
        >
          <Input placeholder={translate('Description')} />
        </Form.Item>
      )
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'quantity']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      )
    },
    {
      title: translate('Unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'unit']}
          style={{ margin: 0 }}
        >
          <Select style={{ width: '100%' }}>
            <Option value="each">{translate('Each')}</Option>
            <Option value="kg">{translate('Kg')}</Option>
            <Option value="liter">{translate('Liter')}</Option>
            <Option value="box">{translate('Box')}</Option>
            <Option value="set">{translate('Set')}</Option>
          </Select>
        </Form.Item>
      )
    },
    {
      title: translate('Price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'price']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            formatter={(value) => `$${value}`}
            parser={(value) => value.replace(/^\$\s?/, '')}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Total'),
      key: 'total',
      width: 120,
      render: (_, record, index) => {
        const formValues = form.getFieldsValue();
        const item = formValues.items?.[index] || {};
        const total = calculateItemTotal(item);
        return `$${total.toFixed(2)}`;
      }
    },
    {
      title: translate('Actions'),
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeItem(record.key)}
          disabled={!!rfqData || !!contractData || !!selectedPR} // Disable if RFQ, Contract, or PR is selected
        />
      )
    }
  ];

  // Calculate subtotal
  const subTotal = items.reduce((total, item) => {
    return total + calculateItemTotal(item);
  }, 0);

  // Sync items with form fields whenever items change
  useEffect(() => {
    form.setFieldValue('items', items);
  }, [items, form]);

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleReset}
        >
          {translate('Reset Form')}
        </Button>
      </div>

      <Form.Item
        name="description"
        label={translate('Description')}
        rules={[{ required: true, message: translate('Please enter a description') }]}
      >
        <TextArea 
          rows={2} 
          placeholder={translate('Enter purchase order description')} 
        />
      </Form.Item>

      <Form.Item
        name="supplier"
        label={translate('Supplier')}
        rules={[{ required: true, message: translate('Please select a supplier') }]}
      >
        <Select 
          placeholder={translate('Select Supplier')}
          loading={loading}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {suppliers.map(supplier => (
            <Option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>{supplier.name}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="purchaseRequisition"
        label={`${translate('Purchase Requisition')} (only for contracts, no need for RFQ)`}
        rules={[{ required: false }]}
      >
        <Select
          placeholder={translate('Select Purchase Requisition')}
          loading={loading}
          onChange={handlePRSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option value="">- Not Assigned -</Option>
          {availablePRs.map(pr => (
            <Option key={pr._id || pr.id} value={pr._id || pr.id}>
              {pr.prNumber} - {pr.description}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item 
        name="rfq" 
        label={`${translate('RFQ Reference')} (only used with suppliers, no need for contract or PR (autopopulated))`}
        rules={[{ required: false }]}
      >
        <Select 
          placeholder={translate('Select RFQ (In Progress only)')}
          loading={loading}
          onChange={handleRfqSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option value="">- Not Assigned -</Option>
          {availableRfqs.map(rfq => (
            <Option key={rfq._id || rfq.id} value={rfq._id || rfq.id}>
              {rfq.rfqNumber} - {rfq.description}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="contract"
        label={`${translate('Contract Reference')} (Only With PRs, no need for RFQ)`}
        rules={[{ required: false }]}
      >
        <Select 
          placeholder={translate('Select Contract')}
          loading={loading}
          onChange={handleContractSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option value="">- Not Assigned -</Option>
          {availableContracts.map(contract => (
            <Option key={contract._id || contract.id} value={contract._id || contract.id}>
              {contract.contractNumber} - {contract.description}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Space size="large" style={{ display: 'flex' }}>
        <Form.Item
          name="date"
          label={translate('Date')}
          rules={[{ required: true, message: translate('Please select date') }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="expectedDeliveryDate"
          label={translate('Expected Delivery Date')}
          rules={[{ required: true, message: translate('Please select expected delivery date') }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Space>

      <Space size="large" style={{ display: 'flex' }}>
        <Form.Item
          name="incoterms"
          label={translate('Incoterms')}
          rules={[{ required: true, message: translate('Please select incoterms') }]}
          style={{ width: '100%' }}
        >
          <Select placeholder={translate('Select Incoterms')}>
            <Option value="DDP">DDP - Delivered Duty Paid</Option>
            <Option value="FCA">FCA - Free Carrier</Option>
            <Option value="CIP">CIP - Carriage and Insurance Paid</Option>
            <Option value="EXW">EXW - Ex Works</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="paymentTerms"
          label={translate('Payment Terms')}
          rules={[{ required: true, message: translate('Please select payment terms') }]}
          style={{ width: '100%' }}
        >
          <Select placeholder={translate('Select Payment Terms')}>
            <Option value="30 days after delivery">30 days after delivery</Option>
            <Option value="45 days after delivery">45 days after delivery</Option>
            <Option value="prepayment">Prepayment</Option>
            <Option value="partial prepayment">Partial prepayment</Option>
          </Select>
        </Form.Item>
      </Space>

      <Form.Item name="department" label={translate('Department')}>
        <Input placeholder={translate('Requesting department')} />
      </Form.Item>

      <Form.Item name="notes" label={translate('Notes')}>
        <TextArea rows={4} placeholder={translate('Notes or special instructions')} />
      </Form.Item>

      {/* Hidden field to store items in form */}
      <Form.Item name="items" style={{ display: 'none' }}>
        <Input type="hidden" />
      </Form.Item>

      <Card title={translate('Items')}>
        {(rfqData || contractData || selectedPR) ? (
          <Table
            columns={readOnlyItemColumns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            bordered
          />
        ) : (
          <>
            <Button
              type="dashed"
              onClick={addItem}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              {translate('Add Item')}
            </Button>
            <Table
              columns={itemColumns}
              dataSource={items}
              rowKey="key"
              pagination={false}
              bordered
            />
          </>
        )}
      </Card>

      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Title level={4}>{translate('Subtotal')}: ${subTotal.toFixed(2)}</Title>
      </div>
    </>
  );
}

function PurchaseOrderCreate() {
  const config = {
    entity: 'purchase-order',
  };

  return <CreateItem config={config} CreateForm={POCreateForm} />;
}

export default PurchaseOrderCreate;
