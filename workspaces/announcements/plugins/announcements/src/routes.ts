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

export const rootRouteRef = createRouteRef({
  id: 'announcements',
});

export const announcementViewRouteRef = createSubRouteRef({
  id: 'announcements/view',
  path: '/view/:id',
  parent: rootRouteRef,
});

export const adminRouteRef = createSubRouteRef({
  id: 'announcements-admin',
  parent: rootRouteRef,
  path: '/admin',
});

export const adminAnnouncementsRouteRef = createSubRouteRef({
  id: 'announcements-admin-announcements',
  parent: rootRouteRef,
  path: '/admin/announcements',
});

export const adminCategoriesRouteRef = createSubRouteRef({
  id: 'announcements-admin-categories',
  parent: rootRouteRef,
  path: '/admin/categories',
});

export const adminTagsRouteRef = createSubRouteRef({
  id: 'announcements-admin-tags',
  parent: rootRouteRef,
  path: '/admin/tags',
});
