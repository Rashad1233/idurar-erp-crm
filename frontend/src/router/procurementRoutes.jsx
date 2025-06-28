import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const PurchaseRequisition = lazyWithErrorHandling(() => import('@/pages/PurchaseRequisition'));
const PurchaseRequisitionCreate = lazyWithErrorHandling(() => import('@/pages/PurchaseRequisition/PurchaseRequisitionCreateSimple'));
const PurchaseRequisitionRead = lazyWithErrorHandling(() => import('@/pages/PurchaseRequisition/PurchaseRequisitionReadSimple'));
const PurchaseRequisitionApproval = lazyWithErrorHandling(() => import('@/pages/PurchaseRequisition/PurchaseRequisitionApproval'));

const RFQ = lazyWithErrorHandling(() => import('@/pages/RFQ'));
const RFQCreate = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQCreate'));
const RFQRead = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQRead'));
const RFQUpdate = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQUpdate'));
const RFQSend = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQSend'));
const RFQQuoteComparison = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQQuoteComparison'));
const RFQSupplierApproval = lazyWithErrorHandling(() => import('@/pages/RFQ/RFQSupplierApproval'));

const PurchaseOrder = lazyWithErrorHandling(() => import('@/pages/PurchaseOrder'));
const PurchaseOrderCreate = lazyWithErrorHandling(() => import('@/pages/PurchaseOrder/PurchaseOrderCreate'));
const PurchaseOrderRead = lazyWithErrorHandling(() => import('@/pages/PurchaseOrder/PurchaseOrderRead'));
const PurchaseOrderApproval = lazyWithErrorHandling(() => import('@/pages/PurchaseOrder/PurchaseOrderApproval'));

const Supplier = lazyWithErrorHandling(() => import('@/pages/Supplier'));
const SupplierCreate = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierCreate'));
const SupplierUpdate = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierUpdate'));
const SupplierRead = lazyWithErrorHandling(() => import('@/pages/Supplier/SupplierRead'));

const Contract = lazyWithErrorHandling(() => import('@/pages/Contract'));
const ContractCreate = lazyWithErrorHandling(() => import('@/pages/Contract/ContractCreate'));
const ContractRead = lazyWithErrorHandling(() => import('@/pages/Contract/ContractRead'));
const ContractApproval = lazyWithErrorHandling(() => import('@/pages/Contract/ContractApproval'));

// Add the routes to the procurement module
const procurementRoutes = [
  // Purchase Requisition routes
  {
    path: '/purchase-requisition',
    element: <PurchaseRequisition />,
  },
  {
    path: '/purchase-requisition/create',
    element: <PurchaseRequisitionCreate />,
  },
  {
    path: '/purchase-requisition/read/:id',
    element: <PurchaseRequisitionRead />,
  },
  {
    path: '/purchase-requisition/approval',
    element: <PurchaseRequisitionApproval />,
  },
  // RFQ routes
  {
    path: '/rfq',
    element: <RFQ />,
  },
  {
    path: '/rfq/create',
    element: <RFQCreate />,
  },  {
    path: '/rfq/read/:id',
    element: <RFQRead />,
  },
  {
    path: '/rfq/update/:id',
    element: <RFQUpdate />,
  },
  {
    path: '/rfq/send/:id',
    element: <RFQSend />,
  },
  {
    path: '/rfq/comparison/:id',
    element: <RFQQuoteComparison />,
  },
  {
    path: '/rfq/supplier-approval/:id/:supplierId?',
    element: <RFQSupplierApproval />,
  },
  // Purchase Order routes
  {
    path: '/purchase-order',
    element: <PurchaseOrder />,
  },
  {
    path: '/purchase-order/create',
    element: <PurchaseOrderCreate />,
  },
  {
    path: '/purchase-order/read/:id',
    element: <PurchaseOrderRead />,
  },
  {
    path: '/purchase-order/approval',
    element: <PurchaseOrderApproval />,
  },
  // Contract routes
  {
    path: '/contract',
    element: <Contract />,
  },
  {
    path: '/contract/create',
    element: <ContractCreate />,
  },
  {
    path: '/contract/read/:id',
    element: <ContractRead />,
  },  {
    path: '/contract/approval',
    element: <ContractApproval />,
  },
  // Supplier routes
  {
    path: '/supplier',
    element: <Supplier />,
  },
  {
    path: '/supplier/create',
    element: <SupplierCreate />,
  },
  {
    path: '/supplier/update/:id',
    element: <SupplierUpdate />,
  },
  {
    path: '/supplier/read/:id',
    element: <SupplierRead />,
  },
];

export default procurementRoutes;
