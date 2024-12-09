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
import { useAsync } from 'react-use';

import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import { styled, Theme } from '@mui/material/styles';
import { FormikErrors } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { useConditionRules } from '../../hooks/useConditionRules';
import { PermissionsData } from '../../types';
import { getPluginsPermissionPoliciesData } from '../../utils/create-role-utils';
import { ConditionsData } from '../ConditionalAccess/types';
import { initialPermissionPolicyRowValue } from './const';
import { PermissionPoliciesFormRow } from './PermissionPoliciesFormRow';
import { RoleFormValues } from './types';

const classes = {
  permissionPoliciesForm: 'permission-policies-form',
};

const PermissionPoliciesFormContainer = styled('div')(
  ({ theme }: { theme: Theme }) => ({
    [`&.${classes.permissionPoliciesForm}`]: {
      padding: '20px',
      border: `2px solid ${theme.palette.border}`,
      borderRadius: '5px',
    },
  }),
);

type PermissionPoliciesFormProps = {
  permissionPoliciesRows: PermissionsData[];
  permissionPoliciesRowsError: FormikErrors<PermissionsData>[];
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
  setFieldError: (field: string, value: string | undefined) => void;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export const PermissionPoliciesForm = ({
  permissionPoliciesRows,
  permissionPoliciesRowsError,
  setFieldValue,
  setFieldError,
  handleBlur,
}: PermissionPoliciesFormProps) => {
  const rbacApi = useApi(rbacApiRef);
  const conditionRules = useConditionRules();

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

  const onChangePlugin = (plugin: string, index: number) => {
    setFieldValue(`permissionPoliciesRows[${index}].plugin`, plugin, true);
    setFieldValue(`permissionPoliciesRows[${index}].permission`, '', false);
    setFieldValue(`permissionPoliciesRows[${index}].isResourced`, false, false);
    setFieldValue(
      `permissionPoliciesRows[${index}].conditions`,
      undefined,
      false,
    );
    setFieldValue(
      `permissionPoliciesRows[${index}].policies`,
      initialPermissionPolicyRowValue.policies,
      false,
    );
  };

  const onChangePermission = (
    permission: string,
    index: number,
    isResourced: boolean,
    policies?: string[],
  ) => {
    setFieldValue(
      `permissionPoliciesRows[${index}].permission`,
      permission,
      true,
    );
    setFieldValue(
      `permissionPoliciesRows[${index}].isResourced`,
      isResourced,
      false,
    );
    setFieldValue(
      `permissionPoliciesRows[${index}].conditions`,
      undefined,
      false,
    );
    setFieldValue(
      `permissionPoliciesRows[${index}].policies`,
      policies
        ? policies.map(p => ({ policy: p, effect: 'allow' }))
        : initialPermissionPolicyRowValue.policies,
      false,
    );
  };

  const onChangePolicy = (
    isChecked: boolean,
    policyIndex: number,
    index: number,
  ) => {
    setFieldValue(
      `permissionPoliciesRows[${index}].policies[${policyIndex}].effect`,
      isChecked ? 'allow' : 'deny',
      true,
    );
  };

  const onAddConditions = (index: number, conditions?: ConditionsData) => {
    setFieldValue(`permissionPoliciesRows[${index}].conditions`, conditions);
    if (!conditions)
      setFieldValue(`permissionPoliciesRows[${index}].id`, undefined);
  };

  const onRowRemove = (index: number) => {
    const finalPps = permissionPoliciesRows.filter(
      (_pp, ppIndex) => index !== ppIndex,
    );
    setFieldError(`permissionPoliciesRows[${index}]`, undefined);
    setFieldValue('permissionPoliciesRows', finalPps, false);
  };

  const onRowAdd = () =>
    setFieldValue(
      'permissionPoliciesRows',
      [...permissionPoliciesRows, initialPermissionPolicyRowValue],
      false,
    );

  return (
    <div>
      <FormHelperText>
        Permission policies can be selected for each plugin. You can add
        multiple permission policies using +Add option.
      </FormHelperText>
      <br />
      {permissionPoliciesLoading ? (
        <Progress />
      ) : (
        <PermissionPoliciesFormContainer
          className={classes.permissionPoliciesForm}
        >
          {permissionPoliciesRows.map((pp, index) => (
            <PermissionPoliciesFormRow
              key={index}
              permissionPoliciesRowError={
                permissionPoliciesRowsError?.[index] ?? {}
              }
              rowName={`permissionPoliciesRows[${index}]`}
              permissionPoliciesRowData={pp}
              permissionPoliciesData={permissionPoliciesData}
              rowCount={permissionPoliciesRows.length}
              conditionRules={conditionRules}
              onChangePlugin={(plugin: string) => onChangePlugin(plugin, index)}
              onChangePermission={(
                permission: string,
                isResourced: boolean,
                policies?: string[],
              ) => onChangePermission(permission, index, isResourced, policies)}
              onChangePolicy={(isChecked: boolean, policyIndex: number) =>
                onChangePolicy(isChecked, policyIndex, index)
              }
              onAddConditions={(conditions?: ConditionsData) =>
                onAddConditions(index, conditions)
              }
              onRemove={() => onRowRemove(index)}
              handleBlur={handleBlur}
              getPermissionDisabled={(permission: string) => {
                const pluginPermissionPolicies = permissionPoliciesRows.filter(
                  ppr => ppr.plugin === pp.plugin,
                );
                const previouslySelectedPermission =
                  !!pluginPermissionPolicies.find(
                    ppp => ppp.permission === permission,
                  );
                return (
                  previouslySelectedPermission &&
                  !permissionPoliciesData?.pluginsPermissions[pp.plugin]
                    ?.policies[permission ?? '']?.isResourced
                );
              }}
            />
          ))}
          <Button
            sx={{
              color: theme => theme.palette.primary.light,
            }}
            size="small"
            onClick={onRowAdd}
            name="add-permission-policy"
          >
            <AddIcon />
            Add
          </Button>
        </PermissionPoliciesFormContainer>
      )}
      {!permissionPoliciesLoading &&
        (permissionPoliciesErr?.message ||
          !Array.isArray(permissionPolicies)) && (
          <>
            <br />
            <FormHelperText error>
              {`Error fetching the permission policies: ${
                permissionPoliciesErr?.message ||
                (permissionPolicies as Response)?.statusText
              }`}
            </FormHelperText>
          </>
        )}
    </div>
  );
};
