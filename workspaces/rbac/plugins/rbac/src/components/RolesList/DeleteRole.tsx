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

import Delete from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { policyEntityDeletePermission } from '@backstage-community/plugin-rbac-common';
import { useActionPermissionTooltip } from '../../hooks/useActionPermissionTooltip';
import { useDeleteDialog } from '../DeleteDialogContext';
import { useTranslation } from '../../hooks/useTranslation';

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
  const { t } = useTranslation();
  const { setDeleteComponent, setOpenDialog } = useDeleteDialog();

  const openDialog = (name: string) => {
    setDeleteComponent({ roleName: name });
    setOpenDialog(true);
  };

  const { disable, tooltipText, testIdText } = useActionPermissionTooltip({
    permission: policyEntityDeletePermission,
    resourceRef: roleName,
    canAct: canEdit,
    action: 'delete',
    dataTestId: dataTestId,
    fallbackTooltip: tooltip,
  });

  return (
    <Tooltip title={tooltipText}>
      <IconButton
        onClick={() => openDialog(roleName)}
        data-testid={testIdText}
        aria-label={t('common.delete')}
        disabled={disable}
        title={tooltip ?? t('common.deleteRole')}
        sx={{
          p: 1,
          borderRadius: '50%',
          '&:hover': { borderRadius: '50%' },
        }}
      >
        <Delete />
      </IconButton>
    </Tooltip>
  );
};
export default DeleteRole;
