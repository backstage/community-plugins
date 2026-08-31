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
  cloneElement,
  ReactElement,
  useCallback,
  useState,
  MouseEvent,
} from 'react';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import useObservable from 'react-use/esm/useObservable';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AutoIcon from '@mui/icons-material/BrightnessAuto';
import {
  SidebarLanguageSwitcher,
  SidebarSignOutButton,
} from '@backstage/dev-utils';

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

  const handleOpen = (event: MouseEvent<Element>) => {
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

export const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));
      return (
        <Sidebar>
          <SidebarGroup label="Menu">
            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <SidebarThemeSwitcher />
          <SidebarLanguageSwitcher />
          <SidebarSignOutButton />
        </Sidebar>
      );
    },
  },
});
