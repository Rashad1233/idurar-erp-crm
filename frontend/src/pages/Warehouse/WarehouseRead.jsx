import React from 'react';
import { useParams } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';

export default function WarehouseRead() {
  const { id } = useParams();
  
  const ENTITY = 'warehouse';

  const config = {
    entity: ENTITY,
    entityDisplayLabels: ['code', 'name'],
  };

  const readColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];

  return (
    <ErpLayout>
      <ReadItem config={config} id={id} readColumns={readColumns} />
    </ErpLayout>
  );
}
