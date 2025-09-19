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
import type { SetStateAction, Dispatch } from 'react';

import { useState, useEffect } from 'react';

import IconButton from '@mui/material/IconButton';
import { PermissionsData } from '../../types';
import { getRulesNumber } from '../../utils/create-role-utils';
import { ConditionRulesData, ConditionsData } from '../ConditionalAccess/types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PermissionPoliciesFormNestedRow from './PermissionPoliciesFormNestedRow';
import Link from '@mui/material/Link';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';

type PermissionPoliciesFormRowProps = {
  rowData: any;
  conditionRulesData?: ConditionRulesData;
  permissionPoliciesRows: PermissionsData[];
  open: boolean;
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
  onRemovePlugin: (plugin: string) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onAddConditions: (index: number, conditions?: ConditionsData) => void;
};

const PermissionPoliciesFormRow = ({
  rowData,
  permissionPoliciesRows,
  conditionRulesData,
  open,
  onSelectPermission,
  onSelectPolicy,
  onRemovePermission,
  onRemovePlugin,
  onAddConditions,
}: PermissionPoliciesFormRowProps) => {
  const { t } = useTranslation();
  const locale = useLanguage();
  const [currentOpen, setCurrentOpen] = useState<boolean>(false);

  useEffect(() => {
    setCurrentOpen(open);
  }, [open]);

  const getTotalRules = (conditions?: ConditionsData): number => {
    const totalRules = getRulesNumber(conditions);
    return totalRules;
  };

  const getPprIndex = (plugin: string, permission: string) => {
    return permissionPoliciesRows.findIndex(ppr => {
      return ppr.plugin === plugin && ppr.permission === permission;
    });
  };

  const getPolicies = (plugin: string, pp: any) => {
    const pprIndex = getPprIndex(plugin, pp.permission);
    return (
      permissionPoliciesRows?.[pprIndex]?.policies ||
      pp.actions.map((ac: string) => ({ policy: ac, effect: 'deny' }))
    );
  };

  const getPermissionCellLabel = (plugin: string) => {
    if (permissionPoliciesRows.find(ppr => ppr.plugin === plugin)) {
      return t('common.editCell');
    }

    return t('common.selectCell');
  };

  return (
    <>
      <TableRow>
        <TableCell
          align="left"
          sx={{
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            fontWeight: theme => theme.typography.fontWeightMedium,
          }}
        >
          <IconButton
            aria-label={t('common.expandRow')}
            size="small"
            onClick={() => setCurrentOpen(!currentOpen)}
            data-testid={`expand-row-${rowData.plugin}`}
          >
            {currentOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}
          </IconButton>
          {rowData.name}
        </TableCell>
        <TableCell align="left" sx={{ borderBottom: 'none' }}>
          <Link
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              color: theme => theme.palette.primary.main,
            }}
            onClick={() => setCurrentOpen(true)}
          >
            {getPermissionCellLabel(rowData.plugin)}
          </Link>
        </TableCell>
        <TableCell align="right" sx={{ borderBottom: 'none' }}>
          <IconButton
            aria-label={t('common.remove').toLocaleLowerCase(locale ?? 'en')}
            size="small"
            onClick={() => onRemovePlugin(rowData.plugin)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          sx={{ p: 0 }}
          colSpan={6}
          data-testid={`nested-row-${rowData.plugin}`}
        >
          <Collapse in={currentOpen} timeout="auto" unmountOnExit>
            <Box>
              <Table size="small" aria-label="permission-policies">
                <TableBody>
                  {rowData.permissionPolicies.map((pp: any) => (
                    <PermissionPoliciesFormNestedRow
                      key={pp.permission}
                      plugin={rowData.plugin}
                      permissionPolicy={pp}
                      permissionPolicyRowIndex={getPprIndex(
                        rowData.plugin,
                        pp.permission,
                      )}
                      policies={getPolicies(rowData.plugin, pp)}
                      conditionRulesLength={
                        conditionRulesData?.[`${rowData.plugin}`]?.[
                          `${pp.resourceType}`
                        ]?.rules.length
                      }
                      totalRulesCount={getTotalRules(
                        permissionPoliciesRows[
                          getPprIndex(rowData.plugin, pp.permission)
                        ]?.conditions,
                      )}
                      conditionsData={
                        permissionPoliciesRows[
                          getPprIndex(rowData.plugin, pp.permission)
                        ]?.conditions
                      }
                      conditionRulesData={conditionRulesData}
                      onSelectPermission={onSelectPermission}
                      onSelectPolicy={onSelectPolicy}
                      onRemovePermission={onRemovePermission}
                      onAddConditions={onAddConditions}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default PermissionPoliciesFormRow;
