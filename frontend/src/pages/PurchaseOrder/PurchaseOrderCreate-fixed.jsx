import React, { useState, useEffect } from 'react';
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
  InputNumber
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import PurchaseRequisitionDebugger from '@/components/PurchaseRequisitionDebugger';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

// Create Form component to be passed to the CreateItem component
function POCreateForm({ subTotal, offerTotal }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [rfqData, setRfqData] = useState(null);
  const [availableRfqs, setAvailableRfqs] = useState([]);
  const [allRfqs, setAllRfqs] = useState([]); // Store all RFQs for filtering
  const [availableContracts, setAvailableContracts] = useState([]);
  const [allContracts, setAllContracts] = useState([]); // Store all contracts for filtering
  const [availablePRs, setAvailablePRs] = useState([]);
  const [allPRs, setAllPRs] = useState([]); // Store all PRs with full data
  const [selectedPR, setSelectedPR] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [contractData, setContractData] = useState(null);
  
  // Parse query params to get RFQ ID or Contract ID if provided
  const queryParams = new URLSearchParams(location.search);
  const rfqId = queryParams.get('rfqId');
  const contractId = queryParams.get('contractId');
  const supplierId = queryParams.get('supplierId');
  
  // Load suppliers, available RFQs, PRs and contracts
  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      request.list({ entity: 'supplier' }),
      request.list({ entity: 'rfq' }),
      request.list({ entity: 'contract' }),
      // Use request.get() for purchase-requisition to hit the root path
      request.get({ entity: 'purchase-requisition' })
    ])
      .then(([suppliersResponse, rfqsResponse, contractsResponse, prsResponse]) => {
        console.log('Suppliers response:', suppliersResponse);
        console.log('RFQs response:', rfqsResponse);
        console.log('Contracts response:', contractsResponse);
        console.log('PRs response:', prsResponse);

        if (suppliersResponse.success) {
          const suppliersData = suppliersResponse.result || suppliersResponse.data || [];
          setSuppliers(suppliersData);
        }
        if (rfqsResponse.success) {
          const rfqsData = rfqsResponse.result || rfqsResponse.data || [];
          setAllRfqs(rfqsData); // Store all RFQs
          // Filter RFQs to only show those with 'in_progress' status
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
          setAllPRs(prsData); // Store all PRs with full data
          // Filter PRs to show only approved ones
          const approvedPRs = prsData.filter(pr => pr.status === 'approved');
          setAvailablePRs(approvedPRs);
        }
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        message.error('Failed to load suppliers, RFQs, and contracts');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Load RFQ or Contract data if ID is provided
  useEffect(() => {
    if (rfqId) {
      setRfqLoading(true);
      
      request.read({ entity: 'rfq', id: rfqId })
        .then(response => {
          if (response.success && response.result) {
            const rfqResult = response.result;
            
            // Validate RFQ status is 'in_progress'
            if (rfqResult.status !== 'in_progress') {
              message.error('Only RFQs with status "in_progress" can be used for Purchase Orders');
              setRfqLoading(false);
              return;
            }
            
            setRfqData(rfqResult);
            
            // Load selected supplier and quote items if supplier ID is provided
            if (supplierId) {
              const supplier = rfqResult.suppliers?.find(s => (s._id || s.id) === supplierId);
              if (supplier) {
                setSelectedSupplier(supplier);
                
                // Get supplier quote items
                request.filter({
                  entity: 'rfqsupplierresponse',
                  filter: { rfq: rfqId, supplier: supplierId }
                })
                  .then(quoteResponse => {
                    if (quoteResponse.success && quoteResponse.result && quoteResponse.result.length > 0) {
                      const quoteItems = quoteResponse.result[0].items || [];
                      
                      // Merge quote items with RFQ items - only items from PR
                      const rfqItems = rfqResult.items || [];
                      const mergedItems = rfqItems.map(rfqItem => {
                        const quoteItem = quoteItems.find(qi => 
                          (qi.itemId === (rfqItem._id || rfqItem.id)) || 
                          (qi.itemName === rfqItem.name)
                        );
                        
                        return {
                          key: rfqItem._id || rfqItem.id,
                          itemId: rfqItem._id || rfqItem.id,
                          purchaseRequisitionItemId: rfqItem.purchaseRequisitionItemId,
                          name: rfqItem.name,
                          description: rfqItem.description,
                          quantity: rfqItem.quantity,
                          price: quoteItem?.price || 0,
                          unit: rfqItem.unit
                        };
                      });
                      
                      setItems(mergedItems);
                      
                      // Set form values with additional fields
                      form.setFieldsValue({
                        supplier: supplierId,
                        rfq: rfqId,
                        date: moment(),
                        expectedDeliveryDate: moment().add(14, 'days'),
                        incoterms: 'DDP', // Default incoterm
                        paymentTerms: '30 days after delivery', // Default payment term
                        items: mergedItems
                      });
                    }
                  })
                  .catch(err => {
                    console.error('Failed to load supplier quotes:', err);
                  });
              }
            }
          }
        })
        .catch(err => {
          console.error('Failed to load RFQ data:', err);
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
            
            // Pre-fill items from contract
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
            
            // Set form values with contract data
            form.setFieldsValue({
              supplier: contractResult.supplierId,
              contract: contractId,
              date: moment(),
              expectedDeliveryDate: moment().add(14, 'days'),
              incoterms: contractResult.incoterms || 'DDP',
              paymentTerms: contractResult.paymentTerms || '30 days after delivery',
              items: formattedItems
            });
          }
        })
        .catch(err => {
          console.error('Failed to load Contract data:', err);
          message.error('Failed to load Contract data');
        })
        .finally(() => {
          setRfqLoading(false);
        });
    }
  }, [rfqId, contractId, supplierId]);

  // Handle PR selection - Use already fetched data instead of making another API call
  const handlePRSelect = (selectedPRId) => {
    if (!selectedPRId) return;
    
    // Find the selected PR from the already fetched data
    const selectedPR = allPRs.find(pr => (pr._id || pr.id) === selectedPRId);
    
    if (!selectedPR) {
      message.error('Selected Purchase Requisition not found');
      return;
    }
    
    setSelectedPR(selectedPR);
    setContractData(null);
    setRfqData(null);
    
    // Filter RFQs to show only those related to this PR
    const relatedRfqs = allRfqs.filter(rfq => 
      rfq.purchaseRequisitionId === selectedPRId && rfq.status === 'in_progress'
    );
    setAvailableRfqs(relatedRfqs);
    
    // If there's only one RFQ, auto-select it
    if (relatedRfqs.length === 1) {
      setRfqData(relatedRfqs[0]);
      form.setFieldsValue({ rfq: relatedRfqs[0]._id || relatedRfqs[0].id });
    } else {
      setRfqData(null);
      form.setFieldsValue({ rfq: null });
    }
    
    // Pre-fill items from PR
    const prItems = selectedPR.items || [];
    const formattedItems = prItems.map(item => ({
      key: item.id || item._id,
      itemId: item.id || item._id,
      name: item.name || item.itemName,
      description: item.description || item.itemDescription,
      quantity: item.quantity,
      price: item.estimatedPrice || 0,
      unit: item.unit || 'each'
    }));
    
    setItems(formattedItems);
    form.setFieldsValue({
      items: formattedItems,
      contract: null,
      purchaseRequisition: selectedPRId
    });
  };
  
  // Handle RFQ selection with locking PR and Contract
  const handleRfqSelect = (selectedRfqId) => {
    if (!selectedRfqId) return;
    
    const selectedRfq = availableRfqs.find(rfq => (rfq._id || rfq.id) === selectedRfqId);
    if (selectedRfq) {
      setRfqData(selectedRfq);
      setContractData(null);
      setSelectedPR(null);
      
      // Pre-fill items from RFQ (only items from PR)
      const rfqItems = selectedRfq.items || [];
      const formattedItems = rfqItems.map(item => ({
        key: item._id || item.id,
        itemId: item._id || item.id,
        purchaseRequisitionItemId: item.purchaseRequisitionItemId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: 0, // Will be filled from supplier quotes
        unit: item.unit
      }));
      
      setItems(formattedItems);
      form.setFieldsValue({
        items: formattedItems,
        contract: null,
        rfq: selectedRfqId,
        purchaseRequisition: null
      });
    }
  };
  
  // Handle contract selection with locking RFQ and auto-fill supplier
  const handleContractSelect = (selectedContractId) => {
    if (!selectedContractId) return;
    
    const selectedContract = availableContracts.find(contract => (contract._id || contract.id) === selectedContractId);
    if (selectedContract) {
      setContractData(selectedContract);
      setRfqData(null);
      setSelectedPR(null);
      
      // Reset RFQ dropdown to show all in-progress RFQs
      const inProgressRfqs = allRfqs.filter(rfq => rfq.status === 'in_progress');
      setAvailableRfqs(inProgressRfqs);
      
      // Pre-fill items from contract
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
      
      // Auto-fill supplier if contract has supplierId
      const supplierValue = selectedContract.supplierId || selectedContract.supplier;
      
      form.setFieldsValue({
        items: formattedItems,
        rfq: null,
        contract: selectedContractId,
        purchaseRequisition: null,
        supplier: supplierValue // Auto-fill supplier from contract
      });
    }
  };

  // Reset all selections
  const handleReset = () => {
    form.resetFields();
    setRfqData(null);
    setContractData(null);
    setSelectedPR(null);
    setItems([]);
    
    // Reset RFQ dropdown to show all in-progress RFQs
    const inProgressRfqs = allRfqs.filter(rfq => rfq.status === 'in_progress');
    setAvailableRfqs(inProgressRfqs);
    
    // Reset PR dropdown to show all approved PRs
    const approvedPRs = allPRs.filter(pr => pr.status === 'approved');
    setAvailablePRs(approvedPRs);
    
    message.success('Form has been reset');
  };

  // Add item row (only for non-RFQ, non-contract, and non-PR orders)
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
  
  // Remove item row (only for non-RFQ, non-contract, and non-PR orders)
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
  
  // Calculate item total
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
  };
  
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
        label={translate('Purchase Requisition')}
        rules={[{ 
          required: !rfqId && !contractId && !rfqData && !contractData, 
          message: translate('Please select a Purchase Requisition, RFQ, or Contract') 
        }]}
      >
        <Select
          placeholder={translate('Select Purchase Requisition')}
          loading={loading}
          disabled={!!rfqId || !!contractId || !!rfqData || !!contractData}
          onChange={handlePRSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {availablePRs.map(pr => (
            <Option key={pr._id || pr.id} value={pr._id || pr.id}>
              {pr.prNumber} - {pr.description}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item 
        name="rfq" 
        label={translate('RFQ Reference')}
        rules={[{ 
          required: !contractId && !selectedPR && !contractData, 
          message: translate('Please select an RFQ, Contract, or Purchase Requisition') 
        }]}
      >
        <Select 
          placeholder={translate('Select RFQ (In Progress only)')}
          loading={loading}
          disabled={!!rfqId || !!contractId || !!contractData || !!selectedPR}
          onChange={handleRfqSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {availableRfqs.map(rfq => (
            <Option key={rfq._id || rfq.id} value={rfq._id || rfq.id}>
              {rfq.rfqNumber} - {rfq.description}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item 
        name="contract" 
        label={translate('Contract Reference')}
        rules={[{ 
          required: !rfqId && !selectedPR && !rfqData, 
          message: translate('Please select a Contract, RFQ, or Purchase Requisition') 
        }]}
      >
        <Select 
          placeholder={translate('Select Contract')}
          loading={loading}
          disabled={!!contractId || !!rfqId || !!rfqData || !!selectedPR}
          onChange={handleContractSelect}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
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

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            <Table
              columns={itemColumns}
              dataSource={fields.map(field => ({
                ...field,
                key: field.key,
                fieldKey: field.fieldKey
              }))}
              pagination={false}
              bordered
              footer={() => (
                <Button
                  type="dashed"
                  onClick={addItem}
                  block
                  icon={<PlusOutlined />}
                  disabled={!!rfqData || !!contractData || !!selectedPR} // Disable if RFQ, Contract, or PR is selected
                >
                  {translate('Add Item')}
                </Button>
              )}
            />
          </>
        )}
      </Form.List>

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
