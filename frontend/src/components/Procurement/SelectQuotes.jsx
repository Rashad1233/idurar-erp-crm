import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  message, 
  Spin, 
  Descriptions, 
  Tag, 
  Space, 
  Radio, 
  Divider,
  Row,
  Col,
  Typography,
  Tooltip
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  TrophyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import procurementService from '@/services/procurementService';

const { Text, Title } = Typography;

export default function SelectQuotes() {
  const { id } = useParams();
  const history = useHistory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [selectedQuotes, setSelectedQuotes] = useState({});
  const [quotesByItem, setQuotesByItem] = useState({});
  
  // Fetch RFQ data
  const fetchRFQ = async () => {
    setIsLoading(true);
    try {
      const result = await procurementService.getRFQ(id);
      if (result.success && result.data) {
        setRfqData(result.data);
        
        // Organize quotes by item
        const itemQuotes = {};
        const initialSelections = {};
        
        // Check if RFQ is in the right status
        if (result.data.status !== 'in_progress') {
          message.warning(`This RFQ is in ${result.data.status} status and may not be eligible for quote selection`);
        }
        
        // Process each item and its quotes
        result.data.items.forEach(item => {
          if (item.quotes && item.quotes.length > 0) {
            itemQuotes[item.id] = item.quotes.map(quote => {
              const supplier = result.data.suppliers.find(s => s.id === quote.rfqSupplierId);
              
              // If a quote is already selected, pre-select it
              if (quote.isSelected) {
                initialSelections[item.id] = quote.id;
              }
              
              return {
                ...quote,
                supplierName: supplier?.supplierName || 'Unknown Supplier',
                totalPrice: quote.unitPrice * item.quantity,
                itemDescription: item.description,
                itemQuantity: item.quantity,
                itemUom: item.uom
              };
            });
          } else {
            itemQuotes[item.id] = [];
          }
        });
        
        setQuotesByItem(itemQuotes);
        setSelectedQuotes(initialSelections);
        
        // Check if all items have quotes
        const itemsWithoutQuotes = result.data.items.filter(
          item => !item.quotes || item.quotes.length === 0
        );
        
        if (itemsWithoutQuotes.length > 0) {
          message.warning(`${itemsWithoutQuotes.length} items do not have any quotes yet`);
        }
      } else {
        message.error('Failed to fetch RFQ data');
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      message.error('Error fetching RFQ data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchRFQ();
    }
  }, [id]);
  
  // Handle quote selection
  const handleQuoteSelection = (itemId, quoteId) => {
    setSelectedQuotes({
      ...selectedQuotes,
      [itemId]: quoteId
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Check if all items have a selected quote
    const itemIds = Object.keys(quotesByItem);
    const missingSelections = itemIds.filter(itemId => 
      quotesByItem[itemId].length > 0 && !selectedQuotes[itemId]
    );
    
    if (missingSelections.length > 0) {
      message.error(`Please select a quote for all items (${missingSelections.length} items missing)`);
      return;
    }
    
    // Format selected quotes for API
    const formattedSelections = Object.entries(selectedQuotes).map(([itemId, quoteId]) => ({
      quoteId
    }));
    
    setIsLoading(true);
    
    try {
      const result = await procurementService.selectQuotes(id, formattedSelections);
      
      if (result.success) {
        message.success('Quotes selected successfully');
        history.push(`/procurement/rfq/${id}`);
      } else {
        message.error(result.message || 'Failed to select quotes');
      }
    } catch (error) {
      console.error('Error selecting quotes:', error);
      message.error('An error occurred while selecting quotes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render quote comparison table for an item
  const renderQuoteComparisonTable = (itemId) => {
    const quotes = quotesByItem[itemId] || [];
    
    if (quotes.length === 0) {
      return (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Text type="secondary">No quotes available for this item</Text>
        </div>
      );
    }
    
    // Find the item details
    const item = rfqData?.items?.find(i => i.id === parseInt(itemId));
    if (!item) return null;
    
    // Sort quotes by price (lowest first)
    const sortedQuotes = [...quotes].sort((a, b) => a.unitPrice - b.unitPrice);
    
    // Mark best price and delivery
    const bestPrice = sortedQuotes[0].unitPrice;
    const bestDelivery = Math.min(...sortedQuotes.filter(q => q.deliveryTime).map(q => q.deliveryTime));
    
    const columns = [
      {
        title: 'Supplier',
        dataIndex: 'supplierName',
        key: 'supplierName',
        width: '20%'
      },
      {
        title: 'Unit Price',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: '15%',
        render: (text, record) => (
          <span>
            {record.currencyCode} {text.toFixed(2)}
            {record.unitPrice === bestPrice && (
              <Tooltip title="Best Price">
                <TrophyOutlined style={{ color: 'gold', marginLeft: 8 }} />
              </Tooltip>
            )}
          </span>
        ),
        sorter: (a, b) => a.unitPrice - b.unitPrice
      },
      {
        title: 'Total Price',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: '15%',
        render: (text, record) => (
          <span>
            {record.currencyCode} {text.toFixed(2)}
          </span>
        )
      },
      {
        title: 'Delivery Time',
        dataIndex: 'deliveryTime',
        key: 'deliveryTime',
        width: '15%',
        render: (text, record) => (
          <span>
            {text ? `${text} days` : 'Not specified'}
            {text && text === bestDelivery && (
              <Tooltip title="Fastest Delivery">
                <TrophyOutlined style={{ color: 'silver', marginLeft: 8 }} />
              </Tooltip>
            )}
          </span>
        ),
        sorter: (a, b) => {
          if (!a.deliveryTime) return 1;
          if (!b.deliveryTime) return -1;
          return a.deliveryTime - b.deliveryTime;
        }
      },
      {
        title: 'Delivery Date',
        dataIndex: 'deliveryDate',
        key: 'deliveryDate',
        width: '15%',
        render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : 'Not specified'
      },
      {
        title: 'Select',
        key: 'select',
        width: '15%',
        render: (_, record) => (
          <Radio
            checked={selectedQuotes[itemId] === record.id}
            onChange={() => handleQuoteSelection(itemId, record.id)}
          />
        )
      }
    ];
    
    return (
      <div style={{ marginBottom: 32 }}>
        <Title level={5}>
          Item: {item.description} ({item.quantity} {item.uom})
        </Title>
        
        <Table
          dataSource={sortedQuotes}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          rowClassName={(record) => selectedQuotes[itemId] === record.id ? 'ant-table-row-selected' : ''}
        />
      </div>
    );
  };
  
  if (!rfqData) {
    return (
      <Spin spinning={isLoading}>
        <Card title="Select Winning Quotes">
          <p>Loading RFQ data...</p>
        </Card>
      </Spin>
    );
  }
  
  return (
    <Spin spinning={isLoading}>
      <Card 
        title={
          <Space>
            <span>Select Winning Quotes</span>
            <Tag color="blue">{rfqData.rfqNumber}</Tag>
          </Space>
        }
      >
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="RFQ Number">{rfqData.rfqNumber}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={rfqData.status === 'in_progress' ? 'warning' : 'default'}>
              {rfqData.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created By">{rfqData.createdBy?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Response Deadline">
            {dayjs(rfqData.responseDeadline).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{rfqData.description}</Descriptions.Item>
        </Descriptions>
        
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card type="inner" title="Quote Selection Instructions">
              <ul>
                <li>Select one winning quote for each item</li>
                <li>The lowest price quote is marked with a gold trophy</li>
                <li>The fastest delivery time is marked with a silver trophy</li>
                <li>All items must have a selected quote before you can complete the process</li>
                <li>Once quotes are selected, the RFQ will be marked as completed</li>
              </ul>
            </Card>
          </Col>
        </Row>
        
        <Divider orientation="left">Quote Comparison by Item</Divider>
        
        {Object.keys(quotesByItem).map(itemId => renderQuoteComparisonTable(itemId))}
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => history.push(`/procurement/rfq/${id}`)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={handleSubmit}
              disabled={rfqData.status !== 'in_progress'}
            >
              Confirm Selection
            </Button>
          </Space>
        </div>
      </Card>
    </Spin>
  );
}
