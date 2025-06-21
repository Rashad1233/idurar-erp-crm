import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleForm from '@/components/SimpleForm';
import useLanguage from '@/locale/useLanguage';

export default function PaymentModeUpdate() {
  const { id } = useParams();
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
      type: 'switch'
    },
    {
      name: 'isDefault',
      label: translate('Default Mode'),
      type: 'switch'
    }
  ];

  return (
    <SimpleForm
      entity={ENTITY}
      id={id}
      fields={formFields}
      isUpdateForm={true}
      title={translate("Update Payment Mode")}
      submitButtonText={translate("Update Payment Mode")}
    />
  );
}
