import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const ThreeWayMatching = lazyWithErrorHandling(() => import('@/pages/Finance/ThreeWayMatching'));
const FinancialReporting = lazyWithErrorHandling(() => import('@/pages/Finance/FinancialReporting'));
const FinancialAudit = lazyWithErrorHandling(() => import('@/pages/Finance/FinancialAudit'));

// Add the routes to the finance module
const financeRoutes = [
  // Three-Way Matching routes
  {
    path: '/finance/three-way-matching',
    element: <ThreeWayMatching />,
  },
  {
    path: '/finance/reporting',
    element: <FinancialReporting />,
  },
  {
    path: '/finance/audit',
    element: <FinancialAudit />,
  }
];

export default financeRoutes;
