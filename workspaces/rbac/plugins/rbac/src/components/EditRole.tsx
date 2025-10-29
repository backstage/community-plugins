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
import { parseEntityRef } from '@backstage/catalog-model';

import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { policyEntityUpdatePermission } from '@backstage-community/plugin-rbac-common';
import { useNavigate } from 'react-router-dom';
import { useActionPermissionTooltip } from '../hooks/useActionPermissionTooltip';
import { useTranslation } from '../hooks/useTranslation';

type EditRoleProps = {
  roleName: string;
  canEdit: boolean;
  dataTestId?: string;
  tooltip?: string;
  to?: string;
};

const EditRole = ({
  roleName,
  canEdit,
  dataTestId,
  tooltip,
  to,
}: EditRoleProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { name, namespace, kind } = parseEntityRef(roleName);

  const { disable, tooltipText, testIdText } = useActionPermissionTooltip({
    permission: policyEntityUpdatePermission,
    resourceRef: roleName,
    canAct: canEdit,
    action: 'edit',
    dataTestId: dataTestId,
    fallbackTooltip: tooltip,
  });

  return (
    <Tooltip title={tooltipText}>
      <IconButton
        onClick={() => {
          navigate(to ?? `../role/${kind}/${namespace}/${name}`);
        }}
        data-testid={testIdText}
        aria-label={t('common.update')}
        disabled={disable}
        title={tooltip ?? t('common.editRole')}
        sx={{
          p: 1,
          borderRadius: '50%',
          '&:hover': { borderRadius: '50%' },
        }}
      >
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};

export default EditRole;
