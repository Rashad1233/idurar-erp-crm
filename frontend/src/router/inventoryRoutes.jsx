import React from 'react';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const ItemMaster = lazyWithErrorHandling(() => import('@/pages/ItemMaster'));
const EnhancedItemMaster = lazyWithErrorHandling(() => import('@/pages/ItemMaster/EnhancedItemMaster'));
const ItemMasterCreate = lazyWithErrorHandling(() => import('@/pages/ItemMaster/ItemMasterCreate'));
const ItemMasterRead = lazyWithErrorHandling(() => import('@/pages/ItemMaster/ItemMasterRead'));
const ItemMasterUpdate = lazyWithErrorHandling(() => import('@/pages/ItemMaster/ItemMasterUpdate'));
const ItemMasterReviewDashboard = lazyWithErrorHandling(() => import('@/pages/ItemMaster/ItemMasterReviewDashboard'));

const UnspscEnhancedSearch = lazyWithErrorHandling(() => import('@/pages/Unspsc/UnspscEnhancedSearch'));

const Inventory = lazyWithErrorHandling(() => import('@/pages/Inventory'));
const InventoryCreate = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryCreate'));
const EnhancedInventoryCreate = lazyWithErrorHandling(() => import('@/pages/Inventory/EnhancedInventoryCreate'));
const InventoryRead = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryRead'));
const InventoryUpdate = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryUpdate'));
const InventoryReorder = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryReorder'));
const InventoryReporting = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryReporting'));
const EnhancedInventoryReporting = lazyWithErrorHandling(() => import('@/pages/Inventory/EnhancedInventoryReporting'));
const AssetMaintenance = lazyWithErrorHandling(() => import('@/pages/Inventory/AssetMaintenance'));

const Warehouse = lazyWithErrorHandling(() => import('@/pages/Warehouse'));
const WarehouseCreate = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseCreate'));
const WarehouseRead = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseRead'));
const WarehouseTransaction = lazyWithErrorHandling(() => import('@/pages/Warehouse/WarehouseTransaction'));

// Add the routes to the inventory module
const inventoryRoutes = [  // Item Master routes
  {
    path: '/item-master',
    element: <EnhancedItemMaster />,
  },
  {
    path: '/item-master/review',
    element: <ItemMasterReviewDashboard />,
  },
  {
    path: '/item-master/create',
    element: <ItemMasterCreate />,
  },
  {
    path: '/item-master/create-new',
    element: <ItemMasterCreate />,
  },
  {
    path: '/item/create-new-item-master',
    element: <ItemMasterCreate />,
  },
  {
    path: '/item-master/new',
    element: <ItemMasterCreate />,
  },
  {
    path: '/item-master/read/:id',
    element: <ItemMasterRead />,
  },  {
    path: '/item-master/update/:id',
    element: <ItemMasterUpdate />,
  },
  
  // UNSPSC routes
  {
    path: '/unspsc-enhanced-search',
    element: <UnspscEnhancedSearch />,
  },
  
  // Inventory routes
  {
    path: '/inventory',
    element: <Inventory />,
  },  {
    path: '/inventory/create',
    element: <InventoryCreate />,
  },
  {
    path: '/inventory/create-item',
    element: <EnhancedInventoryCreate />,
  },  {
    path: '/inventory/:id',
    element: <InventoryRead />,
  },
  {
    path: '/inventory/:id/update',
    element: <InventoryUpdate />,
  },
  {
    path: '/inventory/reorder',
    element: <InventoryReorder />,
  },
  
  // Warehouse routes
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
  },  {
    path: '/warehouse/transaction',
    element: <WarehouseTransaction />,
  },
    // Additional inventory routes
  {
    path: '/inventory/reporting',
    element: <EnhancedInventoryReporting />,
  },
  {
    path: '/inventory/maintenance',
    element: <AssetMaintenance />,
  },  {
    path: '/item/create',
    element: <ItemMasterCreate />,
  },  {
    path: '/item/create-new-item-master',
    element: <ItemMasterCreate />,
  },
  {
    path: '/item/read/:id',
    element: <ItemMasterRead />,
  },
  {
    path: '/item/update/:id',
    element: <ItemMasterUpdate />,
  },
];

export default inventoryRoutes;
