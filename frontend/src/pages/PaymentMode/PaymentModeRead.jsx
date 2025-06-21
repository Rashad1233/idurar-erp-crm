import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleReadItem from '@/components/SimpleReadItem';
import useLanguage from '@/locale/useLanguage';

export default function PaymentModeRead() {
  const { id } = useParams();
  const translate = useLanguage();
  const ENTITY = 'paymentMode';

  // Map of field names to labels
  const fieldLabels = {
    name: translate('Payment Mode'),
    description: translate('Description'),
  };

  // Additional fields with custom rendering
  const additionalFields = [
    {
      key: 'isDefault',
      label: translate('Default Mode'),
      render: (value) => value ? translate('Yes') : translate('No')
    },
    {
      key: 'enabled',
      label: translate('Enabled'),
      render: (value) => value ? translate('Yes') : translate('No')
    }
  ];

  return (
    <SimpleReadItem
      id={id}
      entity={ENTITY}
      labels={fieldLabels}
      additionalFields={additionalFields}
    />
  );
}
