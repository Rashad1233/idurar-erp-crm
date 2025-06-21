import React from 'react';
import { Card, Typography } from 'antd';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;

export default function FinancialAudit() {
  const translate = useLanguage();
  
  return (
    <ErpLayout>
      <Title level={2}>{translate('Financial Audit Trail')}</Title>
      <Text type="secondary">{translate('Audit trails for financial transactions')}</Text>
      
      <Card style={{ marginTop: 20 }}>
        <Text>
          {translate('Financial audit module is under development. This will track all financial transactions, approvals, changes, and provide a complete audit trail for regulatory compliance.')}
        </Text>
      </Card>
    </ErpLayout>
  );
}
