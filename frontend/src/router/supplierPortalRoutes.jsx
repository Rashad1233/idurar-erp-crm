import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

// Supplier Portal Components
const SupplierContractAcceptance = lazyWithErrorHandling(() => 
  import('@/pages/SupplierPortal/ContractAcceptance')
);

const SupplierRFQResponse = lazyWithErrorHandling(() => 
  import('@/pages/SupplierPortal/RFQResponse')
);

const supplierPortalRoutes = [
  {
    path: '/supplier-portal/contract-acceptance/:contractId',
    element: <SupplierContractAcceptance />,
  },
  {
    path: '/supplier-portal/rfq/:token',
    element: <SupplierRFQResponse />,
  },
];

export default supplierPortalRoutes;