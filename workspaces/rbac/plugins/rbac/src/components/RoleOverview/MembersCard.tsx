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
import { Table, WarningPanel } from '@backstage/core-components';

import CachedIcon from '@mui/icons-material/Cached';
import Box from '@mui/material/Box';

import { MembersInfo } from '../../hooks/useMembers';
import { filterTableData } from '../../utils/filter-table-data';
import { getMembers } from '../../utils/rbac-utils';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../hooks/useLanguage';
import EditRole from '../EditRole';
import { getColumns } from './MembersListColumns';
import { StyledTableWrapper } from './StyledTableWrapper';

type MembersCardProps = {
  roleName: string;
  membersInfo: MembersInfo;
};

const getRefreshIcon = () => <CachedIcon />;
const getEditIcon = (isAllowed: boolean, roleName: string) => {
  const { kind, name, namespace } = parseEntityRef(roleName);

  return (
    <EditRole
      dataTestId={isAllowed ? 'update-members' : 'disable-update-members'}
      canEdit={isAllowed}
      roleName={roleName}
      to={`../../role/${kind}/${namespace}/${name}?activeStep=${1}`}
    />
  );
};

export const MembersCard = ({ roleName, membersInfo }: MembersCardProps) => {
  const { t } = useTranslation();
  const locale = useLanguage();
  const { data, loading, retry, error, canReadUsersAndGroups } = membersInfo;
  const [searchText, setSearchText] = useState<string>();

  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: t('common.refresh'),
      isFreeAction: true,
      onClick: () => {
        retry.roleRetry();
        retry.membersRetry();
      },
    },
    {
      icon: () => getEditIcon(canReadUsersAndGroups, roleName),
      tooltip: canReadUsersAndGroups
        ? t('common.edit')
        : t('common.unauthorizedToEdit'),
      isFreeAction: true,
      onClick: () => {},
    },
  ];
  const columns = useMemo(() => getColumns(t), [t]);
  const filteredData = useMemo(
    () => filterTableData({ data, columns, searchText, locale }),
    [data, searchText, locale, columns],
  );

  return (
    <Box>
      {!loading && error && (
        <Box style={{ paddingBottom: '16px' }}>
          <WarningPanel
            message={(error as Error)?.message || (error as Error)?.name}
            title={t('errors.fetchUsersAndGroups')}
            severity="error"
          />
        </Box>
      )}
      <StyledTableWrapper>
        <Table
          title={
            !loading && data?.length
              ? `${getMembers(filteredData, t)}`
              : t('table.headers.usersAndGroups')
          }
          actions={actions}
          options={{ padding: 'default', search: true, paging: true }}
          data={data ?? []}
          isLoading={loading}
          columns={getColumns(t)}
          emptyContent={
            <Box
              data-testid="members-table-empty"
              sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            >
              {t('common.noRecordsFound')}
            </Box>
          }
          localization={{
            toolbar: { searchPlaceholder: t('table.searchPlaceholder') },
            pagination: { labelRowsSelect: t('table.labelRowsSelect') },
          }}
          onSearchChange={setSearchText}
        />
      </StyledTableWrapper>
    </Box>
  );
};
