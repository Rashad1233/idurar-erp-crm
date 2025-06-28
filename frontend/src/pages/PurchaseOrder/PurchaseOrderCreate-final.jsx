import React, { useState, useEffect, useCallback } from 'react';
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
  message,
  Typography,
  InputNumber
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function POCreateForm({ subTotal = 0, offerTotal = 0 }) {
  const [form] = Form.useForm();
  const location = useLocation();
  const translate = useLanguage();

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

  // Update form items whenever items state changes
  useEffect(() => {
    if (items && items.length > 0) {
      // Ensure form items are properly set with the correct structure
      const formItems = items.map((item, index) => ({
        ...item,
        key: item.key || `item-${index}`,
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        unit: item.unit || 'each'
      }));
      
      form.setFieldsValue({ items: formItems });
    }
  }, [items, form]);

  // Calculate subtotal whenever form values change
  const calculateSubtotal = useCallback(() => {
    const formValues = form.getFieldsValue();
    const itemsData = formValues.items || [];
    let total = 0;
    
    itemsData.forEach(item => {
      const quantity = parseFloat(item?.quantity) || 0;
      const price = parseFloat(item?.price) || 0;
      total += quantity * price;
    });
    
    return total;
  }, [form]);

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
                  const mergedItems = rfqItems.map((rfqItem, index) => {
                    const quoteItem = quoteItems.find(qi => 
                      (qi.itemId === (rfqItem._id || rfqItem.id)) || 
                      (qi.itemName === rfqItem.name)
                    );
                    return {
                      key: rfqItem._id || rfqItem.id || `rfq-item-${index}`,
                      itemId: rfqItem._id || rfqItem.id,
                      purchaseRequisitionItemId: rfqItem.purchaseRequisitionItemId,
                      name: rfqItem.name || '',
                      description: rfqItem.description || '',
                      quantity: rfqItem.quantity || 1,
                      price: quoteItem?.price || 0,
                      unit: rfqItem.unit || 'each'
                    };
                  });
                  setItems(mergedItems);
                  form.setFieldsValue({
                    supplier: supplierId,
                    rfq: rfqId,
                    date: moment(),
                    expectedDeliveryDate: moment().add(14, 'days'),
                    incoterms: 'DDP',
                    paymentTerms: '30 days after delivery'
                  });
                }
              })
              .catch(() => {});
            }
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
          const formattedItems = contractItems.map((item, index) => ({
            key: item._id || item.id || `contract-item-${index}`,
            itemId: item._id || item.id,
            name: item.name || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
            unit: item.unit || 'each'
          }));
          setItems(formattedItems);
          form.setFieldsValue({
            supplier: contractResult.supplierId,
            contract: contractId,
            date: moment(),
            expectedDeliveryDate: moment().add(14, 'days'),
            incoterms: contractResult.incoterms || 'DDP',
            paymentTerms: contractResult.paymentTerms || '30 days after delivery'
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
  }, [rfqId, contractId, supplierId, form]);

  const handlePRSelect = (selectedPRId) => {
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
    
    // Find the selected PR from the already fetched data
    const selectedPRData = allPRs.find(pr => (pr._id || pr.id) === selectedPRId);
    
    if (!selectedPRData) {
      message.error('Selected Purchase Requisition not found');
      return;
    }
    
    console.log('Selected PR Data:', selectedPRData);
    
    setSelectedPR(selectedPRData);
    setContractData(null);
    setRfqData(null);
    
    // Filter RFQs associated with this PR
    const relatedRfqs = allRfqs.filter(rfq => 
      rfq.purchaseRequisitionId === selectedPRId && rfq.status === 'in_progress'
    );
    setAvailableRfqs(relatedRfqs);
    
    if (relatedRfqs.length === 1) {
      setRfqData(relatedRfqs[0]);
      form.setFieldsValue({ rfq: relatedRfqs[0]._id || relatedRfqs[0].id });
    } else {
      setRfqData(null);
      form.setFieldsValue({ rfq: null });
    }
    
    // Pre-fill items from PR
    const prItems = selectedPRData.items || [];
    console.log('PR Items:', prItems);
    
    const formattedItems = prItems.map((item, index) => ({
      key: item.id || item._id || `pr-item-${index}`,
      itemId: item.id || item._id,
      name: item.name || item.itemName || item.description || '',
      description: item.description || item.itemDescription || '',
      quantity: parseFloat(item.quantity) || 1,
      price: parseFloat(item.estimatedPrice) || parseFloat(item.unitPrice) || 0,
      unit: item.unit || item.uom || 'each'
    }));
    
    console.log('Formatted Items:', formattedItems);
    
    setItems(formattedItems);
    form.setFieldsValue({
      contract: null,
      purchaseRequisition: selectedPRId,
      rfq: null
    });
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
      const rfqItems = selectedRfq.items || [];
      const formattedItems = rfqItems.map((item, index) => ({
        key: item._id || item.id || `rfq-item-${index}`,
        itemId: item._id || item.id,
        purchaseRequisitionItemId: item.purchaseRequisitionItemId,
        name: item.name || '',
        description: item.description || '',
        quantity: parseFloat(item.quantity) || 1,
        price: 0,
        unit: item.unit || 'each'
      }));
      setItems(formattedItems);
      form.setFieldsValue({
        rfq: selectedRfqId,
        purchaseRequisition: null,
        contract: null
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
      const contractItems = selectedContract.items || [];
      const formattedItems = contractItems.map((item, index) => ({
        key: item._id || item.id || `contract-item-${index}`,
        itemId: item._id || item.id,
        name: item.name || '',
        description: item.description || '',
        quantity: parseFloat(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        unit: item.unit || 'each'
      }));
      setItems(formattedItems);
      const supplierValue = selectedContract.supplierId || selectedContract.supplier;
      form.setFieldsValue({
        contract: selectedContractId,
        purchaseRequisition: null,
        rfq: null,
        supplier: supplierValue
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
      key: `new-item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      unit: 'each'
    };
    const newItems = [...items, newItem];
    setItems(newItems);
  };

  const removeItem = (itemKey) => {
    if (rfqData || contractData || selectedPR) {
      message.warning('Cannot remove items when RFQ, Contract, or Purchase Requisition is selected. Only items from the selected source can be ordered.');
      return;
    }
    const newItems = items.filter(item => item.key !== itemKey);
    setItems(newItems);
  };

  const updateItemField = (index, field, value) => {
    const formValues = form.getFieldsValue();
    const currentItems = formValues.items || [];
    
    if (currentItems[index]) {
      currentItems[index][field] = value;
      form.setFieldsValue({ items: [...currentItems] });
      
      // Update items state to keep it in sync
      const updatedItems = [...items];
      if (updatedItems[index]) {
        updatedItems[index][field] = value;
        setItems(updatedItems);
      }
    }
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item?.quantity) || 0;
    const price = parseFloat(item?.price) || 0;
    return quantity * price;
  };

  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Form.Item
          name={['items', index, 'name']}
          rules={[{ required: true, message: translate('Please enter item name') }]}
          style={{ margin: 0 }}
          initialValue={record.name}
        >
          <Input 
            placeholder={translate('Item name')} 
            onChange={(e) => updateItemField(index, 'name', e.target.value)}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Form.Item
          name={['items', index, 'description']}
          style={{ margin: 0 }}
          initialValue={record.description}
        >
          <Input 
            placeholder={translate('Description')} 
            onChange={(e) => updateItemField(index, 'description', e.target.value)}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (text, record, index) => (
        <Form.Item
          name={['items', index, 'quantity']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
          initialValue={record.quantity}
        >
          <InputNumber 
            min={1} 
            style={{ width: '100%' }} 
            onChange={(value) => updateItemField(index, 'quantity', value)}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text, record, index) => (
        <Form.Item
          name={['items', index, 'unit']}
          style={{ margin: 0 }}
          initialValue={record.unit}
        >
          <Select 
            style={{ width: '100%' }}
            onChange={(value) => updateItemField(index, 'unit', value)}
          >
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
      render: (text, record, index) => (
        <Form.Item
          name={['items', index, 'price']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
          initialValue={record.price}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            formatter={(value) => `$${value}`}
            parser={(value) => value.replace(/^\$\s?/, '')}
            onChange={(value) => updateItemField(index, 'price', value)}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Total'),
      key: 'total',
      width: 120,
      render: (_, record) => {
        const total = calculateItemTotal(record);
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
          disabled={!!rfqData || !!contractData || !!selectedPR}
        />
      )
    }
  ];

  // Calculate current subtotal
  const currentSubtotal = calculateSubtotal();

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

      <Divider>{translate('Items')}</Divider>

      {items.length > 0 ? (
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="key"
          pagination={false}
          bordered
          footer={() => (
            <Button
              type="dashed"
              onClick={addItem}
              block
              icon={<PlusOutlined />}
              disabled={!!rfqData || !!contractData || !!selectedPR}
            >
              {translate('Add Item')}
            </Button>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
          <p>{translate('No items added yet. Select a Purchase Requisition, RFQ, or Contract to load items.')}</p>
          <Button
            type="dashed"
            onClick={addItem}
            icon={<PlusOutlined />}
            disabled={!!rfqData || !!contractData || !!selectedPR}
          >
            {translate('Add Item')}
          </Button>
        </div>
      )}

      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Title level={4}>{translate('Subtotal')}: ${currentSubtotal.toFixed(2)}</Title>
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
