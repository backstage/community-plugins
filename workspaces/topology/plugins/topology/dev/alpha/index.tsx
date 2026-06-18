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
import '@backstage/ui/css/styles.css';

import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import useObservable from 'react-use/esm/useObservable';
import { Box, MenuItem, MenuSection, Popover } from '@backstage/ui';
import { RiContrastLine } from '@remixicon/react';
import { Menu } from 'react-aria-components';
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
import {
  cloneElement,
  MouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react';

function ThemeMenuIcon({
  active,
  icon,
}: {
  active?: boolean;
  icon?: ReactElement;
}) {
  if (icon) {
    return cloneElement(icon, {
      fontSize: 'small',
      color: active ? 'primary' : undefined,
    });
  }

  return (
    <RiContrastLine
      size={20}
      color={active ? 'var(--bui-fg-accent)' : undefined}
    />
  );
}

function getThemeLabel(title: ReactNode, fallback: string): string {
  return typeof title === 'string' ? title : fallback;
}

function SidebarThemeSwitcher() {
  const appThemeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const themes = appThemeApi.getInstalledThemes();
  const activeTheme = themes.find(t => t.id === themeId);
  const anchorRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleSelectTheme = (newThemeId?: string) => {
    if (newThemeId && themes.some(t => t.id === newThemeId)) {
      appThemeApi.setActiveThemeId(newThemeId);
    } else {
      appThemeApi.setActiveThemeId(undefined);
    }
    setOpen(false);
  };

  const ActiveIcon = useCallback(
    () => <ThemeMenuIcon icon={activeTheme?.icon} />,
    [activeTheme],
  );

  return (
    <>
      <SidebarItem
        icon={ActiveIcon}
        text="Switch Theme"
        onClick={(event: MouseEvent) => {
          anchorRef.current = event.currentTarget as HTMLElement;
          setOpen(isOpen => !isOpen);
        }}
      />
      <Popover
        triggerRef={anchorRef}
        isOpen={open}
        onOpenChange={setOpen}
        placement="right bottom"
        hideArrow
      >
        <Box bg="neutral">
          <Menu>
            <MenuSection title="Choose a theme">
              <MenuItem
                id="auto"
                textValue="Auto"
                iconStart={<ThemeMenuIcon active={themeId === undefined} />}
                onAction={() => handleSelectTheme(undefined)}
              >
                Auto
              </MenuItem>
              {themes.map(theme => {
                const active = theme.id === themeId;
                const label = getThemeLabel(theme.title, theme.id);
                return (
                  <MenuItem
                    key={theme.id}
                    id={theme.id}
                    textValue={label}
                    iconStart={
                      <ThemeMenuIcon icon={theme.icon} active={active} />
                    }
                    onAction={() => handleSelectTheme(theme.id)}
                  >
                    {label}
                  </MenuItem>
                );
              })}
            </MenuSection>
          </Menu>
        </Box>
      </Popover>
    </>
  );
}

const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));
      return (
        <Sidebar>
          <SidebarGroup label="Menu">
            <SidebarScrollWrapper>
              {nav.take('page:catalog')}
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
