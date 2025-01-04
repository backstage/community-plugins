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
import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const azureResourcesPlugin = createPlugin({
  id: 'azure-resources',
  routes: {
    root: rootRouteRef,
  },
});

export const AzureResourceEntityOverviewCard = azureResourcesPlugin.provide(
  createRoutableExtension({
    name: 'Azure overview',
    component: () =>
      import('./components/EntityAzureResourceCard').then(
        m => m.EntityAzureResourceOverviewCard,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntityAzureSecurityOverviewCard = azureResourcesPlugin.provide(
  createRoutableExtension({
    name: 'Security recommendations',
    component: () =>
      import('./components/EntityAzureResourceSecurityCard').then(
        m => m.EntityAzureSecurityCard,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const EntityAzureCostAdviceOverviewCard = azureResourcesPlugin.provide(
  createRoutableExtension({
    name: 'Cost advice recommendations',
    component: () =>
      import('./components/EntityAzureCostAdviceCard').then(
        m => m.EntityAzureCostAdviceCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
