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
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  IconComponent,
  identityApiRef,
} from '@backstage/core-plugin-api';

import HubOutlinedIcon from '@mui/icons-material/HubOutlined';

import { OcmApiClient, OcmApiRef } from './api';
import { rootRouteRef } from './routes';

export const ocmPlugin = createPlugin({
  id: 'ocm',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: OcmApiRef,
      deps: {
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new OcmApiClient({ configApi, identityApi }),
    }),
  ],
});

export const OcmPage = ocmPlugin.provide(
  createRoutableExtension({
    name: 'OcmPage',
    component: () =>
      import('./components/ClusterStatusPage').then(m => m.ClusterStatusPage),
    mountPoint: rootRouteRef,
  }),
);

export const OcmIcon = HubOutlinedIcon as IconComponent;
