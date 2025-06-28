import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Input, Select, Table, InputNumber, Divider, Typography, Space, Modal, Form, message, Tag, AutoComplete } from 'antd';
import { ShoppingCartOutlined, ScanOutlined, UserOutlined, ClearOutlined, PrinterOutlined, CreditCardOutlined, MoneyCollectOutlined, CameraOutlined } from '@ant-design/icons';
import request from '@/request';
import BarcodeScanner from '@/components/BarcodeScanner';

const { Title, Text } = Typography;
const { Option } = Select;

const POSModule = () => {
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  
  // State management
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [vatRate, setVatRate] = useState(18);
  const [vatAmount, setVatAmount] = useState(0);
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [seasonalDiscount, setSeasonalDiscount] = useState(0);
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadItems();
    loadCustomers();
  }, []);

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals();
  }, [cartItems, vatRate, discountType, discountValue, seasonalDiscount, specialDiscount]);

  // Auto-focus barcode input in scan mode
  useEffect(() => {
    if (scanMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [scanMode]);

  const loadItems = async () => {
    try {
      const response = await request.get('/sales-order/items');
      if (response.data.success) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      message.error('Failed to load items');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await request.get('/sales-order/customers');
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Failed to load customers');
    }
  };

  const handleBarcodeScan = async (barcode) => {
    if (!barcode.trim()) return;

    try {
      setLoading(true);
      // Use the new item barcode endpoint
      const response = await request.get({ 
        entity: `item/barcode/${barcode.trim()}`
      });
      
      if (response.success && response.result) {
        const scannedItem = response.result;
        addItemToCart(scannedItem);
        setBarcodeInput('');
        setScannerVisible(false);
        message.success(`Scanned: ${scannedItem.name}`);
      } else {
        message.error('Item not found');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      message.error('Barcode scan failed');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = (item, quantity = 1, unitPrice = 0) => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += quantity;
      updatedCartItems[existingItemIndex].lineTotal = 
        updatedCartItems[existingItemIndex].quantity * updatedCartItems[existingItemIndex].unitPrice;
      setCartItems(updatedCartItems);
    } else {
      // Add new item to cart
      const cartItem = {
        id: item.id,
        itemMasterId: item.id,
        itemNumber: item.itemNumber,
        itemDescription: item.shortDescription,
        quantity: quantity,
        uom: item.uom,
        unitPrice: unitPrice || 10, // Default price for demo
        discount: 0,
        discountPercent: 0,
        lineTotal: quantity * (unitPrice || 10),
        category: item.equipmentCategory,
        brand: item.manufacturerName,
        barcode: item.barcode || item.itemNumber
      };
      setCartItems([...cartItems, cartItem]);
    }
  };

  const updateCartItem = (index, field, value) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index][field] = value;
    
    // Recalculate line total
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
      const baseTotal = updatedCartItems[index].quantity * updatedCartItems[index].unitPrice;
      const discountAmount = (baseTotal * updatedCartItems[index].discountPercent) / 100;
      updatedCartItems[index].lineTotal = baseTotal - discountAmount;
    }
    
    setCartItems(updatedCartItems);
  };

  const removeCartItem = (index) => {
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);
  };

  const calculateTotals = () => {
    const newSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    setSubtotal(newSubtotal);

    const newVatAmount = (newSubtotal * vatRate) / 100;
    setVatAmount(newVatAmount);

    let totalDiscountAmount = 0;
    if (discountType === 'percentage') {
      totalDiscountAmount = (newSubtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      totalDiscountAmount = discountValue;
    }

    // Add seasonal and special discounts
    if (seasonalDiscount > 0) {
      totalDiscountAmount += (newSubtotal * seasonalDiscount) / 100;
    }
    if (specialDiscount > 0) {
      totalDiscountAmount += (newSubtotal * specialDiscount) / 100;
    }

    setDiscountAmount(totalDiscountAmount);
    setTotalAmount(newSubtotal + newVatAmount - totalDiscountAmount);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setBarcodeInput('');
    setSearchValue('');
    setDiscountType('none');
    setDiscountValue(0);
    setSeasonalDiscount(0);
    setSpecialDiscount(0);
  };

  const handlePayment = () => {
    if (cartItems.length === 0) {
      message.error('Cart is empty');
      return;
    }
    setPaymentVisible(true);
  };

  const processSale = async (paymentData) => {
    try {
      setLoading(true);
      
      const saleData = {
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        items: cartItems,
        paymentMethod: paymentData.paymentMethod,
        vatRate,
        discountType,
        discountValue,
        seasonalDiscount,
        specialDiscount,
        notes: paymentData.notes,
        storeLocation: 'Main Store',
        barcodeScanned: cartItems.map(item => item.barcode).filter(Boolean)
      };

      const response = await request.post('/sales-order', saleData);
      
      if (response.data.success) {
        message.success('Sale completed successfully!');
        
        // Update payment status
        await request.post(`/sales-order/${response.data.result.id}/payment`, {
          paymentMethod: paymentData.paymentMethod,
          amountPaid: totalAmount
        });
        
        clearCart();
        setPaymentVisible(false);
        
        // Optional: Print receipt
        if (paymentData.printReceipt) {
          printReceipt(response.data.result);
        }
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      message.error('Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (salesOrder) => {
    // Simple receipt printing simulation
    const receiptContent = `
      RECEIPT #${salesOrder.receiptNumber}
      ${new Date().toLocaleString()}
      
      Customer: ${salesOrder.customerName}
      Salesperson: Current User
      
      Items:
      ${cartItems.map(item => 
        `${item.itemDescription} x${item.quantity} @ $${item.unitPrice} = $${item.lineTotal}`
      ).join('\n')}
      
      Subtotal: $${subtotal.toFixed(2)}
      VAT (${vatRate}%): $${vatAmount.toFixed(2)}
      Discount: -$${discountAmount.toFixed(2)}
      Total: $${totalAmount.toFixed(2)}
      
      Thank you for your purchase!
    `;
    
    console.log('Receipt:', receiptContent);
    message.info('Receipt sent to printer (simulated)');
  };

  // Cart columns for table
  const cartColumns = [
    {
      title: 'Item',
      dataIndex: 'itemDescription',
      key: 'item',
      width: '25%',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (value, record, index) => (
        <InputNumber
          min={1}
          max={999}
          value={value}
          onChange={(val) => updateCartItem(index, 'quantity', val)}
          size="small"
        />
      ),
    },
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      render: (value, record, index) => (
        <InputNumber
          min={0}
          step={0.01}
          value={value}
          onChange={(val) => updateCartItem(index, 'unitPrice', val)}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          size="small"
        />
      ),
    },
    {
      title: 'Disc %',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: '10%',
      render: (value, record, index) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => updateCartItem(index, 'discountPercent', val)}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          size="small"
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: '15%',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record, index) => (
        <Button
          type="link"
          danger
          onClick={() => removeCartItem(index)}
          size="small"
        >
          Remove
        </Button>
      ),
    },
  ];

  // Item search options
  const itemOptions = items.map(item => ({
    value: item.id,
    label: `${item.itemNumber} - ${item.shortDescription}`,
    item: item
  }));

  return (
    <div style={{ padding: '20px', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Row gutter={[16, 16]} style={{ height: '100%' }}>
        {/* Left Panel - Item Selection */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Point of Sale</span>
                <Tag color={scanMode ? 'green' : 'default'}>
                  {scanMode ? 'Scan Mode ON' : 'Scan Mode OFF'}
                </Tag>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Customer Selection */}
              <div>
                <Text strong>Customer (Optional):</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select customer or leave empty for walk-in"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={selectedCustomer?.id}
                  onChange={(value) => {
                    const customer = customers.find(c => c.id === value);
                    setSelectedCustomer(customer);
                  }}
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.customerNumber})
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Barcode Scanner Section */}
              <div>
                <Space style={{ width: '100%', marginBottom: 8 }}>
                  <Text strong>Barcode Scanner:</Text>
                  <Button
                    icon={<ScanOutlined />}
                    type={scanMode ? 'primary' : 'default'}
                    onClick={() => setScanMode(!scanMode)}
                    size="small"
                  >
                    {scanMode ? 'Stop Scan' : 'Start Scan'}
                  </Button>
                  <Button
                    icon={<CameraOutlined />}
                    onClick={() => setScannerVisible(true)}
                    size="small"
                    type="dashed"
                  >
                    Camera Scanner
                  </Button>
                </Space>
                
                <Input
                  ref={barcodeInputRef}
                  placeholder={scanMode ? "Scan barcode or type item number..." : "Type item number..."}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onPressEnter={() => handleBarcodeScan(barcodeInput)}
                  suffix={
                    <Button 
                      icon={<ScanOutlined />} 
                      type="link" 
                      onClick={() => handleBarcodeScan(barcodeInput)}
                      loading={loading}
                    />
                  }
                  size="large"
                  style={{ 
                    borderColor: scanMode ? '#1890ff' : undefined,
                    boxShadow: scanMode ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined
                  }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {scanMode ? 'Scan mode active - input will auto-focus' : 'Enter item number or barcode and press Enter'}
                </Text>
              </div>

              {/* Item Search */}
              <div>
                <Text strong>Search Items:</Text>
                <AutoComplete
                  ref={searchInputRef}
                  style={{ width: '100%', marginTop: 8 }}
                  options={itemOptions}
                  placeholder="Search by item number or description"
                  value={searchValue}
                  onChange={setSearchValue}
                  onSelect={(value, option) => {
                    addItemToCart(option.item);
                    setSearchValue('');
                  }}
                  filterOption={(inputValue, option) =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  }
                />
              </div>

              {/* Quick Action Items Grid */}
              <div>
                <Text strong>Quick Add Items:</Text>
                <div style={{ marginTop: 8, maxHeight: '200px', overflowY: 'auto' }}>
                  <Row gutter={[8, 8]}>
                    {items.slice(0, 12).map(item => (
                      <Col key={item.id} span={8}>
                        <Button
                          style={{ 
                            width: '100%', 
                            height: '60px', 
                            fontSize: '11px',
                            whiteSpace: 'normal',
                            textAlign: 'center'
                          }}
                          onClick={() => addItemToCart(item)}
                        >
                          {item.itemNumber}
                          <br />
                          <Text style={{ fontSize: '10px' }}>
                            {item.shortDescription?.substring(0, 20)}...
                          </Text>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Panel - Cart & Checkout */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Shopping Cart ({cartItems.length} items)</span>
              </Space>
            }
            extra={
              <Button
                icon={<ClearOutlined />}
                onClick={clearCart}
                disabled={cartItems.length === 0}
              >
                Clear
              </Button>
            }
            style={{ height: '100%' }}
          >
            <div style={{ height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}>
              {/* Cart Items Table */}
              <div style={{ flex: 1, marginBottom: 16 }}>
                <Table
                  columns={cartColumns}
                  dataSource={cartItems}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 'calc(100vh - 500px)' }}
                  size="small"
                  locale={{ emptyText: 'Cart is empty' }}
                />
              </div>

              {/* Discount Controls */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Text strong>Discount:</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={discountType}
                    onChange={setDiscountType}
                    size="small"
                  >
                    <Option value="none">No Discount</Option>
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Text strong>Value:</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    value={discountValue}
                    onChange={setDiscountValue}
                    disabled={discountType === 'none'}
                    min={0}
                    size="small"
                  />
                </Col>
                <Col span={8}>
                  <Text strong>VAT Rate:</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    value={vatRate}
                    onChange={setVatRate}
                    min={0}
                    max={100}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    size="small"
                  />
                </Col>
              </Row>

              {/* Totals Section */}
              <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                <Row justify="space-between">
                  <Col><Text>Subtotal:</Text></Col>
                  <Col><Text strong>${subtotal.toFixed(2)}</Text></Col>
                </Row>
                <Row justify="space-between">
                  <Col><Text>VAT ({vatRate}%):</Text></Col>
                  <Col><Text strong>${vatAmount.toFixed(2)}</Text></Col>
                </Row>
                <Row justify="space-between">
                  <Col><Text>Discount:</Text></Col>
                  <Col><Text strong>-${discountAmount.toFixed(2)}</Text></Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between">
                  <Col><Title level={4} style={{ margin: 0 }}>Total:</Title></Col>
                  <Col><Title level={4} style={{ margin: 0, color: '#1890ff' }}>${totalAmount.toFixed(2)}</Title></Col>
                </Row>
              </Card>

              {/* Payment Button */}
              <Button
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                onClick={handlePayment}
                disabled={cartItems.length === 0}
                style={{ marginTop: 16, height: '50px', fontSize: '16px' }}
                block
              >
                Process Payment
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal
        title="Process Payment"
        open={paymentVisible}
        onCancel={() => setPaymentVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={processSale}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={3} style={{ color: '#1890ff' }}>
              ${totalAmount.toFixed(2)}
            </Title>
          </div>

          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select placeholder="Select payment method">
              <Option value="cash">
                <Space><MoneyCollectOutlined />Cash</Space>
              </Option>
              <Option value="card">
                <Space><CreditCardOutlined />Card</Space>
              </Option>
              <Option value="mobile">Mobile Payment</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea placeholder="Payment notes..." rows={2} />
          </Form.Item>

          <Form.Item name="printReceipt" valuePropName="checked">
            <Button type="dashed" icon={<PrinterOutlined />}>
              Print Receipt
            </Button>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%' }}>
              <Button onClick={() => setPaymentVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
                Complete Sale
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
      />
    </div>
  );
};

export default POSModule;