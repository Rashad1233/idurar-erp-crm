import React from 'react';
import { Card, Typography } from 'antd';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;

export default function FinancialReporting() {
  const translate = useLanguage();
  
  return (
    <ErpLayout>
      <Title level={2}>{translate('Financial Reporting')}</Title>
      <Text type="secondary">{translate('Financial reports and analytics')}</Text>
      
      <Card style={{ marginTop: 20 }}>
        <Text>
          {translate('Financial reporting module is under development. This will include income statements, balance sheets, cash flow statements, and other financial reports.')}
        </Text>
      </Card>
    </ErpLayout>
  );
}
