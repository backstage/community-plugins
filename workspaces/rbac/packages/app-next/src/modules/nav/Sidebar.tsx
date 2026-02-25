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
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { compatWrapper } from '@backstage/core-compat-api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  NavContentBlueprint,
  type IconComponent,
  type RouteRef,
} from '@backstage/frontend-plugin-api';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import MenuIcon from '@material-ui/icons/Menu';
import { useEffect, useMemo, useState } from 'react';
import { Administration } from '@backstage-community/plugin-rbac/alpha';
import { rbacApiRef } from '@backstage-community/plugin-rbac';

import { SidebarLogo } from './SidebarLogo';

type NavItem = {
  icon: IconComponent;
  title: string;
  routeRef: RouteRef<undefined>;
  to: string;
  text: string;
};

function SidebarNavContent({ items }: { items: NavItem[] }) {
  const configApi = useApi(configApiRef);
  const isRBACPluginEnabled =
    configApi.getOptionalBoolean('permission.enabled') ?? false;

  const rbacApi = useApi(rbacApiRef);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userAuth, setUserAuth] = useState<{ status?: string } | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsUserLoading(true);
      try {
        const result = await rbacApi.getUserAuthorization();
        if (!cancelled) {
          setUserAuth(result);
        }
      } catch {
        if (!cancelled) {
          setUserAuth(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsUserLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [rbacApi]);

  const shouldShowRbac =
    isRBACPluginEnabled && !isUserLoading && userAuth?.status === 'Authorized';

  const filteredItems = useMemo(() => {
    if (shouldShowRbac) {
      return items;
    }

    return items.filter(item => {
      const to = item.to.toLowerCase();
      const text = item.text.toLowerCase();
      const title = item.title.toLowerCase();
      return !(
        to === '/rbac' ||
        to === 'rbac' ||
        text === 'rbac' ||
        title === 'rbac'
      );
    });
  }, [items, shouldShowRbac]);

  return compatWrapper(
    <Sidebar>
      <SidebarLogo />
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        <SidebarScrollWrapper>
          {filteredItems
            .filter(item => item.to !== '/settings')
            .map((item, index) => (
              <SidebarItem {...item} key={index} />
            ))}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <Administration />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>,
  );
}

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: SidebarNavContent,
  },
});
