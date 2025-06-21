import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col, message, Alert } from 'antd';

import { PlusOutlined } from '@ant-design/icons';

import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';

import ItemRow from '@/modules/ErpPanelModule/ItemRow';

import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Invoice form error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div>
          <Alert
            message="Error Rendering Form"
            description={
              <div>
                <p>There was an error rendering the invoice form. This is likely due to invalid data format.</p>
                <p>Error: {this.state.error?.toString()}</p>
                <Button 
                  type="primary" 
                  onClick={() => window.location.href = '/invoice'}
                >
                  Return to Invoice List
                </Button>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default function InvoiceForm({ subTotal = 0, current = null }) {
  const financeSettings = useSelector(selectFinanceSettings) || {};
  const last_invoice_number = financeSettings.last_invoice_number || 1000;
  
  // Always render the form, even if settings aren't loaded yet
  return (
    <ErrorBoundary>
      <LoadInvoiceForm subTotal={subTotal} current={current} lastInvoiceNumber={last_invoice_number} />
    </ErrorBoundary>
  );
}

function LoadInvoiceForm({ subTotal = 0, current = null, lastInvoiceNumber = 1000 }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => Number(lastInvoiceNumber) + 1);
  const [hasFormErrors, setHasFormErrors] = useState(false);

  const handelTaxChange = (value) => {
    if (value !== undefined && value !== null) {
      setTaxRate(Number(value) / 100);
    } else {
      setTaxRate(0);
    }
  };

  useEffect(() => {
    if (current) {
      try {
        const { taxRate = 0, year, number } = current;
        setTaxRate(Number(taxRate) / 100);
        setCurrentYear(Number(year) || new Date().getFullYear());
        setLastNumber(Number(number) || (Number(lastInvoiceNumber) + 1));
      } catch (error) {
        console.error('Error processing current invoice data:', error);
      }
    }
  }, [current, lastInvoiceNumber]);

  useEffect(() => {
    try {
      const numericSubTotal = Number(subTotal) || 0;
      const numericTaxRate = Number(taxRate) || 0;
      
      const currentTotal = calculate.add(calculate.multiply(numericSubTotal, numericTaxRate), numericSubTotal);
      setTaxTotal(Number.parseFloat(calculate.multiply(numericSubTotal, numericTaxRate)));
      setTotal(Number.parseFloat(currentTotal));
    } catch (error) {
      console.error('Error calculating totals:', error);
      setTaxTotal(0);
      setTotal(0);
    }
  }, [subTotal, taxRate]);

  const addField = useRef(false);

  useEffect(() => {
    if (addField.current) {
      addField.current.click();
    }
  }, []);

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[
              {
                required: true,
                message: 'Please select a client',
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Client'}
              withRedirect
              urlToRedirect={'/customer'}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            rules={[
              {
                required: true,
                message: 'Invoice number is required',
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('year')}
            name="year"
            initialValue={currentYear}
            rules={[
              {
                required: true,
                message: 'Year is required',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[
              {
                required: true,
                message: 'Status is required',
              },
            ]}
            initialValue={'draft'}
          >
            <Select
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
                message: 'Date is required',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="expiredDate"
            label={translate('Expire Date')}
            rules={[
              {
                required: true,
                type: 'object',
                message: 'Expiration date is required',
              },
            ]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={10}>
          <Form.Item label={translate('Note')} name="notes">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col className="gutter-row" span={5}>
          <p>{translate('Item')}</p>
        </Col>
        <Col className="gutter-row" span={7}>
          <p>{translate('Description')}</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>{translate('Quantity')}</p>{' '}
        </Col>
        <Col className="gutter-row" span={4}>
          <p>{translate('Price')}</p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p>{translate('Total')}</p>
        </Col>
      </Row>
      <Form.List name="items" rules={[
        {
          validator: async (_, items) => {
            if (!items || items.length === 0) {
              setHasFormErrors(true);
              return Promise.reject(new Error('At least one item is required'));
            }
            setHasFormErrors(false);
            return Promise.resolve();
          },
        },
      ]}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field) => (
              <ItemRow key={field.key} remove={remove} field={field} current={current}></ItemRow>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add field')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
      <Divider dashed />
      <div style={{ position: 'relative', width: ' 100%', float: 'right' }}>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={5}>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />} 
                disabled={hasFormErrors}
                block
              >
                {translate('Save')}
              </Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4} offset={10}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Sub Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <Form.Item
              name="taxRate"
              rules={[
                {
                  required: true,
                  message: 'Tax rate is required',
                },
              ]}
            >
              <SelectAsync
                value={taxRate}
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/taxes"
                redirectLabel={translate('Add New Tax')}
                placeholder={translate('Select Tax Value')}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>
    </>
  );
}
