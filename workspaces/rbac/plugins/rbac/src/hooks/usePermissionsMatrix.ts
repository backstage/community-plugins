/*
 * Copyright 2026 The Backstage Authors
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

import { rbacApiRef } from '../api/RBACBackendClient';
import {
  buildPermissionsMatrix,
  PermissionsMatrix,
} from '../utils/permissions-matrix-utils';
import { useTranslation } from './useTranslation';

type PermissionsMatrixError = { title?: string; message: string };

class MatrixFetchError extends Error {
  constructor(
    readonly title: string,
    message: string,
  ) {
    super(message);
  }
}

/** Fails with the given title when the backend answered with an error response. */
const unwrap = <T>(result: T[] | Response, title: string): T[] => {
  if (Array.isArray(result)) {
    return result;
  }
  throw new MatrixFetchError(title, result.statusText || String(result.status));
};

/**
 * Loads roles, policies, plugin permissions and conditional policies with one
 * request each, and shapes them into a roles × permissions matrix.
 */
export const usePermissionsMatrix = (): {
  loading: boolean;
  matrix?: PermissionsMatrix;
  error?: PermissionsMatrixError;
} => {
  const rbacApi = useApi(rbacApiRef);
  const { t } = useTranslation();

  const { loading, value, error } = useAsync(async () => {
    const [roles, policies, permissions, conditions] = await Promise.all([
      rbacApi.getRoles(),
      rbacApi.getPolicies(),
      rbacApi.listPermissions(),
      rbacApi.getAllRoleConditions(),
    ]);
    return buildPermissionsMatrix({
      roles: unwrap(roles, t('errors.fetchRoles')),
      policies: unwrap(policies, t('errors.fetchPolicies')),
      permissions: unwrap(
        permissions,
        t('permissionsMatrix.errors.fetchPermissions'),
      ),
      conditions: unwrap(conditions, t('errors.fetchConditions')),
    });
  }, [rbacApi]);

  return {
    loading,
    matrix: value,
    error: error && {
      // An unexpected failure (e.g. a network error) has no specific title;
      // the error panel then falls back to its generic one.
      title: error instanceof MatrixFetchError ? error.title : undefined,
      message: error.message,
    },
  };
};
