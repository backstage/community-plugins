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
import { RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';
import { parseEntityRef } from '@backstage/catalog-model';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import { RBACAPI } from '../api/RBACBackendClient';
import {
  RoleBasedConditions,
  RoleError,
  UpdatedConditionsData,
} from '../types';
import { NavigateFunction } from 'react-router-dom';
import { rbacTranslationRef } from '../translations';

export const createPermissions = async (
  newPermissions: RoleBasedPolicy[],
  rbacApi: RBACAPI,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
  errorMsgPrefix?: string,
) => {
  if (newPermissions.length > 0) {
    const permissionsRes = await rbacApi.createPolicies(newPermissions);
    if ((permissionsRes as unknown as RoleError).error) {
      throw new Error(
        `${errorMsgPrefix || t('common.unableToCreatePermissionPolicies')} ${
          (permissionsRes as unknown as RoleError).error.message
        }`,
      );
    }
  }
};

export const removePermissions = async (
  name: string,
  deletePermissions: RoleBasedPolicy[],
  rbacApi: RBACAPI,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  if (deletePermissions.length > 0) {
    const permissionsRes = await rbacApi.deletePolicies(
      name,
      deletePermissions,
    );
    if ((permissionsRes as unknown as RoleError).error) {
      throw new Error(
        `${t('common.unableToDeletePermissionPolicies')} ${
          (permissionsRes as unknown as RoleError).error.message
        }`,
      );
    }
  }
};

export const removeConditions = async (
  deleteConditions: number[],
  rbacApi: RBACAPI,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  if (deleteConditions.length > 0) {
    const promises = deleteConditions.map(cid =>
      rbacApi.deleteConditionalPolicies(cid),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(
        `${t('common.unableToRemoveConditions')} ${cpErr.join('\n')}`,
      );
    }
  }
};

export const modifyConditions = async (
  updateConditions: UpdatedConditionsData,
  rbacApi: RBACAPI,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) => {
  if (updateConditions.length > 0) {
    const promises = updateConditions.map(({ id, updateCondition }) =>
      rbacApi.updateConditionalPolicies(id, updateCondition),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(
        `${t('common.unableToUpdateConditions')} ${cpErr.join('\n')}`,
      );
    }
  }
};

export const createConditions = async (
  newConditions: RoleBasedConditions[],
  rbacApi: RBACAPI,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
  errorMsgPrefix?: string,
) => {
  if (newConditions.length > 0) {
    const promises = newConditions.map(cpp =>
      rbacApi.createConditionalPermission(cpp),
    );

    const cppRes: (Response | RoleError)[] = await Promise.all(promises);
    const cpErr = cppRes
      .map(r => (r as unknown as RoleError).error?.message)
      .filter(m => m);

    if (cpErr.length > 0) {
      throw new Error(
        `${
          errorMsgPrefix || t('common.unableToAddConditions')
        } ${cpErr.join('\n')}`,
      );
    }
  }
};

export const navigateTo = (
  navigate: NavigateFunction,
  t: TranslationFunction<typeof rbacTranslationRef.T>,
  roleName?: string,
  rName?: string,
  action?: string,
  step?: number,
) => {
  const currentRoleName = rName || roleName;
  const stateProp =
    currentRoleName && action
      ? {
          state: {
            toastMessage: t('common.roleActionSuccessfully' as any, {
              roleName: currentRoleName,
              action,
            }),
          },
        }
      : undefined;
  if (step && currentRoleName) {
    const { kind, namespace, name } = parseEntityRef(currentRoleName);
    navigate(`../roles/${kind}/${namespace}/${name}`, stateProp);
  } else {
    navigate('..', stateProp);
  }
};
