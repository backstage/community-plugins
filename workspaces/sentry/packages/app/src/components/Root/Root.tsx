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
import { PropsWithChildren } from 'react';
import {
  RiHome2Line,
  RiPlugLine,
  RiBook2Line,
  RiAddCircleLine,
  RiMenuLine,
  RiSearchLine,
} from 'remixicon-react';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarSpace,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import styles from './Root.module.css';

const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={styles.root}>
      <Link to="/" underline="none" className={styles.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<RiSearchLine />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<RiMenuLine />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={RiHome2Line} to="catalog" text="Home" />
        <SidebarItem icon={RiPlugLine} to="api-docs" text="APIs" />
        <SidebarItem icon={RiBook2Line} to="docs" text="Docs" />
        <SidebarItem icon={RiAddCircleLine} to="create" text="Create..." />
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
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
