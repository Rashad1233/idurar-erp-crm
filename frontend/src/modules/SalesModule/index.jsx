import React from 'react';
import POSModule from './POSModule';
import SalesOrderDataTableModule from './SalesOrderDataTableModule';
import CustomerDataTableModule from './CustomerDataTableModule';

const SalesModule = () => {
  return {
    pos: POSModule,
    salesOrders: SalesOrderDataTableModule,
    customers: CustomerDataTableModule
  };
};

export default SalesModule;