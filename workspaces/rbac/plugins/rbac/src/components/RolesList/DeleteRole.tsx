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

import { useDeleteDialog } from '@janus-idp/shared-react';
import Delete from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { policyEntityDeletePermission } from '@backstage-community/plugin-rbac-common';
import { usePermission } from '@backstage/plugin-permission-react';

type DeleteRoleProps = {
  roleName: string;
  canEdit: boolean;
  dataTestId?: string;
  tooltip?: string;
};

const DeleteRole = ({
  roleName,
  canEdit,
  dataTestId,
  tooltip,
}: DeleteRoleProps) => {
  const { setDeleteComponent, setOpenDialog } = useDeleteDialog();

  const openDialog = (name: string) => {
    setDeleteComponent({ roleName: name });
    setOpenDialog(true);
  };

  const deletePermissionResult = usePermission({
    permission: policyEntityDeletePermission,
    resourceRef: roleName,
  });

  const disable = !(deletePermissionResult.allowed && canEdit);
  const dataTestIdText = disable
    ? `disable-delete-role-${roleName}`
    : `delete-role-${roleName}`;
  const tooltipText = disable ? 'Role cannot be deleted' : '';

  return (
    <Tooltip title={tooltip ?? tooltipText}>
      <Typography component="span" data-testid={dataTestId ?? dataTestIdText}>
        <IconButton
          onClick={() => openDialog(roleName)}
          aria-label="Delete"
          disabled={disable}
          title={tooltip ?? 'Delete Role'}
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          sx={{ '&:hover': { borderRadius: '50%' } }}
        >
          <Delete />
        </IconButton>
      </Typography>
    </Tooltip>
  );
};
export default DeleteRole;
