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
import { Box, Text } from '@backstage/ui';
import useAsync from 'react-use/esm/useAsync';
import { Progress } from '@backstage/core-components';
import { IncidentListItem } from './IncidentListItem';
import { IncidentsEmptyState } from './IncidentEmptyState';
import { splunkOnCallApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import styles from './Incidents.module.css';
import React from 'react';

type Props = {
  team: string;
  readOnly?: boolean;
  refreshIncidents?: boolean;
};

export const Incidents = ({
  team,
  readOnly = false,
  refreshIncidents,
}: Props) => {
  const api = useApi(splunkOnCallApiRef);
  const [incidentsRefreshCounter, setIncidentsRefreshCounter] =
    React.useState(0);

  const {
    value: incidents,
    loading,
    error,
  } = useAsync(async () => {
    const allIncidents = await api.getIncidents();
    // Filter incidents by team - check if team is in pagedTeams array
    return allIncidents.filter(
      incident => incident.pagedTeams && incident.pagedTeams.includes(team),
    );
  }, [team, refreshIncidents, incidentsRefreshCounter]);

  if (error) {
    return (
      <Box>
        <Text>
          Error encountered while fetching information. {error.message}
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Box className={styles.root}>
        {!loading && <div className={styles.header}>INCIDENTS</div>}
        {loading && <Progress style={{ margin: 'var(--bui-space-4)' }} />}
        {!loading &&
          incidents &&
          incidents.length > 0 &&
          incidents.map(incident => (
            <IncidentListItem
              key={incident.entityId}
              incident={incident}
              readOnly={readOnly}
              onIncidentUpdated={() => setIncidentsRefreshCounter(c => c + 1)}
            />
          ))}
        {!loading && (!incidents || incidents.length === 0) && (
          <IncidentsEmptyState />
        )}
      </Box>
    </>
  );
};
