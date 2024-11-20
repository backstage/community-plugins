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

import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FormikErrors } from 'formik';

import { PermissionsData } from '../../types';
import { getRulesNumber } from '../../utils/create-role-utils';
import { ConditionalAccessSidebar } from '../ConditionalAccess/ConditionalAccessSidebar';
import { ConditionRules, ConditionsData } from '../ConditionalAccess/types';
import { PoliciesCheckboxGroup } from './PoliciesCheckboxGroup';
import { PluginsPermissionPoliciesData } from './types';

type PermissionPoliciesFormRowProps = {
  permissionPoliciesRowData: PermissionsData;
  permissionPoliciesData?: PluginsPermissionPoliciesData;
  permissionPoliciesRowError: FormikErrors<PermissionsData>;
  rowCount: number;
  rowName: string;
  conditionRules: ConditionRules;
  onRemove: () => void;
  onChangePlugin: (plugin: string) => void;
  onChangePermission: (
    permission: string,
    isResourced: boolean,
    policies?: string[],
  ) => void;
  onChangePolicy: (isChecked: boolean, policyIndex: number) => void;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  getPermissionDisabled: (permission: string) => boolean;
  onAddConditions: (conditions?: ConditionsData) => void;
};

export const PermissionPoliciesFormRow = ({
  permissionPoliciesRowData,
  permissionPoliciesData,
  permissionPoliciesRowError,
  rowCount,
  rowName,
  conditionRules,
  onRemove,
  onChangePermission,
  onChangePolicy,
  onChangePlugin,
  handleBlur,
  getPermissionDisabled,
  onAddConditions,
}: PermissionPoliciesFormRowProps) => {
  const { plugin: pluginError, permission: permissionError } =
    permissionPoliciesRowError;
  const { data: conditionRulesData, error: conditionRulesError } =
    conditionRules;
  const totalRules = getRulesNumber(permissionPoliciesRowData.conditions);

  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  const tooltipTitle = () => (
    <div>
      <Typography component="p" align="center">
        Define access conditions for the selected resource type using Rules.
        Rules vary by resource type.{' '}
        <b>Users have access to the resource type content by default</b> unless
        configured otherwise.
      </Typography>
    </div>
  );

  const getTotalRules = (): string => {
    let accessMessage = 'Configure access';

    if (totalRules > 0) {
      accessMessage += ` (${totalRules} ${totalRules > 1 ? 'rules' : 'rule'})`;
    }
    return accessMessage;
  };

  return (
    <div>
      <div style={{ display: 'flex', flexFlow: 'column', gap: '15px' }}>
        <FormLabel
          style={{
            fontWeight: 800,
            fontSize: '0.8rem',
          }}
        >
          What can users/groups access?
        </FormLabel>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Autocomplete
            options={permissionPoliciesData?.plugins ?? []}
            style={{ width: '35%', flexGrow: '1' }}
            value={permissionPoliciesRowData.plugin || null}
            onChange={(_e, value) => {
              onChangePlugin(value ?? '');
            }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Plugin"
                name={`${rowName}.plugin`}
                variant="outlined"
                placeholder="Select a plugin"
                error={!!pluginError}
                helperText={pluginError ?? ''}
                onBlur={handleBlur}
                required
              />
            )}
          />
          <Autocomplete
            disabled={!permissionPoliciesRowData.plugin}
            options={
              permissionPoliciesData?.pluginsPermissions?.[
                permissionPoliciesRowData.plugin
              ]?.permissions ?? []
            }
            style={{ width: '35%', flexGrow: '1' }}
            value={permissionPoliciesRowData.permission || null}
            onChange={(_e, value) =>
              onChangePermission(
                value ?? '',
                permissionPoliciesData?.pluginsPermissions?.[
                  permissionPoliciesRowData.plugin
                ]?.policies[value ?? '']?.isResourced ?? false,
                value
                  ? permissionPoliciesData?.pluginsPermissions?.[
                      permissionPoliciesRowData.plugin
                    ]?.policies?.[value].policies
                  : undefined,
              )
            }
            getOptionDisabled={getPermissionDisabled}
            getOptionLabel={option => option || ''}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Resource type"
                name={`${rowName}.permission`}
                variant="outlined"
                placeholder="Select a resource type"
                error={!!permissionError}
                helperText={permissionError ?? ''}
                onBlur={handleBlur}
                required
              />
            )}
          />
          <div style={{ width: '23%', alignSelf: 'center', flexGrow: 1 }}>
            {permissionPoliciesRowData.isResourced &&
              !!conditionRulesData?.[`${permissionPoliciesRowData.plugin}`]?.[
                `${permissionPoliciesRowData.permission}`
              ]?.rules.length && (
                <IconButton
                  title=""
                  color="primary"
                  hidden={
                    !permissionPoliciesData?.pluginsPermissions[
                      permissionPoliciesRowData.plugin
                    ]?.policies[permissionPoliciesRowData.permission]
                      ?.isResourced
                  }
                  aria-label="configure-access"
                  sx={{
                    fontSize: theme => theme.typography.fontSize,
                  }}
                  onClick={() => setSidebarOpen(true)}
                  disabled={!!conditionRulesError}
                >
                  <ChecklistRtlIcon fontSize="small" />
                  {getTotalRules()}
                  &nbsp;
                  <Tooltip title={tooltipTitle()} placement="top">
                    <HelpOutlineIcon fontSize="inherit" />
                  </Tooltip>
                </IconButton>
              )}
          </div>
          <IconButton
            title="Remove"
            sx={{
              color: theme => theme.palette.grey[500],
              flexGrow: 0,
              alignSelf: 'center',
            }}
            onClick={() => onRemove()}
            disabled={rowCount === 1}
            data-testid={`${rowName}-remove`}
          >
            <RemoveIcon id={`${rowName}-remove`} />
          </IconButton>
        </div>
      </div>
      <PoliciesCheckboxGroup
        permissionPoliciesRowData={permissionPoliciesRowData}
        onChangePolicy={onChangePolicy}
        rowName={rowName}
      />
      <ConditionalAccessSidebar
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
        }}
        onSave={(conditions?: ConditionsData) => {
          onAddConditions(conditions);
          setSidebarOpen(false);
        }}
        conditionsFormVal={permissionPoliciesRowData.conditions}
        selPluginResourceType={permissionPoliciesRowData.permission}
        conditionRulesData={
          conditionRulesData?.[`${permissionPoliciesRowData.plugin}`]?.[
            `${permissionPoliciesRowData.permission}`
          ]
        }
      />
    </div>
  );
};
