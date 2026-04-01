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
  IconComponent,
  NavItemBlueprint,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';
import { RiMegaphoneLine } from '@remixicon/react';
/**
 * Sidebar navigation item linking to the announcements page.
 *
 * @remarks
 * Extension ID: `nav-item:announcements`
 *
 * @alpha
 */
export const announcementsNavItem = NavItemBlueprint.make({
  params: {
    title: 'Announcements',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    icon: RiMegaphoneLine as IconComponent,
  },
});

export default [announcementsNavItem];
