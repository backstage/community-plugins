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

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { filterTableData } from '../../utils/filter-table-data';
import EditRole from '../EditRole';
import { getColumns } from './PermissionsListColumns';
import { StyledTableWrapper } from './StyledTableWrapper';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../hooks/useTranslation';
import { capitalizeFirstLetter } from '../../utils/string-utils';

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
  const { t } = useTranslation();
  const { data, loading, retry, error } =
    usePermissionPolicies(entityReference);
  const locale = useLanguage();
  const [searchText, setSearchText] = useState<string>();

  const columns = useMemo(() => getColumns(t), [t]);

  const numberOfPolicies = useMemo(() => {
    const filteredPermissions = filterTableData({
      data,
      columns,
      searchText,
      locale,
    });
    let policies = 0;
    filteredPermissions.forEach(p => {
      if (p.conditions) {
        policies++;
        return;
      }
      policies += p.policies.filter(pol => pol.effect === 'allow').length;
    });
    return policies;
  }, [data, searchText, columns, locale]);

  const actions = [
    {
      icon: getRefreshIcon,
      tooltip: t('common.refresh'),
      isFreeAction: true,
      onClick: () => {
        retry.permissionPoliciesRetry();
        retry.policiesRetry();
        retry.conditionalPoliciesRetry();
      },
    },
    {
      icon: () => getEditIcon(canReadUsersAndGroups, entityReference),
      tooltip: canReadUsersAndGroups
        ? t('common.edit')
        : t('common.unauthorizedToEdit'),
      isFreeAction: true,
      onClick: () => {},
    },
  ];

  let title = t('permissionPolicies.permissionPolicies');
  if (!loading && data.length > 0) {
    title = capitalizeFirstLetter(
      `${numberOfPolicies} ${numberOfPolicies !== 1 ? t('permissionPolicies.permissions') : t('permissionPolicies.permission')}`,
    );
  }

  return (
    <Box>
      {error?.name && error.name !== 404 && (
        <Box style={{ paddingBottom: '16px' }}>
          <WarningPanel
            message={error?.message}
            title={t('errors.fetchPolicies')}
            severity="error"
          />
        </Box>
      )}
      <StyledTableWrapper>
        <Table
          title={title}
          actions={actions}
          options={{ padding: 'default', search: true, paging: true }}
          data={data}
          columns={columns}
          isLoading={loading}
          emptyContent={
            <Box
              data-testid="permission-table-empty"
              sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            >
              {t('common.noRecordsFound')}
            </Box>
          }
          onSearchChange={setSearchText}
          localization={{
            toolbar: { searchPlaceholder: t('table.searchPlaceholder') },
            pagination: { labelRowsSelect: t('table.labelRowsSelect') },
          }}
        />
      </StyledTableWrapper>
    </Box>
  );
};
