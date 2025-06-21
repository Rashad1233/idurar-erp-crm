import { useState, useEffect } from 'react';
import { Form, Button, message } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectRecordPaymentItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';

import PaymentForm from '@/forms/PaymentForm';
import { useNavigate } from 'react-router-dom';
import calculate from '@/utils/calculate';
import { extractUUID } from '@/utils/entityUtils';

export default function RecordPayment({ config }) {
  const navigate = useNavigate();
  const translate = useLanguage();
  let { entity } = config;

  const dispatch = useDispatch();

  const { isLoading, isSuccess, current: currentInvoice } = useSelector(selectRecordPaymentItem);
  
  console.log('RecordPayment component - currentInvoice:', currentInvoice);

  const [form] = Form.useForm();

  const [maxAmount, setMaxAmount] = useState(0);
  useEffect(() => {
    if (currentInvoice) {
      const { credit, total, discount } = currentInvoice;
      setMaxAmount(calculate.sub(calculate.sub(total, discount), credit));
    }
  }, [currentInvoice]);
  
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity}/`);
    }
  }, [isSuccess]);
  
  const onSubmit = (fieldsValue) => {
    if (currentInvoice) {
      console.log('Processing invoice payment:', currentInvoice);
      
      // Get invoice ID
      const invoice = currentInvoice.id || currentInvoice._id;
      
      // Extract client ID safely
      let client = null;
      
      // Try different places where client ID might be stored
      if (currentInvoice.client) {
        client = extractUUID(currentInvoice.client);
      }
      
      if (!client && currentInvoice.clientId) {
        client = extractUUID(currentInvoice.clientId);
      }
      
      console.log('Extracted client ID:', client);
      
      if (!client) {
        console.error('No valid client ID found in the invoice!');
        message.error('Client information is missing or invalid. Cannot record payment.');
        return;
      }
      
      // Ensure we're sending only the string IDs
      fieldsValue = {
        ...fieldsValue,
        invoice: typeof invoice === 'string' ? invoice : String(invoice),
        client
      };
      
      console.log('Recording payment with data:', fieldsValue);
    }
    
    // Final validation check
    if (!fieldsValue.client || typeof fieldsValue.client !== 'string' || 
        !fieldsValue.client.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      message.error('Invalid client ID format. Cannot record payment.');
      console.error('Invalid client ID format:', fieldsValue.client);
      return;
    }
    
    dispatch(
      erp.recordPayment({
        entity: 'payment',
        jsonData: fieldsValue,
      })
    );
  };

  return (
    <Loading isLoading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <PaymentForm maxAmount={maxAmount} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {translate('Record Payment')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
