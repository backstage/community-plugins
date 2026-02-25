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
  createFrontendPlugin,
  createSwappableComponent,
} from '@backstage/frontend-plugin-api';
import { createElement } from 'react';
import { createRoleRouteRef, roleRouteRef, rootRouteRef } from '../routes';
import { rbacPage } from './extensions';
import { licensedUsersApi, rbacApi } from './api';

const rbacPlugin = createFrontendPlugin({
  pluginId: 'rbac',
  info: { packageJson: () => import('../../package.json') },
  extensions: [rbacApi, licensedUsersApi, rbacPage],
  routes: {
    root: rootRouteRef,
    role: roleRouteRef,
    createRole: createRoleRouteRef,
  },
});

export default rbacPlugin;

export const Administration = createSwappableComponent({
  id: 'rbac.administration',
  loader: (): Promise<(props: {}) => JSX.Element | null> =>
    import('../components/Administration').then(
      m => _props => createElement(m.Administration),
    ),
});
