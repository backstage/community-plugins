/*
 * Copyright 2026 The Backstage Authors
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
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

import { default as RbacIcon } from '@mui/icons-material/VpnKeyOutlined';

import { rbacApi, licensedUsersApi } from './apis';
import { rootRouteRef } from './routes';

/**
 * RBAC page
 * @public
 */
export const rbacPage = PageBlueprint.make({
  params: {
    path: '/rbac',
    title: 'RBAC',
    icon: <RbacIcon />,
    routeRef: rootRouteRef,
    loader: async () => import('./components/Router').then(m => <m.Router />),
  },
});

/**
 * RBAC plugin
 * @public
 */
export const rbacPlugin = createFrontendPlugin({
  pluginId: 'rbac',
  info: { packageJson: () => import('../package.json') },
  extensions: [rbacApi, licensedUsersApi, rbacPage],
  routes: {
    root: rootRouteRef,
  },
});
