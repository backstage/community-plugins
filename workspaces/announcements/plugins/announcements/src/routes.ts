import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'announcements',
});

export const announcementCreateRouteRef = createSubRouteRef({
  id: 'announcements/create',
  path: '/create',
  parent: rootRouteRef,
});

export const announcementEditRouteRef = createSubRouteRef({
  id: 'announcements/edit',
  path: '/edit/:id',
  parent: rootRouteRef,
});

export const announcementViewRouteRef = createSubRouteRef({
  id: 'announcements/view',
  path: '/view/:id',
  parent: rootRouteRef,
});

export const categoriesListRouteRef = createSubRouteRef({
  id: 'announcements/categories',
  path: '/categories',
  parent: rootRouteRef,
});
