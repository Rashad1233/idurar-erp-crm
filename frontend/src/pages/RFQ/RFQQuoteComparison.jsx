import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Button, 
  Spin, 
  Alert, 
  Typography, 
  Tag,
  Radio,
  Space,
  Tooltip,
  Divider,
  Empty,
  Result,
  Modal,
  message
} from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  LeftOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { Title, Text } = Typography;

function RFQQuoteComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  
  const [rfq, setRFQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectionLoading, setSelectionLoading] = useState(false);
  
  // Load RFQ data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request.read({ entity: 'rfq', id })
      .then(response => {
        console.log('🔍 RFQ Read Response:', response);
        const rfqData = response.result || response.data;
        console.log('🔍 RFQ Data:', rfqData);
        setRFQ(rfqData);
        
        // Extract suppliers and items
        if (rfqData.suppliers) {
          setSuppliers(rfqData.suppliers);
        }
        
        if (rfqData.items) {
          setItems(rfqData.items);
        }
        
        // Load supplier quotes
        return request.list({ 
          entity: 'supplier-quote',
          options: {
            filter: { rfqId: id }
          }
        });
      })
      .then(response => {
        setQuotes(response.result || []);
      })
      .catch(err => {
        setError(err.message || 'Error loading RFQ data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  
  // Generate comparison table columns
  const generateColumns = () => {
    if (!quotes || quotes.length === 0) {
      return [
        {
          title: translate('Item'),
          dataIndex: 'itemName',
          key: 'itemName',
          fixed: 'left',
        },
        {
          title: translate('Quantity'),
          dataIndex: 'quantity',
          key: 'quantity',
        },
        {
          title: translate('UOM'),
          dataIndex: 'uom',
          key: 'uom',
        }
      ];
    }
    
    const columns = [
      {
        title: translate('Item'),
        dataIndex: 'itemName',
        key: 'itemName',
        fixed: 'left',
        render: (text, record) => (
          <div>
            <div><strong>{text}</strong></div>
            <div>{record.description}</div>
            <div>
              <Text type="secondary">
                {translate('Qty')}: {record.quantity} {record.uom}
              </Text>
            </div>
          </div>
        )
      }
    ];
    
    // Add a column for each supplier
    quotes.forEach(quote => {
      const supplier = suppliers.find(s => s.supplierId === quote.supplierId);
      
      columns.push({
        title: (
          <div>
            <div>{quote.supplierName}</div>
            <Tag color="blue">{quote.currency}</Tag>
          </div>
        ),
        dataIndex: quote.supplierId,
        key: quote.supplierId,
        render: (_, record) => {
          const quoteItem = quote.items?.find(item => item.rfqItemId === record._id);
          
          if (!quoteItem) return '-';
          
          const bestPrice = quotes.some(q => {
            const item = q.items?.find(i => i.rfqItemId === record._id);
            return item && item.price < quoteItem.price;
          });
          
          return (
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>
                  {quoteItem.price.toFixed(2)}
                  {bestPrice ? '' : (
                    <Tooltip title={translate('Lowest price for this item')}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                    </Tooltip>
                  )}
                </Text>
              </div>
              {quoteItem.leadTime && (
                <div>
                  <Text type="secondary">{translate('Lead Time')}: {quoteItem.leadTime}</Text>
                </div>
              )}
              {quoteItem.alternativeItem && (
                <Tag color="orange">{translate('Alternative')}</Tag>
              )}
            </div>
          );
        },
      });
    });
    
    return columns;
  };
  
  // Generate supplier summary cards
  const renderSupplierSummaries = () => {
    if (!quotes || quotes.length === 0) return null;
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <Radio.Group 
          onChange={e => {
            setSelectedSupplier(e.target.value);
            setSelectedQuote(quotes.find(q => q.supplierId === e.target.value));
          }} 
          value={selectedSupplier}
        >
          <Space direction="horizontal" wrap>
            {quotes.map(quote => {
              const totalValue = quote.totalValue || 
                quote.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
              
              // Calculate how many items have lowest price from this supplier
              let lowestPriceItemsCount = 0;
              items.forEach(item => {
                const quoteItem = quote.items?.find(qi => qi.rfqItemId === item._id);
                if (!quoteItem) return;
                
                const isLowestPrice = !quotes.some(q => {
                  const otherItem = q.items?.find(i => i.rfqItemId === item._id);
                  return otherItem && otherItem.price < quoteItem.price;
                });
                
                if (isLowestPrice) lowestPriceItemsCount++;
              });
              
              return (
                <Radio.Button key={quote.supplierId} value={quote.supplierId}>
                  <Card 
                    style={{ 
                      width: 280,
                      borderColor: selectedSupplier === quote.supplierId ? '#1890ff' : undefined
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <ShopOutlined style={{ fontSize: 24 }} />
                      <div style={{ margin: '8px 0' }}>
                        <Text strong>{quote.supplierName}</Text>
                      </div>
                      <div>
                        <Title level={3}>
                          <DollarOutlined /> {quote.currency} {totalValue.toFixed(2)}
                        </Title>
                      </div>
                      <div>
                        <Tag color="green">
                          {lowestPriceItemsCount} {translate('items with lowest price')}
                        </Tag>
                      </div>
                      {quote.paymentTerms && (
                        <div><Text>{translate('Payment Terms')}: {quote.paymentTerms}</Text></div>
                      )}
                      {quote.deliveryTerms && (
                        <div><Text>{translate('Delivery Terms')}: {quote.deliveryTerms}</Text></div>
                      )}
                    </div>
                  </Card>
                </Radio.Button>
              );
            })}
          </Space>
        </Radio.Group>
      </div>
    );
  };
  
  // Handle selecting supplier and proceeding to PO creation
  const handleSelectSupplier = () => {
    if (!selectedSupplier || !selectedQuote) {
      message.error(translate('Please select a supplier'));
      return;
    }
    
    setConfirmModalVisible(true);
  };
  
  // Handle confirm supplier selection
  const handleConfirmSelection = () => {
    setSelectionLoading(true);
    
    request.post({
      entity: `rfq/select/${id}`,
      jsonData: { supplierQuoteId: selectedQuote._id }
    })
      .then(() => {
        message.success(translate('Supplier selected successfully'));
        setConfirmModalVisible(false);
        
        // Navigate to PO creation page
        navigate(`/purchase-order/create?rfqId=${id}&supplierQuoteId=${selectedQuote._id}`);
      })
      .catch(err => {
        setError(err.message || 'Error selecting supplier');
      })
      .finally(() => {
        setSelectionLoading(false);
      });
  };
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }
  
  if (error) {
    return <Alert message={translate('Error')} description={error} type="error" showIcon />;
  }
  
  if (!rfq) {
    return <Alert message={translate('Not Found')} description={translate('RFQ not found')} type="error" showIcon />;
  }
  
  // If no quotes are available
  if (!quotes || quotes.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <Button 
              icon={<LeftOutlined />} 
              onClick={() => navigate('/rfq')}
              style={{ marginRight: 8 }}
            >
              {translate('Back')}
            </Button>
            <h1>{translate('Quote Comparison')}: {rfq.number}</h1>
          </div>
        </div>
        
        <Result
          status="warning"
          title={translate('No quotations available')}
          subTitle={translate('There are no supplier quotations available for this RFQ')}
          extra={
            <Button type="primary" onClick={() => navigate(`/rfq/read/${id}`)}>
              {translate('View RFQ Details')}
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/rfq')}
            style={{ marginRight: 8 }}
          >
            {translate('Back')}
          </Button>
          <h1>{translate('Quote Comparison')}: {rfq.number}</h1>
        </div>
        <div className="page-action">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleSelectSupplier}
            disabled={!selectedSupplier}
          >
            {translate('Create PO with Selected Supplier')}
          </Button>
        </div>
      </div>
      
      <Card title={translate('Supplier Comparison')} style={{ marginBottom: 16 }}>
        {renderSupplierSummaries()}
      </Card>
      
      <Card title={translate('Price Comparison')}>
        <Table
          dataSource={items}
          columns={generateColumns()}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      <Modal
        title={translate('Confirm Supplier Selection')}
        open={confirmModalVisible}
        onOk={handleConfirmSelection}
        onCancel={() => setConfirmModalVisible(false)}
        confirmLoading={selectionLoading}
      >
        <p>
          {translate('You are about to select')}{' '}
          <strong>{selectedQuote?.supplierName}</strong>{' '}
          {translate('as the supplier for this RFQ. This will mark the RFQ as closed and allow you to create a purchase order.')}
        </p>
        <p>{translate('Are you sure you want to proceed?')}</p>
      </Modal>
    </div>
  );
}

export default RFQQuoteComparison;
