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

export const announcementAdminRouteRef = createSubRouteRef({
  id: 'announcements/admin',
  path: '/admin',
  parent: rootRouteRef,
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

export const tagsListRouteRef = createSubRouteRef({
  id: 'announcements/tags',
  path: '/tags',
  parent: rootRouteRef,
});
