import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'report-portal',
});

export const projectsRouteRef = createSubRouteRef({
  id: 'report-portal:projects',
  path: '/instance',
  parent: rootRouteRef,
});

export const launchRouteRef = createSubRouteRef({
  id: 'report-portal:launches',
  path: '/instance/project',
  parent: rootRouteRef,
});

export const entityRootRouteRef = createRouteRef({
  id: 'report-portal:entity-page',
  params: ['namespace', 'kind', 'name'],
});
