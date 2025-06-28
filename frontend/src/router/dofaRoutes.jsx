import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const DofaManagement = lazyWithErrorHandling(() => import('@/pages/Dofa/index'));
const ContractsReview = lazyWithErrorHandling(() => import('@/pages/Dofa/ContractsReview'));
const SuppliersReview = lazyWithErrorHandling(() => import('@/pages/Dofa/SuppliersReview'));
const RFQReview = lazyWithErrorHandling(() => import('@/pages/Dofa/RFQReview'));
const POApprovals = lazyWithErrorHandling(() => import('@/pages/Dofa/POApprovals'));
const ApprovalWorkflows = lazyWithErrorHandling(() => import('@/pages/Dofa/ApprovalWorkflows'));
const EmailTemplates = lazyWithErrorHandling(() => import('@/pages/Dofa/EmailTemplates'));

// DoFA routes
const dofaRoutes = [
  {
    path: '/dofa',
    element: <DofaManagement />,
  },
  {
    path: '/dofa/contracts/review',
    element: <ContractsReview />,
  },
  {
    path: '/dofa/suppliers/review',
    element: <SuppliersReview />,
  },
  {
    path: '/dofa/rfq/review',
    element: <RFQReview />,
  },
  {
    path: '/dofa/po/approvals',
    element: <POApprovals />,
  },
  {
    path: '/dofa/workflows/manage',
    element: <ApprovalWorkflows />,
  },
  {
    path: '/dofa/email/templates',
    element: <EmailTemplates />,
  }
];

export default dofaRoutes;
