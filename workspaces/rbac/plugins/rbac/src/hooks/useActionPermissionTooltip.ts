/*
 * Copyright 2025 The Backstage Authors
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

import { usePermission } from '@backstage/plugin-permission-react';
import { capitalizeFirstLetter } from '../utils/string-utils';
import { useTranslation } from './useTranslation';

export function useActionPermissionTooltip({
  permission,
  resourceRef,
  canAct,
  action,
  dataTestId,
  fallbackTooltip,
}: {
  permission: any;
  resourceRef: string;
  canAct: boolean;
  action?: string;
  dataTestId?: string;
  fallbackTooltip?: string;
}) {
  const { t } = useTranslation();
  const result = usePermission({ permission, resourceRef });

  const isLoading = result.loading;
  const isAllowed = result.allowed;
  const disable = !(isAllowed && canAct);

  let tooltipText: string;
  const actionText = action || t('common.performThisAction');

  if (isLoading) {
    tooltipText = t('common.checkingPermissions');
  } else if (disable) {
    tooltipText = t('common.unauthorizedTo' as any, { action: actionText });
  } else {
    tooltipText =
      fallbackTooltip ??
      t('common.roleAction' as any, {
        action: capitalizeFirstLetter(actionText),
      });
  }
  const testIdText = disable
    ? `disable-${actionText}-role-${resourceRef}`
    : `${actionText}-role-${resourceRef}`;

  return {
    isLoading,
    isAllowed,
    disable,
    tooltipText,
    testIdText: dataTestId ?? testIdText,
  };
}
