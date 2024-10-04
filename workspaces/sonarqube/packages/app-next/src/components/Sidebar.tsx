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
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarSpace,
} from '@backstage/core-components';
import {
  coreExtensionData,
  createExtension,
} from '@backstage/frontend-plugin-api';
import {
  Settings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import ExtensionIcon from '@material-ui/icons/Extension';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';

export const navigationExtension = createExtension({
  namespace: 'app',
  name: 'nav',
  attachTo: { id: 'app/layout', input: 'nav' },
  output: [coreExtensionData.reactElement],
  factory() {
    return [
      coreExtensionData.reactElement(
        compatWrapper(
          <Sidebar>
            <SidebarDivider />
            <SidebarGroup label="Menu" icon={<MenuIcon />}>
              {/* Global nav, not org-specific */}
              <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
              <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
              {/* End global nav */}
              <SidebarDivider />
            </SidebarGroup>
            <SidebarSpace />
            <SidebarDivider />
            <SidebarGroup
              label="Settings"
              icon={<UserSettingsSignInAvatar />}
              to="/settings"
            >
              <Settings />
            </SidebarGroup>
          </Sidebar>,
        ),
      ),
    ];
  },
});
