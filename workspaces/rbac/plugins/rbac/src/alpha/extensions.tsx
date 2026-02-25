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
import { compatWrapper } from '@backstage/core-compat-api';
import {
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import VpnKeyOutlined from '@mui/icons-material/VpnKeyOutlined';
import { rootRouteRef } from '../routes';

export const rbacNavItem = NavItemBlueprint.make({
  params: {
    routeRef: rootRouteRef,
    title: 'RBAC',
    icon: VpnKeyOutlined,
  },
});

export const rbacPage = PageBlueprint.make({
  params: {
    path: '/rbac',
    routeRef: rootRouteRef,
    loader: async () =>
      import('../components').then(m => compatWrapper(<m.Router />)),
  },
});
