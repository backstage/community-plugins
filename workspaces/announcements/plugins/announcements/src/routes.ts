/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

/**
 * The root route for the announcements plugin
 */
export const rootRouteRef = createRouteRef({
  id: 'announcements',
});

/**
 * The route for viewing a single announcement
 */
export const announcementViewRouteRef = createSubRouteRef({
  id: 'announcements/view',
  path: '/view/:id',
  parent: rootRouteRef,
});

/**
 * The route for the admin portal, defaulting to the announcements tab
 */
export const announcementAdminRouteRef = createSubRouteRef({
  id: 'announcements/admin',
  path: '/admin',
  parent: rootRouteRef,
});

/**
 * The route for the categories tab in the admin portal
 */
export const adminCategoriesRouteRef = createSubRouteRef({
  id: 'announcements-admin-categories',
  path: '/admin/categories',
  parent: rootRouteRef,
});

/**
 * The route for the tags tab in the admin portal
 */
export const adminTagsRouteRef = createSubRouteRef({
  id: 'announcements-admin-tags',
  path: '/admin/tags',
  parent: rootRouteRef,
});
