import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleReadItem from '@/components/SimpleReadItem';

export default function SupplierRead() {
  const { id } = useParams();
  
  const ENTITY = 'supplier';

  // Map of field names to labels
  const fieldLabels = {
    tradeName: 'Supplier Trade Name',
    legalName: 'Legal Name',
    email: 'Email',
    secondaryEmail: 'Secondary Email',
    phone: 'Phone',
    address: 'Address',
  };

  // Additional fields with custom rendering
  const additionalFields = [
    {
      title: 'Supplier Trade Name',
      dataIndex: 'tradeName',
    },
    {
      title: 'Legal Name',
      dataIndex: 'legalName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Secondary Email',
      dataIndex: 'secondaryEmail',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },    {
      key: 'paymentTerms',
      label: 'Payment Terms',
      render: (paymentTerms) => {
        const terms = {
          '30': '30 days',
          '45': '45 days',
          '60': '60 days',
          'immediate': 'Immediate payment',
          'prepaid': 'Prepaid',
          'partial': 'Partial prepayment',
        };
        return terms[paymentTerms] || paymentTerms;
      }
    },
    {
      key: 'supplierType',
      label: 'Supplier Type',
      render: (supplierType) => {
        return supplierType === 'strategic' ? 'Strategic' : 'Transactional';
      }
    },
    {
      key: 'complianceChecked',
      label: 'Compliance Checked',
      render: (complianceChecked) => {
        return complianceChecked ? 'Yes' : 'No';
      }
    },
    {
      key: 'comments',
      label: 'Comments'
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
