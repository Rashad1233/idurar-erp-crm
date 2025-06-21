import { lazy } from 'react';

/**
 * Simple pass-through to React.lazy - no custom wrappers that might cause issues
 */
export const lazyWithErrorHandling = (importFunction) => {
  return lazy(importFunction);
};
