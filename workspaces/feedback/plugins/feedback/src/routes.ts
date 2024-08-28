import {
  createExternalRouteRef,
  createRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'feedback:global-page',
});

export const viewDocsRouteRef = createExternalRouteRef({
  id: 'view-docs',
});

export const entityRootRouteRef = createRouteRef({
  id: 'feedback:entity-page',
  params: ['namespace', 'kind', 'name'],
});
