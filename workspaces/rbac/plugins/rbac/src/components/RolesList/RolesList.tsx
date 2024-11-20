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

import { Progress, Table, WarningPanel } from '@backstage/core-components';

import { useDeleteDialog } from '@janus-idp/shared-react';
import Box from '@mui/material/Box';

import { useCheckIfLicensePluginEnabled } from '../../hooks/useCheckIfLicensePluginEnabled';
import { useLocationToast } from '../../hooks/useLocationToast';
import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
import DownloadCSVLink from '../DownloadUserStatistics';
import { SnackbarAlert } from '../SnackbarAlert';
import { useToast } from '../ToastContext';
import DeleteRoleDialog from './DeleteRoleDialog';
import { columns } from './RolesListColumns';
import { RolesListToolbar } from './RolesListToolbar';

export const RolesList = () => {
  const { toastMessage, setToastMessage } = useToast();
  const { openDialog, setOpenDialog, deleteComponent } = useDeleteDialog();
  useLocationToast(setToastMessage);
  const [roles, setRoles] = React.useState<number | undefined>();
  const { loading, data, retry, createRoleAllowed, createRoleLoading, error } =
    useRoles();

  const closeDialog = () => {
    setOpenDialog(false);
    retry.roleRetry();
    retry.policiesRetry();
  };

  const onAlertClose = () => {
    setToastMessage('');
  };
  const onSearchResultsChange = (searchResults: RolesData[]) => {
    setRoles(searchResults.length);
  };

  const getErrorWarning = () => {
    const errorTitleBase = 'Something went wrong while fetching the';
    const errorWarningArr = [
      { message: error?.rolesError, title: `${errorTitleBase} roles` },
      {
        message: error?.policiesError,
        title: `${errorTitleBase} permission policies`,
      },
      {
        message: error?.roleConditionError,
        title: `${errorTitleBase} role conditions`,
      },
    ];

    return (
      errorWarningArr.find(({ message }) => message) || {
        message: '',
        title: '',
      }
    );
  };

  const errorWarning = getErrorWarning();

  const isLicensePluginEnabled = useCheckIfLicensePluginEnabled();
  if (isLicensePluginEnabled.loading) {
    return <Progress />;
  }

  return (
    <>
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={onAlertClose} />
      <RolesListToolbar
        createRoleAllowed={createRoleAllowed}
        createRoleLoading={createRoleLoading}
      />
      {errorWarning.message && (
        <div style={{ paddingBottom: '16px' }}>
          <WarningPanel
            message={errorWarning.message}
            title={errorWarning.title}
            severity="error"
          />
        </div>
      )}
      <Table
        title={
          !loading && data?.length
            ? `All roles (${roles ?? data.length})`
            : `All roles`
        }
        options={{ padding: 'default', search: true, paging: true }}
        data={data}
        isLoading={loading}
        columns={columns}
        renderSummaryRow={summary => onSearchResultsChange(summary.data)}
        emptyContent={
          <Box
            data-testid="roles-table-empty"
            sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
          >
            No records found
          </Box>
        }
      />
      {isLicensePluginEnabled.isEnabled && <DownloadCSVLink />}
      {openDialog && (
        <DeleteRoleDialog
          open={openDialog}
          closeDialog={closeDialog}
          roleName={deleteComponent.roleName}
          propOptions={{
            memberRefs:
              data.find(d => d.name === deleteComponent.roleName)?.members ||
              [],
            permissions:
              data.find(d => d.name === deleteComponent.roleName)
                ?.permissions || 0,
          }}
        />
      )}
    </>
  );
};
