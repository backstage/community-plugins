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
import { ButtonIcon, Focusable, Tooltip, TooltipTrigger } from '@backstage/ui';
import { policyEntityUpdatePermission } from '@backstage-community/plugin-rbac-common';
import { RiEditLine } from '@remixicon/react';
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

  const button = (
    <ButtonIcon
      icon={<RiEditLine size={16} />}
      size="medium"
      variant="tertiary"
      aria-label={t('common.update')}
      isDisabled={disable}
      data-testid={testIdText}
      onPress={() => {
        navigate(to ?? `../role/${kind}/${namespace}/${name}`);
      }}
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

export default EditRole;
