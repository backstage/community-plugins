/*
 * Copyright 2020 The Backstage Authors
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
import { Flex, Text, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import {
  RiCheckLine,
  RiCheckDoubleLine,
  RiExternalLinkLine,
  RiCheckboxBlankCircleLine,
} from '@remixicon/react';
import { Incident } from '../types';
import styles from './IncidentListItem.module.css';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { splunkOnCallApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { toastApiRef } from '@backstage/frontend-plugin-api';

type Props = {
  incident: Incident;
  readOnly?: boolean;
  onIncidentUpdated?: () => void;
};

export const IncidentListItem = ({
  incident,
  readOnly = false,
  onIncidentUpdated,
}: Props) => {
  const api = useApi(splunkOnCallApiRef);
  const toastApi = useApi(toastApiRef);

  const [{ loading: acknowledgeLoading }, acknowledgeIncident] = useAsyncFn(
    async () => {
      await api.incidentAction({
        incidentNumber: incident.incidentNumber,
        action: 'acknowledge',
      } as any);
      toastApi.post({ title: 'Incident acknowledged' });
      onIncidentUpdated?.();
    },
  );

  const [{ loading: resolveLoading }, resolveIncident] = useAsyncFn(
    async () => {
      await api.incidentAction({
        incidentNumber: incident.incidentNumber,
        action: 'resolve',
      } as any);
      toastApi.post({ title: 'Incident resolved' });
      onIncidentUpdated?.();
    },
  );

  const getStatusLabel = () => {
    switch (incident.currentPhase) {
      case 'ACKED':
        return 'Acknowledged';
      case 'RESOLVED':
        return 'Resolved';
      default:
        return 'Unacknowledged';
    }
  };

  const statusIcon = () => {
    if (incident.currentPhase === 'ACKED') {
      return <RiCheckLine size={20} />;
    }
    if (incident.currentPhase === 'RESOLVED') {
      return <RiCheckDoubleLine size={20} />;
    }
    return <RiCheckboxBlankCircleLine size={20} />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Flex
      direction="column"
      style={{
        padding: 'var(--bui-space-2) 0',
        borderBottom: '1px solid var(--bui-border-1)',
        gap: 'var(--bui-space-2)',
      }}
    >
      <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
        <TooltipTrigger>
          <div
            className={styles.denseListIcon}
            aria-label="Status warning"
            title={getStatusLabel()}
            role="img"
          >
            {statusIcon()}
          </div>
          <Tooltip>{getStatusLabel()}</Tooltip>
        </TooltipTrigger>
        <Flex direction="column" style={{ flex: 1 }}>
          <Text className={styles.listItemPrimary}>
            {incident.incidentNumber}
          </Text>
          <Text variant="body-small" color="secondary">
            {incident.entityDisplayName || incident.service || 'Incident'}
          </Text>
          {incident.monitorName && (
            <Text variant="body-small" color="secondary">
              {incident.monitorName}
            </Text>
          )}
        </Flex>
        <div style={{ display: 'flex', gap: 'var(--bui-space-1)' }}>
          <div title="View in Splunk On-Call">
            <TooltipTrigger>
              <ButtonIcon
                variant="secondary"
                icon={<RiExternalLinkLine size={16} />}
                aria-label="view incident"
                onClick={() =>
                  incident.incidentLink &&
                  window.open(
                    incident.incidentLink,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              />
              <Tooltip>View in Splunk On-Call</Tooltip>
            </TooltipTrigger>
          </div>
          {!readOnly && incident.currentPhase !== 'ACKED' && (
            <div title="Acknowledge">
              <TooltipTrigger>
                <ButtonIcon
                  variant="secondary"
                  icon={<RiCheckLine size={16} />}
                  aria-label="acknowledge"
                  isDisabled={acknowledgeLoading}
                  onClick={acknowledgeIncident}
                />
                <Tooltip>Acknowledge</Tooltip>
              </TooltipTrigger>
            </div>
          )}
          {!readOnly && incident.currentPhase !== 'RESOLVED' && (
            <div title="Resolve">
              <TooltipTrigger>
                <ButtonIcon
                  variant="secondary"
                  icon={<RiCheckDoubleLine size={16} />}
                  aria-label="resolve"
                  isDisabled={resolveLoading}
                  onClick={resolveIncident}
                />
                <Tooltip>Resolve</Tooltip>
              </TooltipTrigger>
            </div>
          )}
        </div>
      </Flex>
      <Flex style={{ gap: 'var(--bui-space-3)' }}>
        {incident.startTime && (
          <Text
            variant="body-small"
            color="secondary"
            style={{ fontSize: '0.75rem' }}
          >
            Started: {formatDate(incident.startTime)}
          </Text>
        )}
        {incident.lastAlertTime && (
          <Text
            variant="body-small"
            color="secondary"
            style={{ fontSize: '0.75rem' }}
          >
            Last alert: {formatDate(incident.lastAlertTime)}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
