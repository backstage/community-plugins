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

import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import { useFairwindsInsightsApi } from '../../api';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LineChart } from '@mui/x-charts/LineChart';
import { useState } from 'react';
import {
  RESOURCES_SUMMARY_TIMESERIES_DATE_PRESETS,
  type ResourcesSummaryTimeseriesDatePreset,
} from '@backstage-community/plugin-fairwinds-insights-common';

function formatChartDate(isoDate: string): string {
  const d = new Date(isoDate);
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${m}/${day}`;
}

const MEMORY_SERIES = [
  {
    key: 'minUsage' as const,
    label: 'Min Usage',
    color: '#9368b0',
    dashed: false,
  },
  {
    key: 'avgUsage' as const,
    label: 'Avg Usage',
    color: '#d44e6c',
    dashed: false,
  },
  {
    key: 'maxUsage' as const,
    label: 'Max Usage',
    color: '#8b2942',
    dashed: false,
  },
  {
    key: 'recommendedLimits' as const,
    label: 'Recommended Limits',
    color: '#4caf50',
    dashed: true,
  },
  {
    key: 'recommendedRequests' as const,
    label: 'Recommended Requests',
    color: '#ff9800',
    dashed: true,
  },
  {
    key: 'actualLimits' as const,
    label: 'Actual Limits',
    color: '#1976d2',
    dashed: true,
  },
  {
    key: 'actualRequests' as const,
    label: 'Actual Requests',
    color: '#5c6bc0',
    dashed: true,
  },
];

export const ResourcesHistoryMemoryCard = () => {
  const { entity } = useEntity();
  const api = useFairwindsInsightsApi();
  const [datePreset, setDatePreset] =
    useState<ResourcesSummaryTimeseriesDatePreset>('30d');

  const appGroupsAnnotation =
    entity.metadata.annotations?.['insights.fairwinds.com/app-groups'];
  const appGroupsSpec =
    (entity.spec as any)?.['app-groups'] || (entity.spec as any)?.['app-group'];
  const appGroupsValue = appGroupsAnnotation || appGroupsSpec;
  const appGroups = appGroupsValue
    ? appGroupsValue
        .split(',')
        .map((g: string) => g.trim())
        .filter((g: string) => g.length > 0)
    : [];

  const entityRef = stringifyEntityRef(entity);

  const { value, loading, error } = useAsync(async () => {
    if (appGroups.length === 0) return null;
    return api.getResourcesSummaryTimeseries(entityRef, datePreset);
  }, [entityRef, datePreset, appGroups.join(',')]);

  if (appGroups.length === 0) {
    return (
      <InfoCard title="Memory">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (loading) {
    return (
      <InfoCard title="Memory">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Memory">
        <ResponseErrorPanel error={error} />
      </InfoCard>
    );
  }

  if (!value || !value.dates?.length) {
    return (
      <InfoCard title="Memory">
        <Typography>No memory data available for the selected range</Typography>
      </InfoCard>
    );
  }

  const xAxisDates = value.dates.map(formatChartDate);
  const series = MEMORY_SERIES.map(s => ({
    data: value.memory[s.key],
    label: s.label,
    color: s.color,
    curve: 'catmullRom' as const,
    connectNulls: true,
    ...(s.dashed ? { lineStyle: { strokeDasharray: '5 5' } } : {}),
    valueFormatter: (v: number | null) =>
      v !== null ? `${(Math.round(v * 2) / 2).toFixed(2)} GB` : '',
  }));

  return (
    <InfoCard
      title="Memory"
      action={
        <>
          <FormControl
            size="small"
            sx={{ minWidth: 140, mt: 1.5 }}
            variant="outlined"
          >
            <InputLabel id="memory-date-preset-label">Date range</InputLabel>
            <Select
              labelId="memory-date-preset-label"
              value={datePreset}
              onChange={e =>
                setDatePreset(
                  e.target.value as ResourcesSummaryTimeseriesDatePreset,
                )
              }
              label="Date range"
            >
              {RESOURCES_SUMMARY_TIMESERIES_DATE_PRESETS.map(p => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {value.insightsUrl && (
            <Link
              href={value.insightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 1 }}
            >
              View in Insights
            </Link>
          )}
        </>
      }
    >
      <Box sx={{ width: '100%', minHeight: 280 }}>
        <LineChart
          xAxis={[{ data: xAxisDates, scaleType: 'point', id: 'dates' }]}
          series={series}
          yAxis={[{ label: 'Memory (GB)' }]}
          height={280}
          margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
            },
          }}
        />
      </Box>
    </InfoCard>
  );
};
