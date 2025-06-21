import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const Warehouse = lazyWithErrorHandling(() => import('@/pages/Warehouse'));
const WarehouseCreate = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseCreate'));
const WarehouseRead = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseRead'));
const WarehouseTransaction = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseTransaction'));
const WarehouseLocations = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseLocations'));
const StorageLocationCreate = lazyWithErrorHandling(() => import('@/pages/Warehouse/StorageLocationCreate'));
const StorageLocationEdit = lazyWithErrorHandling(() => import('@/pages/Warehouse/StorageLocationEdit'));
const StorageLocationRead = lazyWithErrorHandling(() => import('@/pages/Warehouse/StorageLocationRead'));
const BinLocationCreate = lazyWithErrorHandling(() => import('@/pages/Warehouse/BinLocationCreate'));
const BinLocationEdit = lazyWithErrorHandling(() => import('@/pages/Warehouse/BinLocationEdit'));
const BinLocationRead = lazyWithErrorHandling(() => import('@/pages/Warehouse/BinLocationRead'));

const warehouseRoutes = [
  {
    path: '/warehouse',
    element: <Warehouse />,
  },
  {
    path: '/warehouse/create',
    element: <WarehouseCreate />,
  },
  {
    path: '/warehouse/read/:id',
    element: <WarehouseRead />,
  },
  {
    path: '/warehouse/transaction',
    element: <WarehouseTransaction />,
  },
  {
    path: '/warehouse/locations',
    element: <WarehouseLocations />,
  },
  {
    path: '/warehouse/location/create',
    element: <StorageLocationCreate />,
  },
  {
    path: '/warehouse/location/edit/:id',
    element: <StorageLocationEdit />,
  },
  {
    path: '/warehouse/bin/create',
    element: <BinLocationCreate />,
  },  {
    path: '/warehouse/bin/edit/:id',
    element: <BinLocationEdit />,
  },  // Routes for reading storage and bin locations
  {
    path: '/warehouse/location/read/:id',
    element: <StorageLocationRead />,
  },
  {
    path: '/warehouse/bin/read/:id',
    element: <BinLocationRead />,
  },
];

export default warehouseRoutes;
