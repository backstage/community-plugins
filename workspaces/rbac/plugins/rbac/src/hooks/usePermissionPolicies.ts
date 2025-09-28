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
import { useLanguage } from './useLanguage';
import { useTranslation } from './useTranslation';
import { getPluginsPermissionPoliciesData } from '../utils/create-role-utils';
import {
  getConditionalPermissionsData,
  getPermissionsData,
} from '../utils/rbac-utils';

const getErrorText = (
  policies: any,
  permissionPolicies: any,
  conditionalPolicies: any,
  t: (key: string, params?: any) => string,
): { name: number; message: string } | undefined => {
  if (!Array.isArray(policies) && (policies as Response)?.statusText) {
    return {
      name: (policies as Response).status,
      message: t('errors.fetchPoliciesErr', {
        error: (policies as Response).statusText,
      }),
    };
  } else if (
    !Array.isArray(permissionPolicies) &&
    (permissionPolicies as Response)?.statusText
  ) {
    return {
      name: (permissionPolicies as Response).status,
      message: t('errors.fetchPlugins', {
        error: (permissionPolicies as Response).statusText,
      }),
    };
  } else if (
    !Array.isArray(conditionalPolicies) &&
    (conditionalPolicies as Response)?.statusText
  ) {
    return {
      name: (conditionalPolicies as Response).status,
      message: t('errors.fetchConditionalPermissionPolicies', {
        error: (conditionalPolicies as Response).statusText,
      }),
    };
  }
  return undefined;
};

export const usePermissionPolicies = (
  entityReference: string,
  pollInterval?: number,
) => {
  const rbacApi = useApi(rbacApiRef);
  const locale = useLanguage();
  const { t } = useTranslation();
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

  const loading =
    !permissionPoliciesError &&
    !policiesError &&
    !conditionalPoliciesError &&
    (!permissionPolicies || !policies || !conditionalPolicies);

  const allPermissionPolicies = useMemo(
    () => (Array.isArray(permissionPolicies) ? permissionPolicies : []),
    [permissionPolicies],
  );

  const data = useMemo(() => {
    return Array.isArray(policies)
      ? getPermissionsData(policies, allPermissionPolicies, t, locale)
      : [];
  }, [allPermissionPolicies, policies, locale, t]);

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
          locale,
        )
      : [];
  }, [allPermissionPolicies, conditionalPolicies, locale]);

  useInterval(
    () => {
      policiesRetry();
      permissionPoliciesRetry();
      conditionalPoliciesRetry();
    },
    loading ? null : pollInterval || null,
  );
  return {
    loading,
    data: [...conditionsData, ...data],
    retry: { policiesRetry, permissionPoliciesRetry, conditionalPoliciesRetry },
    error:
      policiesError ||
      permissionPoliciesError ||
      conditionalPoliciesError ||
      getErrorText(policies, permissionPolicies, conditionalPolicies, t),
  };
};
