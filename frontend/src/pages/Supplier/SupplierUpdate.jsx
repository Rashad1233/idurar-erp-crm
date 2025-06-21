import React from 'react';
import SupplierForm from '@/components/Procurement/SupplierForm';

export default function SupplierUpdate() {
  return <SupplierForm />;
}
      ]
    },
    {
      name: 'complianceChecked',
      label: 'Compliance Checked',
      type: 'switch'
    },
    {
      name: 'comments',
      label: 'Comments',
      type: 'textarea'
    }
  ];

  return (
    <SimpleForm
      entity={ENTITY}
      id={id}
      fields={formFields}
      isUpdateForm={true}
      title="Update Supplier"
      submitButtonText="Update Supplier"
    />
  );
}
