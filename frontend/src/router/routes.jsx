import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

import { Navigate } from 'react-router-dom';

import procurementRoutes from './procurementRoutes';
import supplierRoutes from './supplierRoutes';
import supplierPortalRoutes from './supplierPortalRoutes';
import inventoryRoutes from './inventoryRoutes';
import warehouseRoutes from './warehouseRoutes';
import financeRoutes from './financeRoutes';
import dofaRoutes from './dofaRoutes';
import salesRoutes from './salesRoutes';

const Logout = lazyWithErrorHandling(() => import('@/pages/Logout.jsx'));
const NotFound = lazyWithErrorHandling(() => import('@/pages/NotFound.jsx'));
const SupplierAcceptance = lazyWithErrorHandling(() => import('@/pages/SupplierAcceptance.jsx'));

const Dashboard = lazyWithErrorHandling(() => import('@/pages/Dashboard'));
const Customer = lazyWithErrorHandling(() => import('@/pages/Customer'));
const CustomerCreate = lazyWithErrorHandling(() => import('@/pages/Customer/CustomerCreate'));
const CustomerRead = lazyWithErrorHandling(() => import('@/pages/Customer/CustomerRead'));
const CustomerUpdate = lazyWithErrorHandling(() => import('@/pages/Customer/CustomerUpdate'));
const Invoice = lazyWithErrorHandling(() => import('@/pages/Invoice'));
const InvoiceCreate = lazyWithErrorHandling(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazyWithErrorHandling(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazyWithErrorHandling(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazyWithErrorHandling(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Quote = lazyWithErrorHandling(() => import('@/pages/Quote/index'));
const QuoteCreate = lazyWithErrorHandling(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazyWithErrorHandling(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazyWithErrorHandling(() => import('@/pages/Quote/QuoteUpdate'));
const Payment = lazyWithErrorHandling(() => import('@/pages/Payment/index'));
const PaymentRead = lazyWithErrorHandling(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazyWithErrorHandling(() => import('@/pages/Payment/PaymentUpdate'));

const Settings = lazyWithErrorHandling(() => import('@/pages/Settings/Settings'));
const PaymentMode = lazyWithErrorHandling(() => import('@/pages/PaymentMode'));
const PaymentModeCreate = lazyWithErrorHandling(() => import('@/pages/PaymentMode/PaymentModeCreate'));
const PaymentModeRead = lazyWithErrorHandling(() => import('@/pages/PaymentMode/PaymentModeRead'));
const PaymentModeUpdate = lazyWithErrorHandling(() => import('@/pages/PaymentMode/PaymentModeUpdate'));
const Taxes = lazyWithErrorHandling(() => import('@/pages/Taxes'));
const TaxesCreate = lazyWithErrorHandling(() => import('@/pages/Taxes/TaxesCreate'));
const TaxesRead = lazyWithErrorHandling(() => import('@/pages/Taxes/TaxesRead'));
const TaxesUpdate = lazyWithErrorHandling(() => import('@/pages/Taxes/TaxesUpdate'));

const Profile = lazyWithErrorHandling(() => import('@/pages/Profile'));

const About = lazyWithErrorHandling(() => import('@/pages/About'));

let routes = {
  expense: [],  default: [
    ...dofaRoutes,
    ...procurementRoutes,
    ...supplierRoutes,
    ...supplierPortalRoutes,
    ...inventoryRoutes,
    ...warehouseRoutes,
    ...financeRoutes,
    ...salesRoutes,
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/supplier-acceptance/:token',
      element: <SupplierAcceptance />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/customer/create',
      element: <CustomerCreate />,
    },
    {
      path: '/customer/read/:id',
      element: <CustomerRead />,
    },
    {
      path: '/customer/update/:id',
      element: <CustomerUpdate />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/payment/mode/create',
      element: <PaymentModeCreate />,
    },
    {
      path: '/payment/mode/read/:id',
      element: <PaymentModeRead />,
    },
    {
      path: '/payment/mode/update/:id',
      element: <PaymentModeUpdate />,
    },    {
      path: '/taxes',
      element: <Taxes />,
    },
    {
      path: '/taxes/create',
      element: <TaxesCreate />,
    },
    {
      path: '/taxes/read/:id',
      element: <TaxesRead />,
    },
    {
      path: '/taxes/update/:id',
      element: <TaxesUpdate />,
    },

    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
