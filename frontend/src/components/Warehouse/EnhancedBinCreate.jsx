import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Space, Typography, Select, Alert, Modal, Result } from 'antd';
import { DatabaseOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const EnhancedBinCreate = () => {  const [form] = Form.useForm();  const [loading, setLoading] = useState(false);
  const [generatedBinCode, setGeneratedBinCode] = useState('');
  const [storageLocations, setStorageLocations] = useState([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdBin, setCreatedBin] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  // Load storage locations from API
  useEffect(() => {
    const loadStorageLocations = async () => {
      try {
        const response = await fetch('/api/storage-locations');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStorageLocations(result.data || []);
          }
        }
      } catch (error) {
        console.error('Error loading storage locations:', error);
        // Fallback to mock data if API fails
        setStorageLocations([
          { id: '1', code: 'BRG01', description: 'Brighton Warehouse 1' },
          { id: '2', code: 'LON01', description: 'London Warehouse 1' },
          { id: '3', code: 'MAN01', description: 'Manchester Warehouse 1' }
        ]);
      }
    };
    
    loadStorageLocations();
  }, []);

  // Auto-generate bin code when values change
  const generateBinCode = (warehouseNumber, row, shelf, bin) => {
    if (warehouseNumber && row && shelf && bin) {
      const code = `W${warehouseNumber}${row.toString().padStart(2, '0')}${shelf.toString().padStart(2, '0')}${bin.toString().padStart(2, '0')}`;
      setGeneratedBinCode(code);
      return code;
    }
    return '';
  };

  const handleBinComponentChange = () => {
    const warehouseNumber = form.getFieldValue('warehouseNumber');
    const row = form.getFieldValue('row');
    const shelf = form.getFieldValue('shelf');
    const bin = form.getFieldValue('bin');
    const code = generateBinCode(warehouseNumber, row, shelf, bin);
    form.setFieldValue('binCode', code);
  };
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Creating bin location:', values);
      
      // Prepare the data for bin location creation
      const binLocationData = {
        binCode: generatedBinCode,
        description: values.description || `Bin ${generatedBinCode}`,
        storageLocationId: values.storageLocationId,
        isActive: true
      };
      
      // API call to create bin location
      const response = await fetch('/api/bin-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(binLocationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();      if (result.success) {
        // Store created bin data
        setCreatedBin({
          code: generatedBinCode,
          storageLocationId: values.storageLocationId,
          storageLocationName: storageLocations.find(loc => loc.id === values.storageLocationId)?.name || 'Unknown'
        });
          // Show success modal and reset countdown
        setCountdown(10);
        setSuccessModalVisible(true);
        
        form.resetFields();
        setGeneratedBinCode('');
        
        // Auto-redirect after 10 seconds
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigate('/warehouse', { 
            state: { 
              activeTab: 'bins',
              message: `Bin Location "${generatedBinCode}" was created successfully.`
            } 
          });
        }, 10000);
        
      } else {
        throw new Error(result.message || 'Failed to create bin location');
      }
    } catch (error) {
      console.error('Error creating bin location:', error);
      message.error(`Failed to create bin location: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer effect for success modal
  useEffect(() => {
    let timer;
    if (successModalVisible && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirect when countdown reaches 0
            navigate('/warehouse', { state: { activeTab: 'bins' } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [successModalVisible, countdown, navigate]);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/warehouse')}
            >
              Back to Warehouse
            </Button>
          </Space>
          <Title level={2} style={{ margin: '16px 0' }}>
            <DatabaseOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            Create Bin Location
          </Title>
        </div>

        <Alert
          message="Bin Code Format"
          description="Format: W[Warehouse][Row][Shelf][Bin] - Example: W1010105 means Warehouse 1, Row 01, Shelf 01, Bin 05"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Bin Code Generation */}
          <Card title="Bin Code Generation" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Warehouse Number"
                  name="warehouseNumber"
                  rules={[
                    { required: true, message: 'Please enter warehouse number' },
                    { pattern: /^[1-9]$/, message: 'Warehouse number must be 1-9' }
                  ]}
                >
                  <Input
                    placeholder="1"
                    onChange={handleBinComponentChange}
                    maxLength={1}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Row"
                  name="row"
                  rules={[
                    { required: true, message: 'Please enter row number' },
                    { pattern: /^[0-9]+$/, message: 'Row must be a number' }
                  ]}
                >
                  <Input
                    placeholder="01"
                    onChange={handleBinComponentChange}
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Shelf"
                  name="shelf"
                  rules={[
                    { required: true, message: 'Please enter shelf number' },
                    { pattern: /^[0-9]+$/, message: 'Shelf must be a number' }
                  ]}
                >
                  <Input
                    placeholder="01"
                    onChange={handleBinComponentChange}
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Bin"
                  name="bin"
                  rules={[
                    { required: true, message: 'Please enter bin number' },
                    { pattern: /^[0-9]+$/, message: 'Bin must be a number' }
                  ]}
                >
                  <Input
                    placeholder="05"
                    onChange={handleBinComponentChange}
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Generated Bin Code"
                  name="binCode"
                >
                  <Input
                    value={generatedBinCode}
                    disabled
                    placeholder="W1010105"
                    style={{ 
                      backgroundColor: '#f6ffed', 
                      borderColor: '#b7eb8f',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Text type="secondary">
              Example: W1010105 (Warehouse 1, Row 01, Shelf 01, Bin 05)
            </Text>
          </Card>

          {/* Storage Location Assignment */}
          <Card title="Storage Location Assignment" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Storage Location"
                  name="storageLocationId"
                  rules={[{ required: true, message: 'Please select a storage location' }]}
                >
                  <Select
                    placeholder="Select Storage Location (e.g., BRG01)"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {storageLocations.map(location => (
                      <Option key={location.id} value={location.id}>
                        {location.code} - {location.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Bin Information */}
          <Card title="Bin Information" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Bin Description"
                  name="binDescription"
                >
                  <Input placeholder="High-level storage for small items" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Bin Type"
                  name="binType"
                >
                  <Select placeholder="Select bin type">
                    <Option value="PICKING">Picking Bin</Option>
                    <Option value="STORAGE">Storage Bin</Option>
                    <Option value="QUARANTINE">Quarantine Bin</Option>
                    <Option value="DAMAGED">Damaged Goods Bin</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Maximum Capacity"
                  name="maxCapacity"
                >
                  <Input placeholder="100" suffix="units" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Weight Limit"
                  name="weightLimit"
                >
                  <Input placeholder="500" suffix="kg" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Volume Limit"
                  name="volumeLimit"
                >
                  <Input placeholder="10" suffix="m³" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          <Card title="Additional Information" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Special Instructions"
                  name="specialInstructions"
                >
                  <Input.TextArea 
                    rows={3}
                    placeholder="Special handling instructions for this bin location..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Create Bin Location
              </Button>
              <Button
                onClick={() => form.resetFields()}
                size="large"
              >
                Reset Form
              </Button>
            </Space>
          </Form.Item>        </Form>
      </Card>

      {/* Success Modal */}
      <Modal
        open={successModalVisible}
        footer={null}
        closable={false}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Bin Location Created Successfully!"
          subTitle={
            createdBin ? (
              <div>
                <p><strong>Bin Code:</strong> {createdBin.code}</p>
                <p><strong>Storage Location:</strong> {createdBin.storageLocationName}</p>
                <p style={{ marginTop: 16, color: '#666' }}>
                  Redirecting to warehouse bins section in {countdown} seconds...
                </p>
              </div>
            ) : null
          }
          extra={[
            <Button 
              type="primary" 
              key="go-now"
              onClick={() => {
                setSuccessModalVisible(false);
                navigate('/warehouse', { 
                  state: { 
                    activeTab: 'bins',
                    message: `Bin Location "${createdBin?.code}" was created successfully.`
                  } 
                });
              }}
            >
              Go to Warehouse Now
            </Button>
          ]}
        />
      </Modal>
    </div>
  );
};

export default EnhancedBinCreate;
