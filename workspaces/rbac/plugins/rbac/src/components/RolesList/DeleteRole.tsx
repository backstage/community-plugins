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
import { ButtonIcon, Focusable, Tooltip, TooltipTrigger } from '@backstage/ui';
import { policyEntityDeletePermission } from '@backstage-community/plugin-rbac-common';
import { RiDeleteBinLine } from '@remixicon/react';

import { useActionPermissionTooltip } from '../../hooks/useActionPermissionTooltip';
import { useTranslation } from '../../hooks/useTranslation';
import { useDeleteDialog } from '../DeleteDialogContext';

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

  const button = (
    <ButtonIcon
      icon={<RiDeleteBinLine size={16} />}
      variant="tertiary"
      size="medium"
      aria-label={t('common.delete')}
      isDisabled={disable}
      data-testid={testIdText}
      onPress={() => openDialog(roleName)}
    />
  );

  return (
    <TooltipTrigger delay={0}>
      {disable ? (
        <Focusable>
          <span style={{ display: 'inline-flex', cursor: 'not-allowed' }}>
            {button}
          </span>
        </Focusable>
      ) : (
        button
      )}
      <Tooltip>{tooltipText}</Tooltip>
    </TooltipTrigger>
  );
};
export default DeleteRole;
