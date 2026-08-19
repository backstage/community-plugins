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
import { useMemo } from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { SelectedMember } from '../components/CreateRole/types';
import { MemberEntity } from '../types';
import { getSelectedMember } from '../utils/rbac-utils';
import { useRole } from './useRole';
import { useStableArray } from './useStableArray';

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

  const rawRefs = role ? (role as Role).memberReferences : [];
  const memberRefs = useStableArray(rawRefs);

  const {
    loading: authLoading,
    value: authCheck,
    error: authError,
  } = useAsync(async () => {
    return await rbacApi.getMembers(1, 1);
  });

  const {
    loading: selectedLoading,
    value: selectedEntities,
    error: selectedError,
  } = useAsync(async () => {
    if (memberRefs.length === 0) {
      return [];
    }
    return await rbacApi.getMembersByRefs(memberRefs);
  }, [memberRefs]);

  const canReadUsersAndGroups =
    !authLoading &&
    !authError &&
    Array.isArray(authCheck) &&
    authCheck.length > 0;

  const members: MemberEntity[] = useMemo(
    () =>
      Array.isArray(selectedEntities)
        ? (selectedEntities.filter(Boolean) as MemberEntity[])
        : [],
    [selectedEntities],
  );

  const data: SelectedMember[] = useMemo(
    () =>
      Array.isArray(selectedEntities)
        ? memberRefs.reduce(
            (acc: SelectedMember[], ref: string, index: number) => {
              const memberResource =
                (selectedEntities[index] as MemberEntity) ?? undefined;
              acc.push(getSelectedMember(memberResource, ref));
              return acc;
            },
            [],
          )
        : [],
    [memberRefs, selectedEntities],
  );

  return {
    selectedMembers: data,
    members,
    role,
    membersError: ((authError || selectedError) as Error) || {
      name: (authCheck as unknown as Response)?.status,
      message: (authCheck as unknown as Response)?.statusText,
    },
    roleError: roleError,
    loading: roleLoading || authLoading || selectedLoading,
    canReadUsersAndGroups,
  };
};
