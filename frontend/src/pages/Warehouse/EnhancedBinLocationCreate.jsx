import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  message, 
  Divider,
  Space,
  Select,
  InputNumber
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, InboxOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export default function BinLocationCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [binCode, setBinCode] = useState('');
  const [storageLocations, setStorageLocations] = useState([]);

  // Load storage locations
  useEffect(() => {
    loadStorageLocations();
  }, []);

  const loadStorageLocations = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await warehouseService.getStorageLocations();
      
      // Mock data for demonstration
      const mockLocations = [
        { id: '1', code: 'BRG01', description: 'Brighton Warehouse 1' },
        { id: '2', code: 'BRG02', description: 'Brighton Warehouse 2' },
        { id: '3', code: 'LON01', description: 'London Warehouse 1' },
        { id: '4', code: 'MAN01', description: 'Manchester Warehouse 1' }
      ];
      
      setStorageLocations(mockLocations);
    } catch (error) {
      console.error('Error loading storage locations:', error);
      message.error('Failed to load storage locations');
    }
  };

  // Generate bin code from components (e.g., W1010105 = Warehouse 1, row 1, shelf 1, bin 5)
  const generateBinCode = (values) => {
    const { 
      warehouseNumber = '', 
      rowNumber = '', 
      shelfNumber = '', 
      binNumber = '' 
    } = values;
    
    if (!warehouseNumber || !rowNumber || !shelfNumber || !binNumber) return '';
    
    return `W${warehouseNumber.toString().padStart(1, '0')}${rowNumber.toString().padStart(2, '0')}${shelfNumber.toString().padStart(2, '0')}${binNumber.toString().padStart(2, '0')}`;
  };

  // Update bin code when components change
  const handleCodeComponentChange = () => {
    setTimeout(() => {
      const values = form.getFieldsValue(['warehouseNumber', 'rowNumber', 'shelfNumber', 'binNumber']);
      const code = generateBinCode(values);
      setBinCode(code);
      form.setFieldValue('code', code);
    }, 100);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Generate final bin code
      const finalCode = generateBinCode(values);
      const selectedLocation = storageLocations.find(loc => loc.id === values.storageLocationId);
      
      const finalValues = {
        ...values,
        code: finalCode,
        locationCode: selectedLocation?.code,
        locationDescription: selectedLocation?.description
      };
      
      console.log('Creating bin location with values:', finalValues);
      
      // TODO: Replace with actual API call
      // const response = await warehouseService.createBinLocation(finalValues);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(`Bin location ${finalCode} created successfully in ${selectedLocation?.code}!`);
      navigate('/warehouse/locations');
    } catch (error) {
      console.error('Error creating bin location:', error);
      message.error('Failed to create bin location');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/warehouse/locations');
  };

  return (
    <ErpLayout>
      <div style={{ padding: '20px' }}>
        <Card
          title={
            <Space>
              <InboxOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {translate('Create Bin Location')}
              </Title>
            </Space>
          }
          extra={
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
            >
              {translate('Back to Locations')}
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              warehouseNumber: 1,
              rowNumber: 1,
              shelfNumber: 1,
              binNumber: 1,
              code: '',
              storageLocationId: ''
            }}
          >
            {/* Bin Code Generation Section */}
            <Card size="small" title={translate('Bin Code Generation')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label={translate('Warehouse Number')}
                    name="warehouseNumber"
                    rules={[
                      { required: true, message: translate('Please enter warehouse number') },
                      { type: 'number', min: 1, max: 9, message: translate('Warehouse number must be 1-9') }
                    ]}
                    tooltip={translate('Single digit warehouse number (1-9)')}
                  >
                    <InputNumber 
                      min={1}
                      max={9}
                      style={{ width: '100%' }}
                      onChange={handleCodeComponentChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={translate('Row Number')}
                    name="rowNumber"
                    rules={[
                      { required: true, message: translate('Please enter row number') },
                      { type: 'number', min: 1, max: 99, message: translate('Row number must be 1-99') }
                    ]}
                    tooltip={translate('2-digit row number (01-99)')}
                  >
                    <InputNumber 
                      min={1}
                      max={99}
                      style={{ width: '100%' }}
                      onChange={handleCodeComponentChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={translate('Shelf Number')}
                    name="shelfNumber"
                    rules={[
                      { required: true, message: translate('Please enter shelf number') },
                      { type: 'number', min: 1, max: 99, message: translate('Shelf number must be 1-99') }
                    ]}
                    tooltip={translate('2-digit shelf number (01-99)')}
                  >
                    <InputNumber 
                      min={1}
                      max={99}
                      style={{ width: '100%' }}
                      onChange={handleCodeComponentChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={translate('Bin Number')}
                    name="binNumber"
                    rules={[
                      { required: true, message: translate('Please enter bin number') },
                      { type: 'number', min: 1, max: 99, message: translate('Bin number must be 1-99') }
                    ]}
                    tooltip={translate('2-digit bin number (01-99)')}
                  >
                    <InputNumber 
                      min={1}
                      max={99}
                      style={{ width: '100%' }}
                      onChange={handleCodeComponentChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={translate('Generated Bin Code')}
                    name="code"
                  >
                    <Input 
                      value={binCode}
                      placeholder="W1010105"
                      disabled
                      style={{ 
                        backgroundColor: '#f0f0f0',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Text type="secondary">
                {translate('Example: Warehouse 1, Row 01, Shelf 01, Bin 05 = "W1010105"')}
              </Text>
            </Card>

            <Divider />

            {/* Storage Location Assignment */}
            <Card size="small" title={translate('Storage Location Assignment')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={translate('Storage Location')}
                    name="storageLocationId"
                    rules={[
                      { required: true, message: translate('Please select storage location') }
                    ]}
                    tooltip={translate('Select the warehouse/storage location where this bin will be located')}
                  >
                    <Select
                      placeholder={translate('Select storage location (e.g., BRG01)')}
                      size="large"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {storageLocations.map(location => (
                        <Option key={location.id} value={location.id}>
                          <Space>
                            <Text strong>{location.code}</Text>
                            <Text type="secondary">- {location.description}</Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Optional Details */}
            <Card size="small" title={translate('Additional Information (Optional)')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={translate('Capacity (m³)')}
                    name="capacity"
                    tooltip={translate('Storage capacity in cubic meters')}
                  >
                    <InputNumber 
                      min={0}
                      step={0.1}
                      precision={2}
                      style={{ width: '100%' }}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={translate('Weight Limit (kg)')}
                    name="weightLimit"
                    tooltip={translate('Maximum weight capacity in kilograms')}
                  >
                    <InputNumber 
                      min={0}
                      step={1}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={translate('Description')}
                    name="description"
                    tooltip={translate('Optional description for this bin location')}
                  >
                    <Input.TextArea 
                      rows={2}
                      placeholder={translate('Enter optional description...')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <Row justify="end" style={{ marginTop: 24 }}>
              <Space size="middle">
                <Button size="large" onClick={onCancel}>
                  {translate('Cancel')}
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {translate('Create Bin Location')}
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      </div>
    </ErpLayout>
  );
}
