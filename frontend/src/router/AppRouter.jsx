import { useEffect } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import { useAppContext } from '@/context/appContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import routes from './routes';

export default function AppRouter() {
  let location = useLocation();
  const { state: stateApp, appContextAction } = useAppContext();
  const { app } = appContextAction;

  const routesList = [];

  Object.entries(routes).forEach(([key, value]) => {
    routesList.push(...value);
  });

  function getAppNameByPath(path) {
    for (let key in routes) {
      for (let i = 0; i < routes[key].length; i++) {
        if (routes[key][i].path === path) {
          return key;
        }
      }
    }
    // Return 'default' app  if the path is not found
    return 'default';
  }
  useEffect(() => {
    if (location.pathname === '/') {
      app.default();
    } else {
      const path = getAppNameByPath(location.pathname);
      app.open(path);
    }  }, [location]);

  // Use useRoutes to generate the route components
  let element = useRoutes(routesList);

  // Return the routes directly without error boundary for now
  return element;
}
