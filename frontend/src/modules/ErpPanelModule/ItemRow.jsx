import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { useMoney, useDate } from '@/settings';
import calculate from '@/utils/calculate';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const money = useMoney();
  const updateQt = (value) => {
    setQuantity(Number(value) || 0);
  };
  const updatePrice = (value) => {
    setPrice(Number(value) || 0);
  };
  useEffect(() => {
    if (current) {
      try {
        // When it accesses the /payment/ endpoint,
        // it receives an invoice.item instead of just item
        // and breaks the code, but now we can check if items exists,
        // and if it doesn't we can access invoice.items.

        const { items = [], invoice } = current;

        if (invoice) {
          const item = invoice && field.fieldKey !== undefined ? invoice[field.fieldKey] : null;

          if (item) {
            setQuantity(Number(item.quantity) || 0);
            setPrice(Number(item.price) || 0);
          }
        } else if (items && Array.isArray(items)) {
          const item = field.fieldKey !== undefined && field.fieldKey < items.length ? items[field.fieldKey] : null;

          if (item) {
            setQuantity(Number(item.quantity) || 0);
            setPrice(Number(item.price) || 0);
          }
        }
      } catch (error) {
        console.error('Error processing item data:', error);
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
    
    // Update the form field value to ensure it's saved
    const formInstance = field.form;
    if (formInstance) {
      const fieldNamePath = [field.name, 'total'];
      const currentValue = formInstance.getFieldValue(fieldNamePath);
      
      if (currentValue !== currentTotal) {
        formInstance.setFieldsValue({
          [field.name]: {
            ...(formInstance.getFieldValue(field.name) || {}),
            total: currentTotal
          }
        });
      }
    }
  }, [price, quantity, field]);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Missing itemName name',
            },
            {
              pattern: /^(?!\s*$)[\s\S]+$/, // Regular expression to allow spaces, alphanumeric, and special characters, but not just spaces
              message: 'Item Name must contain alphanumeric or special characters',
            },
          ]}
        >
          <Input placeholder="Item Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={7}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="description Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) =>
                money.amountFormatter({ amount: value, currency_code: money.currency_code })
              }
            />
          </Form.Item>
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
