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
import { Route } from 'react-router-dom';
import {
  PlaylistIndexPage,
  PlaylistPage,
  EntityPlaylistDialog,
} from '@backstage-community/plugin-playlist';
import { FlatRoutes } from '@backstage/core-app-api';
import { convertLegacyAppRoot } from '@backstage/core-compat-api';
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  dialogApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';

import {
  sidebarConfig,
  useSidebarOpenState,
  Link,
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarSpace,
} from '@backstage/core-components';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import MenuIcon from '@material-ui/icons/Menu';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core';
import LogoFull from './components/Root/LogoFull';
import LogoIcon from './components/Root/LogoIcon';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();
  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

const appModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    NavContentBlueprint.make({
      params: {
        component: ({ navItems }) => {
          const nav = navItems.withComponent(item => (
            <SidebarItem
              icon={() => item.icon}
              to={item.href}
              text={item.title}
            />
          ));
          return (
            <Sidebar>
              <SidebarLogo />
              <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
                <SidebarSearchModal />
              </SidebarGroup>
              <SidebarDivider />
              <SidebarGroup label="Menu" icon={<MenuIcon />}>
                {nav.take('page:catalog')}
                <SidebarDivider />
                <SidebarItem
                  icon={PlaylistPlayIcon}
                  to="playlist"
                  text="Playlists"
                />
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
            </Sidebar>
          );
        },
      },
    }),
    EntityContextMenuItemBlueprint.make({
      name: 'add-to-playlist',
      params: {
        icon: <PlaylistAddIcon />,
        useProps: () => {
          const dialogApi = useApi(dialogApiRef);
          const { entity } = useAsyncEntity();

          return {
            title: 'Add to playlist',
            onClick: () => {
              dialogApi.open(({ dialog }) => (
                <EntityPlaylistDialog
                  open
                  onClose={() => dialog.close()}
                  entity={entity}
                />
              ));
            },
          };
        },
      },
    }),
  ],
});

const routes = (
  <FlatRoutes>
    <Route path="/playlist" element={<PlaylistIndexPage />} />
    <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
  </FlatRoutes>
);

// convertLegacyAppRoot still needed for playlist routes (no alpha export yet)
const legacyRoot = convertLegacyAppRoot(routes);

export default createApp({
  features: [appModule, ...legacyRoot],
});
