import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const Supplier = lazyWithErrorHandling(() => import('@/pages/Supplier'));
const SupplierCreate = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierCreate'));
const SupplierRead = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierRead'));
const SupplierUpdate = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierUpdate'));

// Add the routes to the supplier module
const supplierRoutes = [
  {
    path: '/supplier',
    element: <Supplier />,
  },
  {
    path: '/supplier/create',
    element: <SupplierCreate />,
  },
  {
    path: '/supplier/read/:id',
    element: <SupplierRead />,
  },
  {
    path: '/supplier/update/:id',
    element: <SupplierUpdate />,
  },
];

export default supplierRoutes;
