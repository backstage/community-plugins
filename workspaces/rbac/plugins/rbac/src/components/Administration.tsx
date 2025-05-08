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
import { useAsync } from 'react-use';

import { SidebarItem } from '@backstage/core-components';
import {
  configApiRef,
  IconComponent,
  useApi,
} from '@backstage/core-plugin-api';

import { default as RbacIcon } from '@mui/icons-material/VpnKeyOutlined';

import { rbacApiRef } from '../api/RBACBackendClient';

export const Administration = () => {
  const rbacApi = useApi(rbacApiRef);
  const { loading: isUserLoading, value: result } = useAsync(
    async () => await rbacApi.getUserAuthorization(),
    [],
  );

  const config = useApi(configApiRef);
  const isRBACPluginEnabled = config.getOptionalBoolean('permission.enabled');

  if (!isUserLoading && isRBACPluginEnabled) {
    return result?.status === 'Authorized' ? (
      <SidebarItem text="RBAC" to="rbac" icon={RbacIcon as IconComponent} />
    ) : null;
  }
  return null;
};
