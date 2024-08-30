import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'ros.page.optimizations',
});

export const optimizationsBreakdownRouteRef = createSubRouteRef({
  id: 'ros.page.breakdown',
  parent: rootRouteRef,
  path: '/:id/*',
});
