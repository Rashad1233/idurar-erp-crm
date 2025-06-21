import React from 'react';
import SimpleForm from '@/components/SimpleForm';
import useLanguage from '@/locale/useLanguage';

export default function PaymentModeCreate() {
  const translate = useLanguage();
  const ENTITY = 'paymentMode';

  // Define form fields based on PaymentModeForm
  const formFields = [
    {
      name: 'name',
      label: translate('Payment Mode'),
      type: 'text',
      required: true,
      rules: [{ required: true, message: translate('Please input payment mode name!') }]
    },
    {
      name: 'description',
      label: translate('Description'),
      type: 'text',
      required: true,
      rules: [{ required: true, message: translate('Please input description!') }]
    },
    {
      name: 'enabled',
      label: translate('Enabled'),
      type: 'switch',
      initialValue: true
    },
    {
      name: 'isDefault',
      label: translate('Default Mode'),
      type: 'switch',
      initialValue: false
    }
  ];

  return (
    <SimpleForm
      entity={ENTITY}
      fields={formFields}
      title={translate("New Payment Mode")}
      submitButtonText={translate("Create Payment Mode")}
    />
  );
}
