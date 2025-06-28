import { Form, Input, InputNumber, Select, Switch, Typography, Tooltip, Space, Divider } from 'antd';
import { CloseOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import UnspscSimpleInput from '@/components/UnspscSimpleInput/UnspscSimpleInput';

import useLanguage from '@/locale/useLanguage';

const { Title } = Typography;

export default function ItemMasterForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const [form] = Form.useForm();
  
  return (
    <>
      <Title level={4}>{translate('Item Details')}</Title>
      <Form.Item
        label={translate('Item Number')}
        name="itemNumber"
        rules={[
          {
            required: isUpdateForm,
            message: translate('Item number is required for updates'),
          },
        ]}
      >
        <Input disabled={isUpdateForm} placeholder={isUpdateForm ? '' : translate('Auto-generated')} />
      </Form.Item>
      
      <Form.Item
        label={translate('Item Short Description')}
        name="description"
        rules={[
          {
            required: true,
            message: translate('Please input the item description!'),
            max: 44,
          },
        ]}
      >
        <Input placeholder={translate('NOUN, MODIFIER: size, class, material')} />
      </Form.Item>
      
      <Form.Item
        label={translate('Long Description')}
        name="longDescription"
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      
      <Divider>{translate('UNSPSC Classification')}</Divider>
      
      <Tooltip title={translate('United Nations Standard Products and Services Code - 8-digit hierarchical classification')}>
        <Typography.Text type="secondary">
          <Space>
            {translate('UNSPSC Code')}
            <InfoCircleOutlined />
          </Space>
        </Typography.Text>
      </Tooltip>
      
      <Form.Item
        label={translate('UNSPSC Code')}
        name="unspscCode"
        rules={[
          {
            required: true,
            message: translate('Please enter or search for a UNSPSC code!'),
          },
        ]}
      >
        <UnspscSimpleInput placeholder={translate("Enter code (e.g., 40141607) or path (e.g., 40/14/16/07)")} />
      </Form.Item>
      
      <Divider>{translate('Item Specifications')}</Divider>
      
      <Form.Item
        label={translate('Manufacturer Name')}
        name="manufacturerName"
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Manufacturer Part Number')}
        name="manufacturerPartNumber"
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('Equipment Category')}
        name="equipmentCategory"
        rules={[
          {
            required: true,
            message: translate('Please select the equipment category!'),
          },
        ]}
      >
        <Select placeholder={translate('Select Category')}>
          <Select.Option value="VALVE">Valves</Select.Option>
          <Select.Option value="PUMP">Pumps</Select.Option>
          <Select.Option value="MOTOR">Motors</Select.Option>
          <Select.Option value="COMPRESSOR">Compressors</Select.Option>
          <Select.Option value="FITTING">Fittings</Select.Option>
          <Select.Option value="GASKET">Gaskets</Select.Option>
          <Select.Option value="PIPE">Pipes</Select.Option>
          <Select.Option value="FLANGE">Flanges</Select.Option>
          <Select.Option value="ELECTRICAL">Electrical</Select.Option>
          <Select.Option value="OTHER">Other</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Equipment Sub-Category')}
        name="equipmentSubCategory"
        dependencies={['equipmentCategory']}
      >
        <Select placeholder={translate('Select Sub-Category')}>
          <Select.Option value="GATE">Gate</Select.Option>
          <Select.Option value="BALL">Ball</Select.Option>
          <Select.Option value="GLOBE">Globe</Select.Option>
          <Select.Option value="BUTTERFLY">Butterfly</Select.Option>
          <Select.Option value="CHECK">Check</Select.Option>
          <Select.Option value="SAFETY">Safety</Select.Option>
          <Select.Option value="OTHER">Other</Select.Option>
        </Select>
      </Form.Item>
      
      <Divider>{translate('Inventory Management')}</Divider>
      
      <Form.Item
        label={translate('Stock Classification')}
        name="stockClassification"
        rules={[
          {
            required: true,
            message: translate('Please select the stock classification!'),
          },
        ]}
      >
        <Select placeholder={translate('Select Stock Classification')}>
          <Select.Option value="ST2">ST2 - Planned Stock (with min/max levels)</Select.Option>
          <Select.Option value="ST1">ST1 - Unplanned Stock Items</Select.Option>
          <Select.Option value="NS3">NS3 - Non-Stock Items</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => 
          prevValues.stockClassification !== currentValues.stockClassification
        }
      >
        {({ getFieldValue }) => {
          const stockClassification = getFieldValue('stockClassification');
          const isPlannedStock = stockClassification === 'ST2';
          
          return isPlannedStock ? (
            <>
              <Form.Item
                label={translate('Minimum Stock Level')}
                name="minimumStockLevel"
                rules={[
                  {
                    required: true,
                    message: translate('Minimum stock level is required for planned stock!'),
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                label={translate('Maximum Stock Level')}
                name="maximumStockLevel"
                rules={[
                  {
                    required: true,
                    message: translate('Maximum stock level is required for planned stock!'),
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                label={translate('Reorder Point')}
                name="reorderPoint"
                rules={[
                  {
                    required: true,
                    message: translate('Reorder point is required for planned stock!'),
                  },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null;
        }}
      </Form.Item>
      
      <Form.Item
        label={translate('Unit of Measure (UOM)')}
        name="uom"
        rules={[
          {
            required: true,
            message: translate('Please select the unit of measure!'),
          },
        ]}
      >
        <Select placeholder={translate('Select UOM')}>
          <Select.Option value="EA">EA - Each</Select.Option>
          <Select.Option value="PCS">PCS - Pieces</Select.Option>
          <Select.Option value="BOX">BOX - Box</Select.Option>
          <Select.Option value="SET">SET - Set</Select.Option>
          <Select.Option value="KG">KG - Kilogram</Select.Option>
          <Select.Option value="M">M - Meter</Select.Option>
          <Select.Option value="CM">CM - Centimeter</Select.Option>
          <Select.Option value="L">L - Liter</Select.Option>
          <Select.Option value="ML">ML - Milliliter</Select.Option>
          <Select.Option value="PR">PR - Pair</Select.Option>
          <Select.Option value="DZ">DZ - Dozen</Select.Option>          <Select.Option value="CTN">CTN - Carton</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={
          <Space>
            {translate('Quantity per kg')}
            <Tooltip title={translate('Specify how many units per kilogram (for weight-based calculations)')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
        name="quantityPerKg"
      >
        <InputNumber
          placeholder={translate('e.g., 10.5')}
          min={0}
          precision={4}
          style={{ width: '100%' }}
        />
      </Form.Item>
      
      <Form.Item
        label={
          <Space>
            {translate('Quantity per m³')}
            <Tooltip title={translate('Specify how many units per cubic meter (for volume-based calculations)')}>
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        }
        name="quantityPerCubicMeter"
      >
        <InputNumber
          placeholder={translate('e.g., 25.75')}
          min={0}
          precision={4}
          style={{ width: '100%' }}
        />
      </Form.Item>
      
      <Form.Item
        label={translate('Criticality')}
        name="criticality"
        rules={[
          {
            required: true,
            message: translate('Please select the criticality level!'),
          },
        ]}
      >
        <Select placeholder={translate('Select Criticality')}>
          <Select.Option value="HIGH">High - Critical for operations</Select.Option>
          <Select.Option value="MEDIUM">Medium - Affects operations but has workarounds</Select.Option>
          <Select.Option value="LOW">Low - Non-critical component</Select.Option>
          <Select.Option value="NO">No - Not critical</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Serialized Item')}
        name="serialNumber"
        valuePropName="checked"
      >
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </Form.Item>
      
      <Divider>{translate('Procurement Information')}</Divider>
      
      <Form.Item
        label={translate('Associated Contract')}
        name="contractId"
      >
        <Select
          placeholder={translate('Select Contract')}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {/* Contract options will be populated dynamically from API */}
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Preferred Supplier')}
        name="preferredSupplierId"
      >
        <Select
          placeholder={translate('Select Supplier')}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {/* Supplier options will be populated dynamically from API */}
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Lead Time (Days)')}
        name="leadTimeDays"
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        label={translate('List Price')}
        name="listPrice"
      >
        <InputNumber 
          min={0} 
          style={{ width: '100%' }} 
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>
      
      <Form.Item
        label={translate('Additional Notes')}
        name="notes"
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      
      {isUpdateForm && (
        <>
          <Form.Item
            label={translate('Contract Number')}
            name="contractNumber"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label={translate('Supplier Name')}
            name="supplierName"
          >
            <Input />
          </Form.Item>
        </>
      )}
    </>
  );
}
