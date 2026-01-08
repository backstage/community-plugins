/*
 * Copyright 2025 The Backstage Authors
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
import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { createManageApiFactory } from '@backstage-community/plugin-manage-react';

import { rootRouteRef } from './routes';

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const managePlugin = createPlugin({
  id: 'manage',
  routes: {
    root: rootRouteRef,
  },
  apis: [createManageApiFactory()],
});

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const ManagePage = managePlugin.provide(
  createRoutableExtension({
    name: 'ManagePage',
    component: () =>
      import('./components/ManagePage').then(m => m.ManagePageImpl),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const ManageTabs = managePlugin.provide(
  createComponentExtension({
    name: 'ManageTabs',
    component: {
      lazy: () => import('./components/ManageTabs').then(m => m.ManageTabsImpl),
    },
  }),
);

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const OrganizationGraph = managePlugin.provide(
  createComponentExtension({
    name: 'OrganizationGraph',
    component: {
      lazy: () =>
        import('./components/OrganizationGraph').then(
          m => m.OrganizationGraphImpl,
        ),
    },
  }),
);

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const DefaultSettings = managePlugin.provide(
  createComponentExtension({
    name: 'DefaultSettings',
    component: {
      lazy: () => import('./components/Settings').then(m => m.DefaultSettings),
    },
  }),
);

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const KindOrderCard = managePlugin.provide(
  createComponentExtension({
    name: 'KindOrderCard',
    component: {
      lazy: () => import('./components/Settings').then(m => m.KindOrderCard),
    },
  }),
);

/**
 * @deprecated Use the new frontend system instead
 * @public
 */
export const TabOrderCard = managePlugin.provide(
  createComponentExtension({
    name: 'TabOrderCard',
    component: {
      lazy: () => import('./components/Settings').then(m => m.TabOrderCard),
    },
  }),
);
