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
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import {
  isResourcedPolicy,
  PluginPermissionMetaData,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityUpdatePermission,
  Role,
  RoleBasedPolicy,
} from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { RolesData } from '../types';
import { getPermissions, getPermissionsArray } from '../utils/rbac-utils';

type RoleWithConditionalPoliciesCount = Role & {
  conditionalPoliciesCount: number;
  accessiblePlugins: string[];
};

export const useRoles = (
  pollInterval?: number,
): {
  loading: boolean;
  data: RolesData[];
  createRoleLoading: boolean;
  createRoleAllowed: boolean;
  error: {
    rolesError: string;
    policiesError: string;
    roleConditionError: string;
  };
  retry: { roleRetry: () => void; policiesRetry: () => void };
} => {
  const rbacApi = useApi(rbacApiRef);
  const [newRoles, setNewRoles] = React.useState<
    RoleWithConditionalPoliciesCount[]
  >([]);
  const [roleConditionError, setRoleConditionError] =
    React.useState<string>('');
  const {
    value: roles,
    retry: roleRetry,
    error: rolesError,
  } = useAsyncRetry(async () => await rbacApi.getRoles());

  const {
    value: policies,
    retry: policiesRetry,
    error: policiesError,
  } = useAsyncRetry(async () => await rbacApi.getPolicies(), []);

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const {
    value: permissionPolicies,
    loading: loadingPermissionPolicies,
    error: permissionPoliciesError,
  } = useAsync(async () => {
    return await rbacApi.listPermissions();
  });

  const canReadUsersAndGroups =
    !membersLoading &&
    !membersError &&
    Array.isArray(members) &&
    members.length > 0;

  const deletePermissionResult = usePermission({
    permission: policyEntityDeletePermission,
    resourceRef: policyEntityDeletePermission.resourceType,
  });

  const policyEntityCreatePermissionResult = usePermission({
    permission: policyEntityCreatePermission,
    resourceRef: policyEntityCreatePermission.resourceType,
  });

  const createRoleLoading =
    policyEntityCreatePermissionResult.loading || membersLoading;

  const createRoleAllowed =
    policyEntityCreatePermissionResult.allowed && canReadUsersAndGroups;

  const editPermissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });

  React.useEffect(() => {
    const fetchAllPermissionPolicies = async () => {
      if (!Array.isArray(roles)) return;
      const failedFetchConditionRoles: string[] = [];
      const conditionPromises = roles.map(async role => {
        try {
          const conditionalPolicies = await rbacApi.getRoleConditions(
            role.name,
          );

          if ((conditionalPolicies as any as Response)?.statusText) {
            failedFetchConditionRoles.push(role.name);
            throw new Error(
              (conditionalPolicies as any as Response).statusText,
            );
          }
          const accessiblePlugins =
            Array.isArray(conditionalPolicies) && conditionalPolicies.length > 0
              ? conditionalPolicies.map(c => c.pluginId)
              : [];
          return {
            ...role,
            conditionalPoliciesCount: Array.isArray(conditionalPolicies)
              ? conditionalPolicies.length
              : 0,
            accessiblePlugins,
          };
        } catch (error) {
          setRoleConditionError(
            `Error fetching role conditions for ${
              failedFetchConditionRoles.length > 1 ? 'roles' : 'role'
            } ${failedFetchConditionRoles.join(', ')}, please try again later.`,
          );
          return {
            ...role,
            conditionalPoliciesCount: 0,
            accessiblePlugins: [],
          };
        }
      });

      const updatedRoles = await Promise.all(conditionPromises);
      setNewRoles(updatedRoles);
    };

    fetchAllPermissionPolicies();
  }, [roles, rbacApi]);

  const data: RolesData[] = React.useMemo(
    () =>
      Array.isArray(newRoles) && newRoles?.length > 0
        ? newRoles.reduce(
            (acc: RolesData[], role: RoleWithConditionalPoliciesCount) => {
              const permissions = getPermissions(
                role.name,
                policies as RoleBasedPolicy[],
              );

              let accPls = role.accessiblePlugins;
              if (
                !loadingPermissionPolicies &&
                !permissionPoliciesError &&
                (permissionPolicies as PluginPermissionMetaData[])?.length > 0
              ) {
                const pls = getPermissionsArray(
                  role.name,
                  policies as RoleBasedPolicy[],
                ).map(
                  po =>
                    (permissionPolicies as PluginPermissionMetaData[]).find(
                      pp =>
                        pp.policies?.find(pol =>
                          isResourcedPolicy(pol)
                            ? po.permission === pol.resourceType
                            : po.permission === pol.name,
                        ),
                    )?.pluginId,
                );
                accPls = [...accPls, ...pls].filter(val => !!val) as string[];
              }
              const accessiblePlugins = accPls
                .filter((val, index, plugins) => plugins.indexOf(val) === index)
                .sort();

              return [
                ...acc,
                {
                  id: role.name,
                  name: role.name,
                  description: role.metadata?.description ?? '-',
                  members: role.memberReferences,
                  permissions: role.conditionalPoliciesCount + permissions,
                  modifiedBy: '-',
                  lastModified: '-',
                  actionsPermissionResults: {
                    delete: deletePermissionResult,
                    edit: {
                      allowed:
                        editPermissionResult.allowed && canReadUsersAndGroups,
                      loading: editPermissionResult.loading,
                    },
                  },
                  accessiblePlugins,
                },
              ];
            },
            [],
          )
        : [],
    [
      newRoles,
      policies,
      loadingPermissionPolicies,
      permissionPoliciesError,
      permissionPolicies,
      deletePermissionResult,
      editPermissionResult.allowed,
      editPermissionResult.loading,
      canReadUsersAndGroups,
    ],
  );
  const loading = !rolesError && !policiesError && !roles && !policies;

  useInterval(
    () => {
      roleRetry();
      policiesRetry();
    },
    loading ? null : pollInterval || 10000,
  );

  return {
    loading,
    data,
    error: {
      rolesError: (rolesError?.message ||
        (typeof roles === 'object'
          ? (roles as any as Response)?.statusText
          : '')) as string,
      policiesError: (policiesError?.message ||
        (typeof policies === 'object'
          ? (policies as any as Response)?.statusText
          : '')) as string,
      roleConditionError,
    },
    createRoleLoading,
    createRoleAllowed,
    retry: { roleRetry, policiesRetry },
  };
};
