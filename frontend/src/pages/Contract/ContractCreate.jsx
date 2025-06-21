import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Select, Divider, Row, Col, Card, Upload, message } from 'antd';
import { 
  InboxOutlined, 
  UserOutlined, 
  DollarOutlined,
  FileProtectOutlined,
  ShopOutlined, 
  CalendarOutlined
} from '@ant-design/icons';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import SelectAsync from '@/components/SelectAsync';
import { generate as uniqueId } from 'shortid';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import useLanguage from '@/locale/useLanguage';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ContractForm = ({ subTotal, offerTotal }) => {
  const [form] = Form.useForm();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  const [attachments, setAttachments] = useState([]);

  const contractTypes = [
    { value: 'fixed_price', label: translate('Fixed Price') },
    { value: 'time_and_materials', label: translate('Time and Materials') },
    { value: 'cost_plus', label: translate('Cost Plus') },
    { value: 'blanket', label: translate('Blanket Agreement') },
    { value: 'frame', label: translate('Framework Agreement') },
  ];

  const contractStatusOptions = [
    { value: 'draft', label: translate('Draft') },
    { value: 'pending_approval', label: translate('Pending Approval') },
    { value: 'active', label: translate('Active') },
    { value: 'expired', label: translate('Expired') },
    { value: 'terminated', label: translate('Terminated') },
  ];

  const uploadProps = {
    name: 'file',
    multiple: true,
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        setAttachments([...attachments, info.file.response]);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div className="contract-create-form">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<><FileProtectOutlined /> {translate('Contract Details')}</>}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="number"
                  label={translate('Contract Number')}
                  rules={[{ required: true, message: translate('Please enter the contract number') }]}
                >
                  <Input prefix={<FileProtectOutlined />} placeholder={translate('Auto-generated if left empty')} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="name"
                  label={translate('Contract Name')}
                  rules={[{ required: true, message: translate('Please enter the contract name') }]}
                >
                  <Input placeholder={translate('Contract Name')} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="supplier"
                  label={translate('Supplier')}
                  rules={[{ required: true, message: translate('Please select a supplier') }]}
                >
                  <SelectAsync 
                    entity="supplier" 
                    displayLabels={['name']}
                    placeholder={translate('Select Supplier')}
                    prefix={<ShopOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contractType"
                  label={translate('Contract Type')}
                  rules={[{ required: true, message: translate('Please select a contract type') }]}
                >
                  <Select placeholder={translate('Select Contract Type')}>
                    {contractTypes.map(type => (
                      <Option key={uniqueId()} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="startDate"
                  label={translate('Start Date')}
                  rules={[{ required: true, message: translate('Please select the start date') }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="YYYY-MM-DD" 
                    placeholder={translate('Start Date')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endDate"
                  label={translate('End Date')}
                  rules={[{ required: true, message: translate('Please select the end date') }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    format="YYYY-MM-DD" 
                    placeholder={translate('End Date')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label={translate('Status')}
                  initialValue="draft"
                >
                  <Select placeholder={translate('Select Status')}>
                    {contractStatusOptions.map(status => (
                      <Option key={uniqueId()} value={status.value}>{status.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title={<>{translate('Financial Details')}</>}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="value"
                  label={translate('Contract Value')}
                  rules={[{ required: true, message: translate('Please enter the contract value') }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    prefix={<DollarOutlined />} 
                    min={0} 
                    precision={2} 
                    placeholder={translate('Contract Value')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label={translate('Currency')}
                  initialValue="USD"
                >
                  <Select placeholder={translate('Select Currency')}>
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                    <Option value="GBP">GBP</Option>
                    <Option value="CAD">CAD</Option>
                    <Option value="AUD">AUD</Option>
                    <Option value="INR">INR</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="paymentTerms"
                  label={translate('Payment Terms')}
                >
                  <Select placeholder={translate('Payment Terms')}>
                    <Option value="net30">Net 30</Option>
                    <Option value="net60">Net 60</Option>
                    <Option value="net90">Net 90</Option>
                    <Option value="immediate">Immediate</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="billingFrequency"
                  label={translate('Billing Frequency')}
                >
                  <Select placeholder={translate('Billing Frequency')}>
                    <Option value="monthly">Monthly</Option>
                    <Option value="quarterly">Quarterly</Option>
                    <Option value="semi_annually">Semi-Annually</Option>
                    <Option value="annually">Annually</Option>
                    <Option value="milestone">Milestone Based</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={<>{translate('Contract Terms')}</>}>
            <Form.Item
              name="terms"
              label={translate('Terms & Conditions')}
            >
              <TextArea rows={4} placeholder={translate('Enter contract terms and conditions')} />
            </Form.Item>
            
            <Form.Item
              name="notes"
              label={translate('Notes')}
            >
              <TextArea rows={3} placeholder={translate('Additional notes or special provisions')} />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title={<>{translate('Attachments')}</>}>
            <Form.Item name="attachments">
              <Dragger {...uploadProps} showUploadList={true}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">{translate('Click or drag file to upload')}</p>
                <p className="ant-upload-hint">
                  {translate('Upload contract documents, agreements, or any supporting files')}
                </p>
              </Dragger>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default function ContractCreate() {
  const translate = useLanguage();
  
  const config = {
    entity: 'contract',
    title: translate('New Contract'),
  };
  
  return <CreateItem config={config} CreateForm={ContractForm} />;
}
