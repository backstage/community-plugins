/*
 * Copyright 2026 The Backstage Authors
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
import type { MouseEvent, ReactNode } from 'react';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useTranslation } from '../../hooks/useTranslation';

interface TableActionDef {
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
  icon?: (props: Record<string, unknown>) => ReactNode;
  iconProps?: Record<string, unknown>;
  onClick?: (event: MouseEvent, data?: unknown) => void;
  customComponent?: boolean;
  action?: (data: unknown) => TableActionDef;
}

interface TableActionProps {
  action: TableActionDef | ((data?: unknown) => TableActionDef);
  data?: unknown;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const TableAction = (props: TableActionProps) => {
  const { t } = useTranslation();

  let action: TableActionDef | undefined = undefined;
  if (typeof props.action === 'function') {
    action = props.action(props.data);
  } else {
    action = props.action;
  }
  if (action?.action) {
    action = action.action(props.data);
  }
  if (!action || action.hidden) {
    return null;
  }

  const disabled = action.disabled || props.disabled;
  const icon =
    typeof action.icon === 'function'
      ? action.icon({ ...action.iconProps, disabled })
      : null;

  // Render directly when the icon is already a complete interactive element
  // to avoid nested interactive controls (WCAG 4.1.2)
  if (action.customComponent) {
    return <>{icon}</>;
  }

  const handleClick = (event: MouseEvent) => {
    if (action.onClick) {
      action.onClick(event, props.data);
      event.stopPropagation();
    }
  };

  const button = (
    <IconButton
      size={props.size}
      color="inherit"
      aria-label={
        typeof action.tooltip === 'string'
          ? action.tooltip
          : t('common.tableAction')
      }
      disabled={disabled}
      onClick={handleClick}
    >
      {icon}
    </IconButton>
  );

  if (action.tooltip) {
    return disabled ? (
      <Tooltip title={action.tooltip}>
        <span>{button}</span>
      </Tooltip>
    ) : (
      <Tooltip title={action.tooltip}>{button}</Tooltip>
    );
  }

  return button;
};
