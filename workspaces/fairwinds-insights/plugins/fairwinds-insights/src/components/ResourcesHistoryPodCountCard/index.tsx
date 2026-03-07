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

/** @public */
export const ResourcesHistoryPodCountCard = () => {
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
      <InfoCard title="Pod Count">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (loading) {
    return (
      <InfoCard title="Pod Count">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Pod Count">
        <ResponseErrorPanel error={error} />
      </InfoCard>
    );
  }

  if (!value || !value.dates?.length) {
    return (
      <InfoCard title="Pod Count">
        <Typography>
          No pod count data available for the selected range
        </Typography>
      </InfoCard>
    );
  }

  const xAxisDates = value.dates.map(formatChartDate);

  return (
    <InfoCard
      title="Pod Count"
      action={
        <>
          <FormControl
            size="small"
            sx={{ minWidth: 140, mt: 1.5 }}
            variant="outlined"
          >
            <InputLabel id="pod-count-date-preset-label">Date range</InputLabel>
            <Select
              labelId="pod-count-date-preset-label"
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
          series={[
            {
              data: value.podCount.avg,
              label: 'Avg',
              color: '#9368b0',
              curve: 'catmullRom' as const,
              connectNulls: true,
              valueFormatter: (v: number | null) =>
                v !== null ? `${(Math.round(v * 2) / 2).toFixed(1)} pods` : '',
            },
          ]}
          yAxis={[{ label: 'Pods' }]}
          height={280}
          margin={{ top: 20, right: 30, bottom: 70, left: 50 }}
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
