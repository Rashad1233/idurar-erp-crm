import { Form, Input, Select, Switch, Upload } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

export default function SupplierForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  
  return (
    <>
      <Form.Item
        label={translate('Supplier Legal Name')}
        name="legalName"
        rules={[
          {
            required: true,
            message: translate('Please input the supplier legal name!'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Supplier Trade Name')}
        name="tradeName"
        rules={[
          {
            required: true,
            message: translate('Please input the supplier trade name!'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Supplier Name (Auto-generated)')}
        name="name"
        rules={[]}
      >
        <Input disabled placeholder={translate('Auto-generated after save')} />
      </Form.Item>
      
      <Form.Item
        label={translate('Contact Email')}
        name="email"
        rules={[
          {
            type: 'email',
            message: translate('Please enter a valid email address!'),
          },
          {
            required: true,
            message: translate('Please input the supplier email!'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Secondary Contact Email')}
        name="secondaryEmail"
        rules={[
          {
            type: 'email',
            message: translate('Please enter a valid email address!'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Phone')}
        name="phone"
        rules={[
          {
            required: true,
            message: translate('Please input the supplier phone number!'),
          },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Address')}
        name="address"
        rules={[
          {
            required: true,
            message: translate('Please input the supplier address!'),
          },
        ]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      
      <Form.Item
        label={translate('Payment Terms')}
        name="paymentTerms"
      >
        <Select>
          <Select.Option value="30">{translate('30 days')}</Select.Option>
          <Select.Option value="45">{translate('45 days')}</Select.Option>
          <Select.Option value="60">{translate('60 days')}</Select.Option>
          <Select.Option value="immediate">{translate('Immediate payment')}</Select.Option>
          <Select.Option value="prepaid">{translate('Prepaid')}</Select.Option>
          <Select.Option value="partial">{translate('Partial prepayment')}</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Supplier Type')}
        name="supplierType"
        rules={[
          {
            required: true,
            message: translate('Please select the supplier type!'),
          },
        ]}
      >
        <Select>
          <Select.Option value="transactional">{translate('Transactional')}</Select.Option>
          <Select.Option value="strategic">{translate('Strategic')}</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Compliance Checked')}
        name="complianceChecked"
        valuePropName="checked"
      >
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          defaultChecked={false}
        />
      </Form.Item>
      
      <Form.Item
        label={translate('Comments')}
        name="comments"
      >
        <Input.TextArea rows={2} placeholder={translate('Add any comments or recommendations')} />
      </Form.Item>
      <Form.Item
        label={translate('Attachments')}
        name="attachments"
        valuePropName="fileList"
        getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
      >
        <Upload beforeUpload={() => false} multiple accept=".pdf,.jpg,.jpeg,.png">
          <Input type="button" value={translate('Click or drag file to upload')} readOnly />
        </Upload>
      </Form.Item>
    </>
  );
}
