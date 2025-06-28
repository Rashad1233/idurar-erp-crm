import { useState, useEffect } from 'react';

import { Button, Tag, Form, Divider, message } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { useSelector, useDispatch } from 'react-redux';

import useLanguage from '@/locale/useLanguage';
import warehouseService from '@/services/warehouseService';

import { settingsAction } from '@/redux/settings/actions';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';

import calculate from '@/utils/calculate';
import { ensureEntityIds } from '@/utils/entityUtils';
import { generate as uniqueId } from 'shortid';

import Loading from '@/components/Loading';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

function SaveForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

function SubmitForm({ form }) {
  const translate = useLanguage();
  const handelClick = () => {
    form.setFieldValue('status', 'submitted');
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" style={{ marginLeft: 8 }}>
      {translate('Submit For Approval')}
    </Button>
  );
}

export default function CreateItem({ config, CreateForm }) {
  const translate = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Always fetch settings at component mount
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, []);
  
  let { entity } = config;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const [offerSubTotal, setOfferSubTotal] = useState(0);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  
  const handelValuesChange = (changedValues, values) => {
    const items = values['items'];
    let subTotal = 0;
    let subOfferTotal = 0;

    if (items) {
      items.map((item) => {
        if (item) {
          if (item.offerPrice && item.quantity) {
            let offerTotal = calculate.multiply(item['quantity'], item['offerPrice']);
            subOfferTotal = calculate.add(subOfferTotal, offerTotal);
          }
          if (item.quantity && item.price) {
            let total = calculate.multiply(item['quantity'], item['price']);
            //sub total
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
      setOfferSubTotal(subOfferTotal);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setSubmitInProgress(false);
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      setSubTotal(0);
      setOfferSubTotal(0);
      
      // Check if result exists and has either _id (MongoDB) or id (PostgreSQL)
      if (result) {
        const recordId = result.id || result._id; // Support both MongoDB _id and PostgreSQL id
        if (recordId) {
          message.success('Created successfully!');
          navigate(`/${entity.toLowerCase()}/read/${recordId}`);
        } else {
          message.success('Created successfully, but unable to navigate to the record.');
          navigate(`/${entity.toLowerCase()}`); // Navigate to list view as fallback
        }
      }
    }
    return () => {};
  }, [isSuccess]);
  const onSubmit = (fieldsValue) => {
    setSubmitInProgress(true);
    
    try {
      if (fieldsValue) {
        // Handle date fields
        const dateFields = ['date', 'expiredDate', 'dueDate'];
        let processedData = { ...fieldsValue };
        
        // Special handling for warehouse forms
        if (entity.toLowerCase() === 'warehouse') {
          // Check if it's a bin location form
          if (processedData.binCode) {
            // It's a bin location form
            return handleBinLocationSubmit(processedData);
          } else if (processedData.code) {
            // It's a storage location form
            return handleStorageLocationSubmit(processedData);
          }
        }
        
        // Convert date objects to ISO strings
        dateFields.forEach(field => {
          if (processedData[field] && processedData[field]._isAMomentObject) {
            // It's a moment object (provided by antd DatePicker)
            processedData[field] = processedData[field].toISOString();
          } else if (processedData[field] && processedData[field] instanceof Date) {
            // It's a JavaScript Date object
            processedData[field] = processedData[field].toISOString();
          }
        });
        
        // Ensure items is always an array
        if (!Array.isArray(processedData.items)) {
          processedData.items = [];
        }

        // Process items
        if (processedData.items) {
          let newList = [...processedData.items];
          newList = newList.map((item) => {
            // Ensure numeric values and prevent NaN
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const total = quantity && price ? calculate.multiply(quantity, price) : 0;
            
            return {
              ...item,
              quantity: quantity,
              price: price,
              totalPrice: total // Match the database column name
            };
          });
          
          processedData.items = newList;
        }
        
        // Convert taxRate to number
        if (processedData.taxRate !== undefined) {
          processedData.taxRate = Number(processedData.taxRate) || 0;
        }
        
        // Handle specific field mappings for different entities
        if (entity === 'purchase-order') {
          // Map frontend form fields to backend API expectations
          if (processedData.supplier) {
            processedData.supplierId = processedData.supplier;
            delete processedData.supplier;
          }
          if (processedData.rfq) {
            processedData.requestForQuotationId = processedData.rfq;
            delete processedData.rfq;
          }
          if (processedData.purchaseRequisition) {
            processedData.purchaseRequisitionId = processedData.purchaseRequisition;
            delete processedData.purchaseRequisition;
          }
        }
        
        // Ensure all entity references are proper UUIDs
        const processedDataWithIds = ensureEntityIds(processedData);
        
        console.log('Submitting form data:', processedDataWithIds);
        dispatch(erp.create({ entity, jsonData: processedDataWithIds }));
      }
    } catch (error) {
      setSubmitInProgress(false);
      console.error('Error in form submission:', error);
      message.error('There was an error processing your form. Please check your inputs.');
    }
  };

  // Handle storage location form submission
  const handleStorageLocationSubmit = async (data) => {
    try {
      // Create storage location
      const result = await warehouseService.createStorageLocation({
        code: data.code,
        description: data.description,
        street: data.street || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || ''
      });
      
      if (result.success) {
        message.success(translate('Storage location created successfully'));
        setSubmitInProgress(false);
        navigate('/warehouse');
      } else {
        message.error(result.error || translate('Failed to create storage location'));
        setSubmitInProgress(false);
      }
    } catch (error) {
      console.error('Error creating storage location:', error);
      message.error(translate('Failed to create storage location'));
      setSubmitInProgress(false);
    }
  };
  
  // Handle bin location form submission
  const handleBinLocationSubmit = async (data) => {
    try {
      // Create bin location
      const result = await warehouseService.createBinLocation({
        binCode: data.binCode,
        storageLocationId: data.storageLocationId,
        description: data.description || ''
      });
      
      if (result.success) {
        message.success(translate('Bin location created successfully'));
        setSubmitInProgress(false);
        navigate('/warehouse');
      } else {
        message.error(result.error || translate('Failed to create bin location'));
        setSubmitInProgress(false);
      }
    } catch (error) {
      console.error('Error creating bin location:', error);
      message.error(translate('Failed to create bin location'));
      setSubmitInProgress(false);
    }
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading || submitInProgress}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onSubmit} 
          onValuesChange={handelValuesChange}
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
            message.error('Please check form for errors');
          }}
        >
          <CreateForm form={form} subTotal={subTotal} offerTotal={offerSubTotal} />
        </Form>
      </Loading>

    </>
  );
}
