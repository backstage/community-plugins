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

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { SelectedMember } from '../components/CreateRole/types';
import { MemberEntity } from '../types';
import { getSelectedMember } from '../utils/rbac-utils';
import { useRole } from './useRole';

export const useSelectedMembers = (
  roleName: string,
): {
  members: MemberEntity[];
  selectedMembers: SelectedMember[];
  role: Role | undefined;
  membersError: Error;
  roleError: Error;
  loading: boolean;
  canReadUsersAndGroups: boolean;
} => {
  const rbacApi = useApi(rbacApiRef);
  const { role, loading: roleLoading, roleError } = useRole(roleName);

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const canReadUsersAndGroups =
    !membersLoading &&
    !membersError &&
    Array.isArray(members) &&
    members.length > 0;

  const data: SelectedMember[] = role
    ? (role as Role).memberReferences.reduce((acc: SelectedMember[], ref) => {
        const memberResource =
          (Array.isArray(members) &&
            members.find(member => stringifyEntityRef(member) === ref)) ||
          undefined;
        acc.push(getSelectedMember(memberResource, ref));

        return acc;
      }, [])
    : [];

  return {
    selectedMembers: data,
    members: Array.isArray(members) ? members : ([] as MemberEntity[]),
    role,
    membersError: (membersError as Error) || {
      name: (members as Response)?.status,
      message: (members as Response)?.statusText,
    },
    roleError: roleError,
    loading: roleLoading || membersLoading,
    canReadUsersAndGroups,
  };
};
