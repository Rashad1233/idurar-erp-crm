import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleReadItem from '@/components/SimpleReadItem';
import useLanguage from '@/locale/useLanguage';

export default function TaxesRead() {
  const { id } = useParams();
  const translate = useLanguage();
  const ENTITY = 'taxes';

  // Map of field names to labels
  const fieldLabels = {
    taxName: translate('Name'),
    taxValue: translate('Value'),
  };

  // Additional fields with custom rendering
  const additionalFields = [
    {
      key: 'isDefault',
      label: translate('Default'),
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
