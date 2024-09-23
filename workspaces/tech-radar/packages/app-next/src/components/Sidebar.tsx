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
  output: {
    element: coreExtensionData.reactElement,
  },
  factory() {
    return {
      element: compatWrapper(
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
    };
  },
});
