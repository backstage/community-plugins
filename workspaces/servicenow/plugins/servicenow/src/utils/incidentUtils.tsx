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
import { ElementType, useMemo } from 'react';
import {
  RiAlertLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiListOrdered2,
  RiTimeLine,
  RiCheckLine,
  RiPauseLine,
} from '@remixicon/react';
import { ModerateIcon } from '../components/Servicenow/ModerateIcon';
import { InProgressIcon } from '../components/Servicenow/InProgressIcon';
import { ClosedIcon } from '../components/Servicenow/ClosedIcon';

import { useTranslation } from '../hooks/useTranslation';

export interface StatusData {
  Icon: ElementType;
  color: string;
  label: string;
  transform?: string;
}

/**
 * @deprecated Use usePriorityMap hook for translated labels
 */
export const PRIORITY_MAP: Record<number, StatusData> = {
  1: {
    Icon: RiAlertLine,
    color: '#C9190B',
    label: 'Critical',
    transform: 'rotate(-90deg)',
  },
  2: { Icon: RiArrowUpLine, color: '#EC7A08', label: 'High' },
  3: { Icon: ModerateIcon, color: '#F0AB00', label: 'Moderate' },
  4: { Icon: RiArrowDownLine, color: '#2B9AF3', label: 'Low' },
  5: { Icon: RiListOrdered2, color: '#6A6E73', label: 'Planning' },
};

/**
 * @deprecated Use useIncidentStateMap hook for translated labels
 */
export const INCIDENT_STATE_MAP: Record<number, StatusData> = {
  1: { Icon: RiTimeLine, color: '#6A6E73', label: 'New' },
  2: { Icon: InProgressIcon, color: '#6A6E73', label: 'In Progress' },
  3: { Icon: RiPauseLine, color: '#6A6E73', label: 'On Hold' },
  6: { Icon: RiCheckLine, color: '#3E8635', label: 'Resolved' },
  7: { Icon: ClosedIcon, color: '#6A6E73', label: 'Closed' },
  8: { Icon: ClosedIcon, color: '#6A6E73', label: 'Cancelled' },
};

/**
 * Hook to get translated priority map
 */
export const usePriorityMap = (): Record<number, StatusData> => {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      1: {
        Icon: RiAlertLine,
        color: '#C9190B',
        label: t('priority.critical'),
        transform: 'rotate(-90deg)',
      },
      2: {
        Icon: RiArrowUpLine,
        color: '#EC7A08',
        label: t('priority.high'),
      },
      3: {
        Icon: ModerateIcon,
        color: '#F0AB00',
        label: t('priority.moderate'),
      },
      4: {
        Icon: RiArrowDownLine,
        color: '#2B9AF3',
        label: t('priority.low'),
      },
      5: {
        Icon: RiListOrdered2,
        color: '#6A6E73',
        label: t('priority.planning'),
      },
    }),
    [t],
  );
};

/**
 * Hook to get translated incident state map
 */
export const useIncidentStateMap = (): Record<number, StatusData> => {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      1: {
        Icon: RiTimeLine,
        color: '#6A6E73',
        label: t('incidentState.new'),
      },
      2: {
        Icon: InProgressIcon,
        color: '#6A6E73',
        label: t('incidentState.inProgress'),
      },
      3: {
        Icon: RiPauseLine,
        color: '#6A6E73',
        label: t('incidentState.onHold'),
      },
      6: {
        Icon: RiCheckLine,
        color: '#3E8635',
        label: t('incidentState.resolved'),
      },
      7: {
        Icon: ClosedIcon,
        color: '#6A6E73',
        label: t('incidentState.closed'),
      },
      8: {
        Icon: ClosedIcon,
        color: '#6A6E73',
        label: t('incidentState.cancelled'),
      },
    }),
    [t],
  );
};

export const renderStatusLabel = (data?: StatusData) => {
  if (!data) return '';

  const { Icon, color, label, transform } = data;
  if (!Icon) return label;

  const iconProps = {
    size: 16,
    style: {
      color,
      marginRight: 8,
      flexShrink: 0,
      ...(transform ? { transform } : {}),
    },
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Icon {...iconProps} />
      <span style={{ marginLeft: '8px', color: 'var(--bui-fg-primary)' }}>
        {label}
      </span>
    </div>
  );
};

export const getPriorityValue = (priority: number) =>
  renderStatusLabel(PRIORITY_MAP[priority]);
export const getIncidentStateValue = (state: number) =>
  renderStatusLabel(INCIDENT_STATE_MAP[state]);
