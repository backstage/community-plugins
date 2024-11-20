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

type DeleteRoleProps = {
  roleName: string;
  disable: boolean;
  tooltip?: string;
  dataTestId: string;
};

const DeleteRole = ({
  roleName,
  tooltip,
  disable,
  dataTestId,
}: DeleteRoleProps) => {
  const { setDeleteComponent, setOpenDialog } = useDeleteDialog();

  const openDialog = (name: string) => {
    setDeleteComponent({ roleName: name });
    setOpenDialog(true);
  };

  return (
    <Tooltip title={tooltip || ''}>
      <Typography component="span" data-testid={dataTestId}>
        <IconButton
          color="inherit"
          onClick={() => openDialog(roleName)}
          aria-label="Delete"
          disabled={disable}
          title={tooltip || 'Delete Role'}
        >
          <Delete />
        </IconButton>
      </Typography>
    </Tooltip>
  );
};
export default DeleteRole;
