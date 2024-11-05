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

import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';

export const useRole = (
  roleEntityRef: string,
): {
  loading: boolean;
  role: Role | undefined;
  roleError: Error;
} => {
  const rbacApi = useApi(rbacApiRef);
  const {
    value: roles,
    loading,
    error: roleError,
  } = useAsync(async () => await rbacApi.getRole(roleEntityRef));

  return {
    loading,
    role: Array.isArray(roles) ? roles[0] : undefined,
    roleError: (roleError as Error) || {
      name: (roles as Response)?.status,
      message: `Error fetching the role. ${(roles as Response)?.statusText}`,
    },
  };
};
