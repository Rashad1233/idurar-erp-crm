import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

// Sales page imports
const SalesIndex = lazyWithErrorHandling(() => import('@/pages/Sales'));
const POSPage = lazyWithErrorHandling(() => import('@/pages/Sales/POS'));
const SalesOrdersPage = lazyWithErrorHandling(() => import('@/pages/Sales/SalesOrders'));
const CustomersPage = lazyWithErrorHandling(() => import('@/pages/Sales/Customers'));

const salesRoutes = [
  {
    path: '/sales',
    element: <SalesIndex />,
  },
  {
    path: '/sales/pos',
    element: <POSPage />,
  },
  {
    path: '/sales/orders',
    element: <SalesOrdersPage />,
  },
  {
    path: '/sales/customers',
    element: <CustomersPage />,
  },
];

export default salesRoutes;