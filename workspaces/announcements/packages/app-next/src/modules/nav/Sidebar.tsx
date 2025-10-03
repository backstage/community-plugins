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
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { compatWrapper } from '@backstage/core-compat-api';
import { Sidebar } from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/frontend-plugin-api';
import { SidebarLogo } from './SidebarLogo';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AdminPanelSettingsIcon from '@material-ui/icons/SupervisorAccount';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';
import {
  UserSettingsSignInAvatar,
  Settings as SidebarSettings,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ items }) =>
      compatWrapper(
        <Sidebar>
          <SidebarLogo />
          <SidebarDivider />
          <SidebarItem icon={HomeIcon} to="/" text="Home" />
          <SidebarItem
            icon={AdminPanelSettingsIcon}
            to="announcements/admin"
            text="Admin"
          />

          <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
            <SidebarSearchModal />
          </SidebarGroup>
          <SidebarGroup label="Menu" icon={<MenuIcon />}>
            <SidebarScrollWrapper>
              {/* Items in this group will be scrollable if they run out of space */}
              {items.map((item, index) => (
                <SidebarItem {...item} key={index} />
              ))}
            </SidebarScrollWrapper>

            <NotificationsSidebarItem />
          </SidebarGroup>
          <SidebarSpace />
          <SidebarDivider />
          <SidebarGroup
            label="Settings"
            icon={<UserSettingsSignInAvatar />}
            to="/settings"
          >
            <SidebarSettings />
          </SidebarGroup>
        </Sidebar>,
      ),
  },
});
