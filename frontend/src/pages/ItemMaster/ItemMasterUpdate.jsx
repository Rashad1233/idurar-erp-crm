import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, Input, Select, Switch, Button, Card, Spin, 
  message, Space, Divider, Typography, Row, Col 
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { ErpLayout } from '@/layout';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ItemMasterUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/item/${id}`);
        
        if (response.data && response.data.success) {
          const itemData = response.data.result;
          setItem(itemData);
          
          // Transform Y/N values to boolean for form switches
          const formData = {
            ...itemData,
            stockItem: itemData.stockItem === 'Y',
            plannedStock: itemData.plannedStock === 'Y'
          };
          
          form.setFieldsValue(formData);
        } else {
          setError(response.data?.message || 'Failed to fetch item details');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching the item');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      
      // Transform boolean values back to Y/N for API
      const updatedValues = {
        ...values,
        stockItem: values.stockItem ? 'Y' : 'N',
        plannedStock: values.plannedStock ? 'Y' : 'N'
      };
      
      const response = await axios.put(`${API_BASE_URL}/item/${id}`, updatedValues);
      
      if (response.data && response.data.success) {
        message.success('Item updated successfully');
        navigate(`/item-master/read/${id}`);
      } else {
        message.error(response.data?.message || 'Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      message.error(err.response?.data?.message || 'An error occurred while updating the item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ErpLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spin size="large" tip="Loading item details..." />
        </div>
      </ErpLayout>
    );
  }

  if (error || !item) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Title level={4} type="danger">Error: {error || 'Item not found'}</Title>
          <Button type="primary" onClick={() => navigate('/item-master')}>
            <ArrowLeftOutlined /> Back to Item List
          </Button>
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" onClick={() => navigate(`/item-master/read/${id}`)}>
              <ArrowLeftOutlined /> Back to Item Details
            </Button>
            <Title level={4} style={{ margin: 0 }}>Edit Item: {item.itemNumber}</Title>
          </Space>
        </div>

        <Card title="Item Information" bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              ...item,
              stockItem: item.stockItem === 'Y',
              plannedStock: item.plannedStock === 'Y'
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="itemNumber"
                  label="Item Number"
                >
                  <Input disabled />
                  <Text type="secondary">Item Number cannot be changed</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="shortDescription"
                  label="Short Description"
                  rules={[
                    { required: true, message: 'Please enter a short description' },
                    { max: 100, message: 'Description cannot exceed 100 characters' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="longDescription"
                  label="Long Description"
                >
                  <TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="standardDescription"
                  label="Standard Description"
                >
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="manufacturerName"
                  label="Manufacturer Name"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="manufacturerPartNumber"
                  label="Manufacturer Part Number"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="equipmentCategory"
                  label="Equipment Category"
                >
                  <Select allowClear>
                    <Option value="VALVE">VALVE</Option>
                    <Option value="PUMP">PUMP</Option>
                    <Option value="MOTOR">MOTOR</Option>
                    <Option value="INSTRUMENT">INSTRUMENT</Option>
                    <Option value="ELECTRICAL">ELECTRICAL</Option>
                    <Option value="PIPING">PIPING</Option>
                    <Option value="CONSUMABLE">CONSUMABLE</Option>
                    <Option value="TOOL">TOOL</Option>
                    <Option value="OTHER">OTHER</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="uom"
                  label="Unit of Measure"
                >
                  <Select allowClear>
                    <Option value="EA">Each (EA)</Option>
                    <Option value="BOX">Box (BOX)</Option>
                    <Option value="PC">Piece (PC)</Option>
                    <Option value="KG">Kilogram (KG)</Option>
                    <Option value="LTR">Liter (LTR)</Option>
                    <Option value="M">Meter (M)</Option>
                    <Option value="CM">Centimeter (CM)</Option>
                    <Option value="SET">Set (SET)</Option>
                    <Option value="PK">Pack (PK)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="unspscCode"
                  label="UNSPSC Code"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="criticality"
                  label="Criticality"
                >
                  <Select allowClear>
                    <Option value="NO">No Criticality</Option>
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="stockItem"
                  label="Stock Item"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="plannedStock"
                  label="Planned Stock"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
                size="large"
              >
                Update Item
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ErpLayout>
  );
}
