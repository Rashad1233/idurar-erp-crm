import React from 'react';
import { Route } from 'react-router-dom';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

import ProtectedRoute from '@/components/ProtectedRoute';

const InventoryIndex = lazyWithErrorHandling(() => import('@/pages/Inventory/index'));
const InventoryCreate = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryCreate'));
const InventoryReorder = lazyWithErrorHandling(() => import('@/pages/Inventory/InventoryReorder'));
const InventorySearch = lazyWithErrorHandling(() => import('@/pages/Inventory/InventorySearch'));

export default function InventoryRoutes() {
  return (
    <>
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryIndex />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/create"
        element={
          <ProtectedRoute>
            <InventoryCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/reorder"
        element={
          <ProtectedRoute>
            <InventoryReorder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/search"
        element={
          <ProtectedRoute>
            <InventorySearch />
          </ProtectedRoute>
        }
      />
    </>
  );
}
