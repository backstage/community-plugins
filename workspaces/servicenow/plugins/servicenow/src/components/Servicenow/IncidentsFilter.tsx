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

import { useMemo, useCallback } from 'react';

import { SelectItem } from '@backstage/core-components';

import Box from '@mui/material/Box';

import { IncidentEnumFilter } from '../shared-components/IncidentEnumFilter';
import { INCIDENT_STATE_MAP, PRIORITY_MAP } from '../../utils/incidentUtils';
import { useQueryArrayFilter } from '../../hooks/useQueryArrayFilter';
import { useUpdateQueryParams } from '../../hooks/useQueryHelpers';

export const IncidentsFilter = () => {
  const stateFilter = useQueryArrayFilter('state');
  const priorityFilter = useQueryArrayFilter('priority');
  const updateQueryParams = useUpdateQueryParams();

  const stateValue = useMemo(() => stateFilter.current, [stateFilter]);
  const priorityValue = useMemo(() => priorityFilter.current, [priorityFilter]);

  const handleStateChange = useCallback(
    (_e: any, value: SelectItem[]) => {
      updateQueryParams({
        state: value.map(v => v.value).join(','),
        offset: '0',
      });
    },
    [updateQueryParams],
  );

  const handlePriorityChange = useCallback(
    (_e: any, value: SelectItem[]) => {
      updateQueryParams({
        priority: value.map(v => v.value).join(','),
        offset: '0',
      });
    },
    [updateQueryParams],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: { xs: 200, lg: 'auto' },
      }}
    >
      <IncidentEnumFilter
        label="State"
        filterKey="state"
        dataMap={INCIDENT_STATE_MAP}
        value={stateValue}
        onChange={handleStateChange}
      />
      <IncidentEnumFilter
        label="Priority"
        filterKey="priority"
        dataMap={PRIORITY_MAP}
        value={priorityValue}
        onChange={handlePriorityChange}
      />
    </Box>
  );
};
