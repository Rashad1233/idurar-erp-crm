import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { ErpLayout } from '@/layout';
import WarehouseTransactionForm from '@/forms/WarehouseTransactionForm';
import useLanguage from '@/locale/useLanguage';

export default function WarehouseTransaction() {
  const translate = useLanguage();
  const [activeTab, setActiveTab] = useState('GR');
  
  return (
    <ErpLayout>
      <Card title={translate('Warehouse Transactions')}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'GR',
              label: translate('Goods Receipt (GR)'),
              children: <WarehouseTransactionForm transactionType="GR" />,
            },
            {
              key: 'GI',
              label: translate('Goods Issue (GI)'),
              children: <WarehouseTransactionForm transactionType="GI" />,
            },
            {
              key: 'GE',
              label: translate('Goods Return (GE)'),
              children: <WarehouseTransactionForm transactionType="GE" />,
            },
            {
              key: 'GT',
              label: translate('Goods Transfer (GT)'),
              children: <WarehouseTransactionForm transactionType="GT" />,
            },
          ]}
        />
      </Card>
    </ErpLayout>
  );
}
