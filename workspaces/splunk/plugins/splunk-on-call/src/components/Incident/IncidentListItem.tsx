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
} from '@remixicon/react';
import { Incident } from '../types';
import styles from './IncidentListItem.module.css';

type Props = {
  incident: Incident;
  readOnly: boolean;
};

export const IncidentListItem = ({ incident, readOnly }: Props) => {
  const statusIcon = () => {
    if (incident.currentPhase === 'ACKED') {
      return <RiCheckLine size={20} />;
    }
    if (incident.currentPhase === 'RESOLVED') {
      return <RiCheckDoubleLine size={20} />;
    }
    return null;
  };

  return (
    <Flex
      align="center"
      style={{
        padding: 'var(--bui-space-2) 0',
        borderBottom: '1px solid var(--bui-border-1)',
      }}
    >
      <div className={styles.denseListIcon}>{statusIcon()}</div>
      <Flex direction="column" style={{ flex: 1 }}>
        <Text className={styles.listItemPrimary}>
          {incident.incidentNumber}
        </Text>
        <Text variant="body-small" color="secondary">
          {incident.entityDisplayName || incident.service || 'Incident'}
        </Text>
      </Flex>
      {!readOnly && (
        <TooltipTrigger>
          <ButtonIcon
            variant="secondary"
            icon={<RiExternalLinkLine size={16} />}
            aria-label="view incident"
            onPress={() =>
              incident.incidentLink &&
              window.open(incident.incidentLink, '_blank')
            }
          />
          <Tooltip>View incident</Tooltip>
        </TooltipTrigger>
      )}
    </Flex>
  );
};
