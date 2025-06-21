import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleReadItem from '@/components/SimpleReadItem';

export default function CustomerRead() {
  const { id } = useParams();
  
  const ENTITY = 'client';

  // Map of field names to labels
  const fieldLabels = {
    name: 'Customer Name',
    country: 'Country',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
  };

  // Additional fields with custom rendering
  const additionalFields = [];

  return (
    <SimpleReadItem
      id={id}
      entity={ENTITY}
      labels={fieldLabels}
      additionalFields={additionalFields}
    />
  );
}
