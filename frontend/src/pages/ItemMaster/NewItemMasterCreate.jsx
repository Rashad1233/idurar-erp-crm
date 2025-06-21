import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, PageHeader, Card, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import useLanguage from '@/locale/useLanguage';
import EnhancedItemMasterForm from '@/components/ItemMaster/EnhancedItemMasterForm';
import CrudLayout from '@/layout/CrudLayout';

const { Title } = Typography;

export default function NewItemMasterCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSuccess = (data) => {
    message.success(translate('Item created successfully!'));
    
    // Check if it's a stock item, redirect to inventory creation if it is
    if (data.stockItem === 'Y') {
      navigate(`/inventory/create?itemMasterId=${data.id}`);
    } else {
      navigate('/item'); // Redirect to item list
    }
  };

  const handleCancel = () => {
    navigate('/item');
  };

  return (
    <CrudLayout
      title={translate('Create New Item Master')}
      breadcrumb={[
        {
          title: translate('Dashboard'),
          path: '/',
        },
        {
          title: translate('Items'),
          path: '/item',
        },
        {
          title: translate('Create'),
        },
      ]}
    >
      <PageHeader
        onBack={() => navigate('/item')}
        title={translate('Create New Item Master')}
        subTitle={translate('Define a new product or service in the system')}
        extra={[
          <Button key="back" onClick={handleCancel}>
            {translate('Cancel')}
          </Button>,
        ]}
      />

      <Card>
        <Title level={4}>{translate('Item Master Information')}</Title>
        <p>
          {translate('This form allows you to create a new item definition in the system. Item Masters serve as the foundation for inventory management.')}
        </p>
        <p>
          {translate('For stock items, an inventory record will be automatically created. You can later add stock levels and locations for the item.')}
        </p>

        <EnhancedItemMasterForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Card>
    </CrudLayout>
  );
}
