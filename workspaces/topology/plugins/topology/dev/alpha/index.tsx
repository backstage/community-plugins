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

/**
 * New Frontend System dev mode for the Topology plugin.
 */

import '@backstage/cli/asset-types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui';

import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import useObservable from 'react-use/esm/useObservable';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AutoIcon from '@mui/icons-material/BrightnessAuto';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import {
  SidebarLanguageSwitcher,
  SidebarSignOutButton,
} from '@backstage/dev-utils';

import {
  topologyCatalogModule,
  topologyTranslationsModule,
} from '../../src/alpha';
import { cloneElement, ReactElement, useCallback, useState } from 'react';

function ThemeIcon({
  active,
  icon,
}: {
  active?: boolean;
  icon?: ReactElement;
}) {
  return icon ? (
    cloneElement(icon, { color: active ? 'primary' : undefined })
  ) : (
    <AutoIcon color={active ? 'primary' : undefined} />
  );
}

function SidebarThemeSwitcher() {
  const appThemeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const themes = appThemeApi.getInstalledThemes();
  const activeTheme = themes.find(t => t.id === themeId);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<Element>) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleSelectTheme = (newThemeId?: string) => {
    if (newThemeId && themes.some(t => t.id === newThemeId)) {
      appThemeApi.setActiveThemeId(newThemeId);
    } else {
      appThemeApi.setActiveThemeId(undefined);
    }
    setAnchorEl(undefined);
  };
  const handleClose = () => setAnchorEl(undefined);

  const ActiveIcon = useCallback(
    () => <ThemeIcon icon={activeTheme?.icon} />,
    [activeTheme],
  );

  return (
    <>
      <SidebarItem icon={ActiveIcon} text="Switch Theme" onClick={handleOpen} />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ role: 'listbox' }}
      >
        <MenuItem disabled>Choose a theme</MenuItem>
        <MenuItem
          selected={themeId === undefined}
          onClick={() => handleSelectTheme(undefined)}
        >
          <ListItemIcon>
            <ThemeIcon active={themeId === undefined} />
          </ListItemIcon>
          <ListItemText>Auto</ListItemText>
        </MenuItem>
        {themes.map(theme => {
          const active = theme.id === themeId;
          return (
            <MenuItem
              key={theme.id}
              selected={active}
              onClick={() => handleSelectTheme(theme.id)}
            >
              <ListItemIcon>
                <ThemeIcon icon={theme.icon} active={active} />
              </ListItemIcon>
              <ListItemText>{theme.title}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: props => (
      <Sidebar>
        <SidebarGroup label="Menu">
          <SidebarScrollWrapper>
            {props.navItems
              ? props.navItems
                  .rest()
                  .map((item, index) => (
                    <SidebarItem
                      key={index}
                      icon={() => item.icon}
                      to={item.href}
                      text={item.title}
                    />
                  ))
              : (props as any).items?.map((item: any, index: number) => (
                  <SidebarItem key={index} {...item} />
                ))}
          </SidebarScrollWrapper>
        </SidebarGroup>
        <SidebarSpace />
        <SidebarThemeSwitcher />
        <SidebarLanguageSwitcher />
        <SidebarSignOutButton />
      </Sidebar>
    ),
  },
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    devSidebarContent,
    ApiBlueprint.make({
      name: 'plugin-header-actions',
      params: defineParams =>
        defineParams({
          api: pluginHeaderActionsApiRef,
          deps: {},
          factory: () => ({
            getPluginHeaderActions: () => [],
          }),
        }),
    }),
  ],
});

const app = createApp({
  features: [devNavModule, topologyCatalogModule, topologyTranslationsModule],
});

if (window.location.pathname === '/') {
  window.location.replace('/catalog');
}

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
