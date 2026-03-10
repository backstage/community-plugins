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

import { NavItemBlueprint } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from '../routes';
import { RbacIcon } from '..';

export const rbacNavItem = NavItemBlueprint.make({
  params: {
    title: 'RBAC',
    routeRef: rootRouteRef,
    // FIXME: improve icon type in Backstage 1.49, currently the icon type is deprecated but there is no change in the NavItemBlueprint!?
    icon: RbacIcon as any,
  },
});

export default rbacNavItem;
