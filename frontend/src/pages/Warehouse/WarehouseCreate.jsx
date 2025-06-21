import React from 'react';
import { useLocation } from 'react-router-dom';

import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import WarehouseForm from '@/forms/WarehouseForm';

export default function WarehouseCreate() {
  const ENTITY = 'warehouse';
  const location = useLocation();
  
  // Determine the form type based on the URL path
  const isLocationForm = location.pathname.includes('/location/');
  const isBinForm = location.pathname.includes('/bin/');
  
  const formType = isBinForm ? 'bin' : 'location';
  
  const configPage = {
    entity: ENTITY,
    title: isBinForm ? 'New Bin Location' : 'New Storage Location',
    subTitle: isBinForm ? 'Create a new bin location' : 'Create a new storage location',
  };

  return (
    <ErpLayout>
      <CreateItem
        config={configPage}
        CreateForm={(props) => <WarehouseForm {...props} type={formType} />}
      />
    </ErpLayout>
  );
}
