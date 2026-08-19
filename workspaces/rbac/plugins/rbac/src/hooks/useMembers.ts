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
import { useAsyncRetry, useInterval } from 'react-use';

import { parseEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { MemberEntity, MembersData } from '../types';
import { getMembersFromGroup } from '../utils/rbac-utils';
import { useLanguage } from './useLanguage';
import { useStableArray } from './useStableArray';
import { useTranslation } from './useTranslation';

export type MembersInfo = {
  loading: boolean;
  data: MembersData[];
  retry: { roleRetry: () => void; membersRetry: () => void };
  error?: { message: string };
  canReadUsersAndGroups: boolean;
  /** When true, this role is the default role for all users and groups. */
  isDefaultRole?: boolean;
};

const getErrorText = (
  role: any,
  members: any,
  t: (key: string, params?: any) => string,
): { message: string } | undefined => {
  if (!Array.isArray(role) && (role as Response)?.statusText) {
    return {
      message: t('common.unableToFetchRole', {
        error: (role as Response).statusText,
      }),
    };
  } else if (!Array.isArray(members) && (members as Response)?.statusText) {
    return {
      message: t('common.unableToFetchMembers', {
        error: (members as Response).statusText,
      }),
    };
  }
  return undefined;
};

const getMemberData = (
  memberResource: MemberEntity | undefined,
  ref: string,
  locale: string,
) => {
  if (memberResource) {
    return {
      name:
        memberResource.spec?.profile?.displayName ??
        memberResource.metadata.name,
      type: memberResource.kind,
      ref: {
        namespace: memberResource.metadata.namespace as string,
        kind: memberResource.kind.toLocaleLowerCase(locale),
        name: memberResource.metadata.name,
      },
      members:
        memberResource.kind === 'Group'
          ? getMembersFromGroup(memberResource)
          : 0,
    };
  }
  const { kind, namespace, name } = parseEntityRef(ref);
  return {
    name,
    type: kind === 'user' ? 'User' : ('Group' as 'User' | 'Group'),
    ref: {
      namespace,
      kind,
      name,
    },
    members: 0,
  };
};

export const useMembers = (
  roleName: string,
  pollInterval?: number,
): MembersInfo => {
  const rbacApi = useApi(rbacApiRef);
  const locale = useLanguage();
  const { t } = useTranslation();
  const {
    value: role,
    retry: roleRetry,
    error: roleError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getRole(roleName);
  });

  const { value: authCheck, error: authError } = useAsyncRetry(async () => {
    return await rbacApi.getMembers(1, 1);
  });

  const canReadUsersAndGroups =
    !authError && Array.isArray(authCheck) && authCheck.length > 0;

  const rawRefs = Array.isArray(role) ? role[0].memberReferences : [];
  const memberRefs = useStableArray(rawRefs);

  const {
    value: members,
    retry: membersRetry,
    error: membersError,
  } = useAsyncRetry(async () => {
    if (memberRefs.length === 0) {
      return [];
    }
    return await rbacApi.getMembersByRefs(memberRefs);
  }, [memberRefs]);

  const loading = !roleError && !membersError && !role && !members;

  const data = useMemo(
    () =>
      Array.isArray(members)
        ? memberRefs.reduce(
            (acc: MembersData[], ref: string, index: number) => {
              const memberResource: MemberEntity | undefined =
                members[index] ?? undefined;
              const memberData = getMemberData(memberResource, ref, locale);
              acc.push(memberData);
              return acc;
            },
            [],
          )
        : [],
    [memberRefs, members, locale],
  );

  useInterval(
    () => {
      roleRetry();
    },
    loading ? null : pollInterval || 10000,
  );

  const isDefaultRole = Array.isArray(role) && role[0]?.metadata?.isDefault;

  return {
    loading,
    data,
    retry: { roleRetry, membersRetry },
    error: getErrorText(role, members, t) || roleError || membersError,
    canReadUsersAndGroups,
    isDefaultRole: isDefaultRole ?? false,
  };
};
