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
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Settings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import ExtensionIcon from '@material-ui/icons/Extension';
import HomeIcon from '@material-ui/icons/Home';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';

export const navigationExtension = createExtension({
  namespace: 'app',
  name: 'nav',
  attachTo: { id: 'app/layout', input: 'nav' },
  output: {
    element: coreExtensionData.reactElement,
  },
  factory() {
    return {
      element: compatWrapper(
        <Sidebar>
          <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
            <SidebarSearchModal />
          </SidebarGroup>
          <SidebarDivider />
          <SidebarGroup label="Menu" icon={<MenuIcon />}>
            {/* Global nav, not org-specific */}
            <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
            <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
            <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
            <SidebarItem
              icon={CreateComponentIcon}
              to="create"
              text="Create..."
            />
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
    };
  },
});
