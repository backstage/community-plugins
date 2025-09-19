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
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { RowPolicy } from './types';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import Badge from '@mui/material/Badge';
import { ConditionRulesData, ConditionsData } from '../ConditionalAccess/types';
import { ConditionalAccessSidebar } from '../ConditionalAccess/ConditionalAccessSidebar';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from '../../hooks/useTranslation';

const PermissionPoliciesFormNestedRow = ({
  plugin,
  permissionPolicy,
  permissionPolicyRowIndex,
  onSelectPermission,
  policies,
  onSelectPolicy,
  conditionRulesLength,
  totalRulesCount,
  onRemovePermission,
  conditionRulesData,
  conditionsData,
  onAddConditions,
}: {
  plugin: string;
  permissionPolicy: any;
  permissionPolicyRowIndex: number;
  policies: RowPolicy[];
  conditionRulesLength?: number;
  totalRulesCount: number;
  conditionRulesData?: ConditionRulesData;
  conditionsData?: ConditionsData;
  onSelectPermission: (
    plugin: string,
    permission: string,
    isResourced: boolean,
    policies: string[],
    resourceType?: string,
  ) => void;
  onSelectPolicy: (
    isChecked: boolean,
    policyIndex: number,
    pIndex: number,
  ) => void;
  onRemovePermission: (index: number) => void;
  onAddConditions: (index: number, conditions?: ConditionsData) => void;
}) => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tooltipTitle = () => (
    <div>
      <Typography component="p" align="center">
        {t('permissionPolicies.advancedPermissionsTooltip')}
      </Typography>
    </div>
  );
  return (
    <>
      <TableRow>
        <TableCell align="left" sx={{ borderBottom: 'none', width: '30%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox
              onChange={e => {
                if (e.target.checked) {
                  onSelectPermission(
                    plugin,
                    permissionPolicy.permission,
                    permissionPolicy.isResourced,
                    permissionPolicy.actions,
                    permissionPolicy.resourceType,
                  );
                } else {
                  onRemovePermission(permissionPolicyRowIndex);
                }
              }}
              checked={permissionPolicyRowIndex >= 0}
            />
            {permissionPolicy.permission}
            {permissionPolicy.resourceType ? (
              <Tooltip
                title={t('permissionPolicies.resourceTypeTooltip' as any, {
                  resourceType: permissionPolicy.resourceType,
                })}
                placement="top"
              >
                <IconButton aria-label="info" size="small">
                  <InfoOutlinedIcon fontSize="small" />
                  &nbsp;
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        </TableCell>
        <TableCell
          align="left"
          sx={{
            display: 'flex',
            borderBottom: 'none',
            width: '100%',
          }}
        >
          {policies.map((p: RowPolicy, pIndex: number) => (
            <Box
              sx={{ display: 'flex', alignItems: 'center' }}
              key={`${permissionPolicy.permission}-${p.policy}`}
            >
              <Checkbox
                onChange={(_e, checked) =>
                  onSelectPolicy(checked, pIndex, permissionPolicyRowIndex)
                }
                checked={p.effect === 'allow'}
                disabled={permissionPolicyRowIndex < 0}
              />
              {p.policy}
            </Box>
          ))}
        </TableCell>
        <TableCell align="right" sx={{ borderBottom: 'none', width: '10%' }}>
          <Tooltip title={tooltipTitle()} placement="top">
            <Typography component="span">
              <IconButton
                aria-label="remove"
                size="small"
                onClick={() => setSidebarOpen(true)}
                disabled={
                  permissionPolicyRowIndex < 0 ||
                  !permissionPolicy.isResourced ||
                  !conditionRulesLength
                }
                sx={{
                  ':disabled': { color: theme => theme.palette.grey[400] },
                }}
              >
                <Badge badgeContent={totalRulesCount} color="success">
                  <ChecklistRtlIcon />
                </Badge>
                &nbsp;
              </IconButton>
            </Typography>
          </Tooltip>
        </TableCell>
      </TableRow>
      <ConditionalAccessSidebar
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
        }}
        onSave={(conditions?: ConditionsData) => {
          onAddConditions(permissionPolicyRowIndex, conditions);
          setSidebarOpen(false);
        }}
        conditionsFormVal={conditionsData}
        selPluginResourceType={permissionPolicy.resourceType}
        conditionRulesData={
          conditionRulesData?.[`${plugin}`]?.[
            `${permissionPolicy.resourceType}`
          ]
        }
      />
    </>
  );
};

export default PermissionPoliciesFormNestedRow;
