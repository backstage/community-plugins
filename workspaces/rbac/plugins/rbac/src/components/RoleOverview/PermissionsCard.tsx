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
import { useState, useMemo } from 'react';

import { parseEntityRef } from '@backstage/catalog-model';
import {
  Table,
  WarningPanel,
  type TableColumn,
} from '@backstage/core-components';

import CachedIcon from '@mui/icons-material/Cached';
import Box from '@mui/material/Box';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { type PermissionsData } from '../../types';
import { type RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';
import { filterTableData } from '../../utils/filter-table-data';
import EditRole from '../EditRole';
import { columns } from './PermissionsListColumns';
import { StyledTableWrapper } from './StyledTableWrapper';

type PermissionsCardProps = {
  entityReference: string;
  canReadUsersAndGroups: boolean;
};

const getRefreshIcon = () => <CachedIcon />;
const getEditIcon = (isAllowed: boolean, roleName: string) => {
  const { kind, name, namespace } = parseEntityRef(roleName);

  return (
    <EditRole
      dataTestId={isAllowed ? 'update-policies' : 'disable-update-policies'}
      canEdit={isAllowed}
      roleName={roleName}
      to={`../../role/${kind}/${namespace}/${name}?activeStep=${2}`}
    />
  );
};

export const PermissionsCard = ({
  entityReference,
  canReadUsersAndGroups,
}: PermissionsCardProps) => {
  const { rolePolicies, defaultPolicies, loading, retry, error } =
    usePermissionPolicies(entityReference);
  const [searchText, setSearchText] = useState<string>();

  const combinedData: (PermissionsData | RoleBasedPolicy)[] = useMemo(() => {
    const roles = Array.isArray(rolePolicies) ? rolePolicies : [];
    const defaults = Array.isArray(defaultPolicies) ? defaultPolicies : [];
    return [...roles, ...defaults];
  }, [rolePolicies, defaultPolicies]);

  const numberOfPolicies = useMemo(() => {
    const filteredPermissions = filterTableData({
      data: combinedData,
      columns: columns as TableColumn<PermissionsData | RoleBasedPolicy>[],
      searchText,
    });
    let policies = 0;
    filteredPermissions.forEach(p => {
      if ('conditions' in p && p.conditions) {
        // Conditional policies (typically from rolePolicies)
        policies++;
        return;
      }
      // Default policies are structured like: { entityReference: '<default>', permission: string, policy: string (action), effect: string, metadata: { source: 'default' } }
      // Role-specific non-conditional policies are structured: { policies: [{ effect: string, ... }], ... }
      if ('metadata' in p && p.metadata?.source === 'default') {
        if (p.effect === 'allow') {
          // Default policies have effect directly
          policies++;
        }
      } else if ('policies' in p && p.policies && Array.isArray(p.policies)) {
        // Role-specific policies
        policies += p.policies.filter(
          (pol: { effect: string }) => pol.effect === 'allow',
        ).length;
      }
    });
    return policies;
  }, [combinedData, searchText]); // Removed 'columns' from dependency array

  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: 'Refresh',
      isFreeAction: true,
      onClick: () => {
        retry.permissionPoliciesRetry();
        retry.policiesRetry();
        retry.conditionalPoliciesRetry();
        retry.defaultPermissionsRetry(); // Add this line
      },
    },
    {
      icon: () => getEditIcon(canReadUsersAndGroups, entityReference),
      tooltip: canReadUsersAndGroups ? 'Edit' : 'Unauthorized to edit',
      isFreeAction: true,
      onClick: () => {},
    },
  ];

  return (
    <Box>
      {error?.name && error.name !== 404 && (
        <Box style={{ paddingBottom: '16px' }}>
          <WarningPanel
            message={error?.message}
            title="Something went wrong while fetching the permission policies"
            severity="error"
          />
        </Box>
      )}
      <StyledTableWrapper>
        <Table
          title={
            !loading && combinedData.length > 0
              ? `Permission Policies (${numberOfPolicies})`
              : 'Permission Policies'
          }
          actions={actions}
          options={{ padding: 'default', search: true, paging: true }}
          data={combinedData}
          columns={columns as TableColumn<PermissionsData | RoleBasedPolicy>[]}
          isLoading={loading}
          emptyContent={
            <Box
              data-testid="permission-table-empty"
              sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            >
              No records found
            </Box>
          }
          onSearchChange={setSearchText}
        />
      </StyledTableWrapper>
    </Box>
  );
};
