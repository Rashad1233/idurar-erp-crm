import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useDate } from '@/settings';

// Define Unit of Measure options
const unitOfMeasureOptions = [
  { value: 'EA', label: 'Each (EA)' },
  { value: 'PACK', label: 'Pack (PACK)' },
  { value: 'BOX', label: 'Box (BOX)' },
  { value: 'M', label: 'Meter (M)' },
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'L', label: 'Liter (L)' },
  { value: 'SET', label: 'Set (SET)' },
  { value: 'UNIT', label: 'Unit (UNIT)' }
];

// Function for requisition item row
const RequisitionItemRow = ({ field, remove }) => {
  const translate = useLanguage();
  
  return (
    <Row gutter={[12, 12]} style={{ position: 'relative', marginBottom: '24px' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemNumber']}
          rules={[
            {
              message: 'Item number or description is required',
            },
          ]}
        >
          <SelectAsync
            entity={'item'}
            displayLabels={['itemNumber', 'description']}
            placeholder={translate('Item Number (if known)')}
            searchFields='itemNumber,description'
          />
        </Form.Item>
      </Col>
      
      <Col className="gutter-row" span={7}>
        <Form.Item
          name={[field.name, 'description']}
          rules={[
            {
              required: true,
              message: 'Item description is required',
            },
          ]}
        >
          <Input placeholder={translate('Item Description')} />
        </Form.Item>
      </Col>
      
      <Col className="gutter-row" span={3}>
        <Form.Item
          name={[field.name, 'unitOfMeasure']}
          rules={[
            {
              required: true,
              message: 'UOM is required',
            },
          ]}
        >
          <Select placeholder="UOM" options={unitOfMeasureOptions} />
        </Form.Item>
      </Col>
      
      <Col className="gutter-row" span={3}>
        <Form.Item
          name={[field.name, 'quantity']}
          rules={[
            {
              required: true,
              message: 'Quantity required',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={1} placeholder={translate('Qty')} />
        </Form.Item>
      </Col>
      
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            placeholder={translate('Price (if known)')}
          />
        </Form.Item>
      </Col>
      
      <div style={{ position: 'absolute', right: '-20px', top: '5px' }}>
        <Button danger onClick={() => remove(field.name)}>×</Button>
      </div>
    </Row>
  );
};

export default function PurchaseRequisitionForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const addField = useRef(null);
  
  // For loading cost centers and approvers based on selected cost center
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [approverOptions, setApproverOptions] = useState([]);
  
  // Add mock approvers based on cost center
  useEffect(() => {
    if (selectedCostCenter) {
      // In reality, this would come from an API call based on the cost center and DoFA
      const mockApprovers = {
        'CC-001': [
          { value: 'farhad', label: 'Farhad (Up to $500)' },
          { value: 'rashad', label: 'Rashad (Up to $3000)' },
          { value: 'fakhri', label: 'Fakhri (Up to $5000)' },
          { value: 'samira', label: 'Samira (Up to $10000)' },
          { value: 'rufat', label: 'Rufat (Over $10000)' }
        ],
        'CC-002': [
          { value: 'ahmad', label: 'Ahmad (Up to $500)' },
          { value: 'mohammed', label: 'Mohammed (Up to $3000)' },
          { value: 'aisha', label: 'Aisha (Up to $5000)' },
          { value: 'fatima', label: 'Fatima (Up to $10000)' },
          { value: 'omar', label: 'Omar (Over $10000)' }
        ],
        'CC-003': [
          { value: 'john', label: 'John (Up to $500)' },
          { value: 'sarah', label: 'Sarah (Up to $3000)' },
          { value: 'michael', label: 'Michael (Up to $5000)' },
          { value: 'emma', label: 'Emma (Up to $10000)' },
          { value: 'david', label: 'David (Over $10000)' }
        ]
      };
      
      setApproverOptions(mockApprovers[selectedCostCenter] || []);
    } else {
      setApproverOptions([]);
    }
  }, [selectedCostCenter]);

  const handleCostCenterChange = (value) => {
    setSelectedCostCenter(value);
  };
  
  useEffect(() => {
    // Add a default item on initial load if there are none
    setTimeout(() => {
      if (addField.current) {
        addField.current.click();
      }
    }, 100);
  }, []);
  
  return (
    <>
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <Form.Item
            label={translate('PR Header Description')}
            name="description"
            rules={[
              {
                required: true,
                message: 'Please enter a description for this purchase requisition',
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder={translate('Brief description of this purchase requisition')} />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label={translate('Cost Center')}
            name="costCenter"
            rules={[
              {
                required: true,
                message: 'Please select a cost center',
              },
            ]}
          >
            <Select 
              placeholder={translate('Select Cost Center')}
              onChange={handleCostCenterChange}
              options={[
                { value: 'CC-001', label: 'Engineering (CC-001)' },
                { value: 'CC-002', label: 'Operations (CC-002)' },
                { value: 'CC-003', label: 'IT Department (CC-003)' },
              ]}
            />
          </Form.Item>
          
          <Form.Item
            label={translate('Approver')}
            name="approver"
            rules={[
              {
                required: true,
                message: 'Please select an approver',
              },
            ]}
          >
            <Select 
              placeholder={translate('Select Approver')}
              options={approverOptions}
              disabled={!selectedCostCenter}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        label={translate('Required By Date')}
        name="requiredDate"
        rules={[
          {
            required: true,
            message: 'Please select when these items are required by',
          },
        ]}
        initialValue={dayjs().add(7, 'days')}
      >
        <DatePicker format={dateFormat} style={{ width: '100%' }} />
      </Form.Item>

      <Divider orientation="left">{translate('Items')}</Divider>
      
      <Row gutter={[12, 12]} style={{ position: 'relative', marginBottom: '10px' }}>
        <Col className="gutter-row" span={5}>
          <p>{translate('Item Number')}</p>
        </Col>
        <Col className="gutter-row" span={7}>
          <p>{translate('Description')}</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>{translate('UoM')}</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>{translate('Quantity')}</p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p>{translate('Price')}</p>
        </Col>
      </Row>
      
      <Form.List 
        name="items"
        rules={[
          {
            validator: async (_, items) => {
              if (!items || items.length === 0) {
                return Promise.reject(new Error('At least one item is required'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(field => (
              <RequisitionItemRow key={field.key} field={field} remove={remove} />
            ))}
            
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add Item')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        label={translate('Additional Comments')}
        name="comments"
      >
        <Input.TextArea rows={3} placeholder={translate('Any additional notes or supplier recommendations')} />
      </Form.Item>
    </>
  );
}
