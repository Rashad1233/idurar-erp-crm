import React from 'react';
import SimpleForm from '@/components/SimpleForm';
import useLanguage from '@/locale/useLanguage';

export default function CustomerCreate() {
  const translate = useLanguage();
  const ENTITY = 'client';

  // Define form fields based on Customer fields
  const formFields = [
    {
      name: 'name',
      label: translate('Customer Name'),
      type: 'text',
      required: true,
      rules: [{ required: true, message: 'Please input customer name!' }]
    },
    {
      name: 'country',
      label: translate('Country'),
      type: 'select',
      options: [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'AU', label: 'Australia' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'IT', label: 'Italy' },
        { value: 'ES', label: 'Spain' },
        { value: 'JP', label: 'Japan' },
        { value: 'CN', label: 'China' },
        { value: 'IN', label: 'India' },
        { value: 'BR', label: 'Brazil' },
      ]
    },
    {
      name: 'address',
      label: translate('Address'),
      type: 'textarea',
    },
    {
      name: 'phone',
      label: translate('Phone'),
      type: 'text',
      rules: [{ pattern: /^[0-9\-\+\(\)\s]+$/, message: 'Please enter a valid phone number!' }]
    },
    {
      name: 'email',
      label: translate('Email'),
      type: 'text',
      rules: [{ type: 'email', message: 'Please enter a valid email address!' }]
    }
  ];

  return (
    <SimpleForm
      entity={ENTITY}
      fields={formFields}
      title={translate("New Customer")}
      submitButtonText={translate("Create Customer")}
    />
  );
}
