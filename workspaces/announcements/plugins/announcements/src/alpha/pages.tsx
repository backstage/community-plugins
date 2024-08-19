import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { createPageExtension } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const announcementsPage = createPageExtension({
  defaultPath: '/announcements',
  routeRef: convertLegacyRouteRef(rootRouteRef),
  loader: async () => {
    const { Router } = await import('../components/Router');
    return <Router />;
  },
});
