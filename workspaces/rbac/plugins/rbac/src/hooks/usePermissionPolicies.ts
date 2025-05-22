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

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { getPluginsPermissionPoliciesData } from '../utils/create-role-utils';
import {
  getConditionalPermissionsData,
  getPermissionsData,
} from '../utils/rbac-utils';
// Import RoleBasedPolicy from rbac-common package
import { RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';

const getErrorText = (
  policies: any,
  permissionPolicies: any,
  conditionalPolicies: any,
  defaultPermissionsVal: any, // Add defaultPermissionsVal
): { name: number; message: string } | undefined => {
  if (!Array.isArray(policies) && (policies as Response)?.statusText) {
    return {
      name: (policies as Response).status,
      message: `Error fetching policies. ${(policies as Response).statusText}`,
    };
  } else if (
    !Array.isArray(permissionPolicies) &&
    (permissionPolicies as Response)?.statusText
  ) {
    return {
      name: (permissionPolicies as Response).status,
      message: `Error fetching the plugins. ${
        (permissionPolicies as Response).statusText
      }`,
    };
  } else if (
    !Array.isArray(conditionalPolicies) &&
    (conditionalPolicies as Response)?.statusText
  ) {
    return {
      name: (conditionalPolicies as Response).status,
      message: `Error fetching the conditional permission policies. ${
        (conditionalPolicies as Response).statusText
      }`,
    };
  } else if (
    !Array.isArray(defaultPermissionsVal) && // Check for defaultPermissionsVal
    (defaultPermissionsVal as Response)?.statusText
  ) {
    return {
      name: (defaultPermissionsVal as Response).status,
      message: `Error fetching default permissions. ${
        (defaultPermissionsVal as Response).statusText
      }`,
    };
  }
  return undefined;
};

export const usePermissionPolicies = (
  entityReference: string,
  pollInterval?: number,
) => {
  const rbacApi = useApi(rbacApiRef);
  const {
    value: policies,
    retry: policiesRetry,
    error: policiesError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getAssociatedPolicies(entityReference);
  });

  const {
    value: conditionalPolicies,
    retry: conditionalPoliciesRetry,
    error: conditionalPoliciesError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getRoleConditions(entityReference);
  });

  const {
    value: permissionPolicies,
    error: permissionPoliciesError,
    retry: permissionPoliciesRetry,
  } = useAsyncRetry(async () => {
    return await rbacApi.listPermissions();
  });

  const {
    value: defaultPermissionsData, // Renamed to defaultPermissionsData for clarity
    retry: defaultPermissionsRetry,
    error: defaultPermissionsError,
  } = useAsyncRetry(async () => {
    try {
      const result = await rbacApi.getDefaultPermissions();
      // Check if result is a Response object (error case from client)
      if (result instanceof Response) {
        if (!result.ok) {
          // This will likely be caught by defaultPermissionsError via useAsyncRetry's mechanics
          // but logging it here can be useful.
          // To ensure it's treated as an error by useAsyncRetry, we might need to throw.
          throw new Error(
            `Failed to fetch default permissions: ${result.status}`,
          );
        }
        // If it's a Response but somehow OK (shouldn't happen based on client logic)
        const data = await result.json();
        return data;
      }
      return result;
    } catch (e) {
      throw e; // Re-throw to be caught by useAsyncRetry
    }
  }, [rbacApi]); // Added rbacApi to dependency array

  const loading =
    !permissionPoliciesError &&
    !policiesError &&
    !conditionalPoliciesError &&
    !defaultPermissionsError && // Add this
    (!permissionPolicies ||
      !policies ||
      !conditionalPolicies ||
      !defaultPermissionsData); // Add !defaultPermissionsData

  const allPermissionPolicies = useMemo(
    () => (Array.isArray(permissionPolicies) ? permissionPolicies : []),
    [permissionPolicies],
  );

  const data = useMemo(() => {
    return Array.isArray(policies)
      ? getPermissionsData(policies, allPermissionPolicies)
      : [];
  }, [allPermissionPolicies, policies]);

  const conditionsData = useMemo(() => {
    const cpp = Array.isArray(conditionalPolicies) ? conditionalPolicies : [];
    const pluginsPermissionsPoliciesData =
      allPermissionPolicies.length > 0
        ? getPluginsPermissionPoliciesData(allPermissionPolicies)
        : undefined;
    return pluginsPermissionsPoliciesData
      ? getConditionalPermissionsData(
          cpp,
          pluginsPermissionsPoliciesData,
          allPermissionPolicies,
        )
      : [];
  }, [allPermissionPolicies, conditionalPolicies]);

  useInterval(
    () => {
      policiesRetry();
      permissionPoliciesRetry();
      conditionalPoliciesRetry();
      defaultPermissionsRetry(); // Add this
    },
    loading ? null : pollInterval || null,
  );

  const processedDefaultPermissions = useMemo(() => {
    if (Array.isArray(defaultPermissionsData)) {
      return defaultPermissionsData.map(
        dp =>
          ({
            entityReference: '<default>', // Special marker for default policies
            permission: dp.permission,
            policy: dp.policy, // 'policy' from default is 'action' in RoleBasedPolicy
            effect: dp.effect,
            metadata: { source: 'default' }, // Indicate source
          }) as RoleBasedPolicy,
      ); // Cast to RoleBasedPolicy or a compatible type
    }
    return [];
  }, [defaultPermissionsData]);

  return {
    loading,
    rolePolicies: [...conditionsData, ...data], // Existing combined data
    defaultPolicies: processedDefaultPermissions, // New field for defaults
    retry: {
      policiesRetry,
      permissionPoliciesRetry,
      conditionalPoliciesRetry,
      defaultPermissionsRetry,
    },
    error:
      policiesError ||
      permissionPoliciesError ||
      conditionalPoliciesError ||
      defaultPermissionsError || // Add this
      getErrorText(
        policies,
        permissionPolicies,
        conditionalPolicies,
        defaultPermissionsData,
      ), // Pass defaultPermissionsData
  };
};
