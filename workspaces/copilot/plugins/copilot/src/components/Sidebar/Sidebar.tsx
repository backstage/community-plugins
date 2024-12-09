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
import React from 'react';
import {
  SidebarItem,
  SidebarSubmenu,
  SidebarSubmenuItem,
} from '@backstage/core-components';
import {
  configApiRef,
  IconComponent,
  useApi,
} from '@backstage/core-plugin-api';
import {
  SupportAgent as SupportAgentIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

export const Sidebar = (): React.JSX.Element => {
  const configApi = useApi(configApiRef);

  const enterpriseConfig = configApi.getOptionalString('copilot.enterprise');
  const organizationConfig = configApi.getOptionalString(
    'copilot.organization',
  );

  return (
    <SidebarItem
      icon={SupportAgentIcon as IconComponent}
      to="copilot"
      text="Copilot"
    >
      <SidebarSubmenu title="Copilot">
        {enterpriseConfig && (
          <SidebarSubmenuItem
            title="Enterprise"
            to="copilot/enterprise"
            icon={BusinessIcon as IconComponent}
          />
        )}
        {organizationConfig && (
          <SidebarSubmenuItem
            title="Organization"
            to="copilot/organization"
            icon={GroupIcon as IconComponent}
          />
        )}
      </SidebarSubmenu>
    </SidebarItem>
  );
};
