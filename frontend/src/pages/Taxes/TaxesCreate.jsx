import React from 'react';
import SimpleForm from '@/components/SimpleForm';
import useLanguage from '@/locale/useLanguage';

export default function TaxesCreate() {
  const translate = useLanguage();
  const ENTITY = 'taxes';

  // Define form fields based on TaxForm
  const formFields = [
    {
      name: 'taxName',
      label: translate('Name'),
      type: 'text',
      required: true,
      rules: [{ required: true, message: translate('Please input tax name!') }]
    },
    {
      name: 'taxValue',
      label: translate('Value'),
      type: 'number',
      required: true,
      rules: [
        { 
          required: true, 
          message: translate('Please input tax value!'),
          type: 'number',
          min: 0,
          max: 100
        }
      ]
    },
    {
      name: 'enabled',
      label: translate('Enabled'),
      type: 'switch',
      initialValue: true
    },
    {
      name: 'isDefault',
      label: translate('Default'),
      type: 'switch',
      initialValue: false
    }
  ];

  return (
    <SimpleForm
      entity={ENTITY}
      fields={formFields}
      title={translate("New Tax")}
      submitButtonText={translate("Create Tax")}
    />
  );
}
