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
import type { FocusEventHandler } from 'react';
import { useAsync } from 'react-use';

import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import FormHelperText from '@mui/material/FormHelperText';
import { FormikErrors } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { useConditionRules } from '../../hooks/useConditionRules';
import { PermissionsData, SelectedPlugin } from '../../types';
import { getPluginsPermissionPoliciesData } from '../../utils/create-role-utils';
import { ConditionsData } from '../ConditionalAccess/types';
import { RoleFormValues } from './types';
import PermissionPoliciesFormTable from './PermissionPoliciesFormTable';
import PluginsDropdown from './PluginsDropdown';
import Box from '@mui/material/Box';
import { capitalizeFirstLetter } from '../../utils/string-utils';
import { useTranslation } from '../../hooks/useTranslation';

type PermissionPoliciesFormProps = {
  permissionPoliciesRows: PermissionsData[];
  selectedPlugins: SelectedPlugin[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
  setFieldError: (field: string, value: string | undefined) => void;
  handleBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  selectedPluginsError: string;
};

export const PermissionPoliciesForm = ({
  permissionPoliciesRows,
  selectedPlugins,
  setFieldValue,
  setFieldError,
  handleBlur,
  selectedPluginsError,
}: PermissionPoliciesFormProps) => {
  const { t } = useTranslation();
  const rbacApi = useApi(rbacApiRef);
  const conditionRules = useConditionRules();

  const { data: conditionRulesData } = conditionRules;

  const {
    value: permissionPolicies,
    loading: permissionPoliciesLoading,
    error: permissionPoliciesErr,
  } = useAsync(async () => {
    return await rbacApi.listPermissions();
  });

  const permissionPoliciesData =
    !permissionPoliciesLoading && Array.isArray(permissionPolicies)
      ? getPluginsPermissionPoliciesData(permissionPolicies)
      : undefined;

  const onSelectPermission = (
    plugin: string,
    permission: string,
    isResourced: boolean,
    policies: string[],
    resourceType?: string,
  ) => {
    const ppr = {
      plugin,
      permission,
      isResourced,
      policies: policies.map(p => ({ policy: p, effect: 'allow' })),
      resourceType,
    };
    setFieldValue(
      'permissionPoliciesRows',
      [...permissionPoliciesRows, ppr],
      true,
    );
  };

  const onRemovePermission = (index: number) => {
    const finalPps = permissionPoliciesRows.filter(
      (_ppr, pIndex) => index !== pIndex,
    );
    setFieldValue('permissionPoliciesRows', finalPps, true);
    setFieldError(`permissionPoliciesRows[${index}]`, undefined);
  };

  const onSelectPolicy = (
    isChecked: boolean,
    policyIndex: number,
    index: number,
  ) => {
    const updatedRows = [...permissionPoliciesRows];
    updatedRows[index].policies[policyIndex].effect = isChecked
      ? 'allow'
      : 'deny';

    // If unchecking and no policies are left with 'allow' effect, remove the entire permission
    if (!isChecked) {
      const hasAnyAllowPolicy = updatedRows[index].policies.some(
        policy => policy.effect === 'allow',
      );

      if (!hasAnyAllowPolicy) {
        // Remove the entire permission entry
        const finalPps = updatedRows.filter((_ppr, pIndex) => index !== pIndex);
        setFieldValue('permissionPoliciesRows', finalPps, true);
        setFieldError(`permissionPoliciesRows[${index}]`, undefined);
        return;
      }
    }

    setFieldValue('permissionPoliciesRows', updatedRows, true);
  };

  const onAddConditions = (index: number, conditions?: ConditionsData) => {
    setFieldValue(`permissionPoliciesRows[${index}].conditions`, conditions);
    if (!conditions)
      setFieldValue(`permissionPoliciesRows[${index}].id`, undefined);
  };

  const onRemoveAllPlugins = () => {
    setFieldValue(`selectedPlugins`, [], true);
    setFieldValue('permissionPoliciesRows', [], true);
  };

  const onRemovePlugin = (plugin: string) => {
    const selPlugins = selectedPlugins.filter(
      sp => sp.value && sp.value !== plugin,
    );
    const finalPps = permissionPoliciesRows.filter(
      ppr => ppr.plugin !== plugin,
    );
    setFieldValue(`selectedPlugins`, selPlugins, true);
    setFieldValue('permissionPoliciesRows', finalPps, true);
  };

  const getAllPlugins = () => {
    let allPlugins: SelectedPlugin[] = [];
    if (permissionPoliciesData?.plugins) {
      allPlugins = permissionPoliciesData.plugins.map(p => ({
        label: capitalizeFirstLetter(p),
        value: p,
      }));
    }
    const allPluginsItem =
      allPlugins.length > 0
        ? [
            {
              label: t('permissionPolicies.allPlugins' as any, {
                count: allPlugins.length.toString(),
              }),
              value: '',
            },
          ]
        : [];
    return [...allPluginsItem, ...allPlugins];
  };

  const getPermissionPoliciesTableData = () => {
    return selectedPlugins
      .map(p =>
        p.value
          ? [
              {
                name: p.label,
                plugin: p.value,
                permissionPolicies:
                  permissionPoliciesData?.pluginsPermissions[
                    p.value
                  ]?.permissions?.map(perm => ({
                    permission: perm,
                    actions:
                      permissionPoliciesData?.pluginsPermissions[p.value]
                        .policies[perm].policies,
                    isResourced:
                      permissionPoliciesData?.pluginsPermissions[p.value]
                        .policies[perm].isResourced,
                    resourceType:
                      permissionPoliciesData?.pluginsPermissions[p.value]
                        .policies[perm].resourceType,
                  })) ?? [],
              },
            ]
          : [],
      )
      .flat();
  };

  const getSelectedPluginsCount = () => {
    if (selectedPlugins?.length > 0) {
      if (selectedPlugins.findIndex(sp => sp.value === '') >= 0) {
        return selectedPlugins.length - 1;
      }
      return selectedPlugins.length;
    }
    return 0;
  };

  return (
    <div>
      <FormHelperText>{t('permissionPolicies.helperText')}</FormHelperText>
      <br />
      {permissionPoliciesLoading ? (
        <Progress />
      ) : (
        <Box>
          <PluginsDropdown
            allPlugins={getAllPlugins()}
            selectedPlugins={selectedPlugins}
            setFieldValue={setFieldValue}
            handleBlur={handleBlur}
            onRemovePlugin={onRemovePlugin}
            onRemoveAllPlugins={onRemoveAllPlugins}
            selectedPluginsError={selectedPluginsError}
          />
          <br />
          <br />
          <PermissionPoliciesFormTable
            selectedPluginsCount={getSelectedPluginsCount()}
            data={getPermissionPoliciesTableData()}
            permissionPoliciesRows={permissionPoliciesRows ?? []}
            onSelectPermission={onSelectPermission}
            onSelectPolicy={onSelectPolicy}
            conditionRulesData={conditionRulesData}
            onRemovePermission={onRemovePermission}
            onRemovePlugin={onRemovePlugin}
            onAddConditions={onAddConditions}
          />
        </Box>
      )}
      {!permissionPoliciesLoading &&
        (permissionPoliciesErr?.message ||
          !Array.isArray(permissionPolicies)) && (
          <>
            <br />
            <FormHelperText error>
              {t('permissionPolicies.errorFetchingPolicies' as any, {
                error:
                  permissionPoliciesErr?.message ||
                  (permissionPolicies as Response)?.statusText,
              })}
            </FormHelperText>
          </>
        )}
    </div>
  );
};
