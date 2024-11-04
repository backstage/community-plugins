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

import { parseEntityRef } from '@backstage/catalog-model';
import { Table, WarningPanel } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import { Card, CardContent, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';

import { policyEntityUpdatePermission } from '@backstage-community/plugin-rbac-common';

import { MembersInfo } from '../../hooks/useMembers';
import { MembersData } from '../../types';
import { getMembers } from '../../utils/rbac-utils';
import EditRole from '../EditRole';
import { columns } from './MembersListColumns';

type MembersCardProps = {
  roleName: string;
  membersInfo: MembersInfo;
};

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const getRefreshIcon = () => <CachedIcon />;
const getEditIcon = (isAllowed: boolean, roleName: string) => {
  const { kind, name, namespace } = parseEntityRef(roleName);

  return (
    <EditRole
      dataTestId={isAllowed ? 'update-members' : 'disable-update-members'}
      roleName={roleName}
      disable={!isAllowed}
      to={`../../role/${kind}/${namespace}/${name}?activeStep=${1}`}
    />
  );
};

export const MembersCard = ({ roleName, membersInfo }: MembersCardProps) => {
  const { data, loading, retry, error, canReadUsersAndGroups } = membersInfo;
  const [members, setMembers] = React.useState<MembersData[]>();
  const policyEntityPermissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });

  const classes = useStyles();
  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: 'Refresh',
      isFreeAction: true,
      onClick: () => {
        retry.roleRetry();
        retry.membersRetry();
      },
    },
    {
      icon: () =>
        getEditIcon(
          policyEntityPermissionResult.allowed && canReadUsersAndGroups,
          roleName,
        ),
      tooltip:
        policyEntityPermissionResult.allowed && canReadUsersAndGroups
          ? 'Edit'
          : 'Unauthorized to edit',
      isFreeAction: true,
      onClick: () => {},
    },
  ];

  const onSearchResultsChange = (searchResults: MembersData[]) => {
    setMembers(searchResults);
  };

  return (
    <Card>
      <CardContent>
        {!loading && error && (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={(error as Error)?.message || (error as Error)?.name}
              title="Something went wrong while fetching the users and groups"
              severity="error"
            />
          </div>
        )}
        <Table
          title={
            !loading && data?.length
              ? `Users and groups (${getMembers(members || data)})`
              : 'Users and groups'
          }
          actions={actions}
          renderSummaryRow={summary => onSearchResultsChange(summary.data)}
          options={{ padding: 'default', search: true, paging: true }}
          data={data ?? []}
          isLoading={loading}
          columns={columns}
          emptyContent={
            <div data-testid="members-table-empty" className={classes.empty}>
              No records found
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};
