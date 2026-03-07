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
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  SEVERITY_COLORS,
  type ActionItemsTopItem,
} from '@backstage-community/plugin-fairwinds-insights-common';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
const MAX_LABEL_LEN = 35;

function truncateLabel(s: string, max = MAX_LABEL_LEN): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** Returns unique band labels so MUI band scale doesn't collapse duplicate truncations into one band. */
function uniqueBandLabels(
  items: ActionItemsTopItem[],
  max = MAX_LABEL_LEN,
): string[] {
  const seen = new Map<string, number>();
  return items.map(r => {
    const base = truncateLabel(r.title, max);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function sortBySeverityOrder(
  items: ActionItemsTopItem[],
): ActionItemsTopItem[] {
  return [...items].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(
        a.title.toLowerCase() as (typeof SEVERITY_ORDER)[number],
      ) -
      SEVERITY_ORDER.indexOf(
        b.title.toLowerCase() as (typeof SEVERITY_ORDER)[number],
      ),
  );
}

function toTitleCase(str: string): string {
  const lowerStr = str.toLowerCase();
  const words = lowerStr.split(' ');
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** @public */
export const ActionItemsTopCard = () => {
  const { entity } = useEntity();
  const api = useFairwindsInsightsApi();

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
    return api.getActionItemsTop(entityRef);
  }, [entityRef, appGroups.join(',')]);

  if (appGroups.length === 0) {
    return (
      <InfoCard title="Action Items (Top)">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (loading) {
    return (
      <InfoCard title="Action Items (Top)">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Action Items (Top)">
        <ResponseErrorPanel error={error} />
      </InfoCard>
    );
  }

  if (!value) {
    return (
      <InfoCard title="Action Items (Top)">
        <Typography>No action items data available</Typography>
      </InfoCard>
    );
  }

  const topBySeverity = sortBySeverityOrder(value.topBySeverity ?? []);
  const topByTitle = (value.topByTitle ?? []).slice(0, 6);
  const topByNamespace = (value.topByNamespace ?? []).slice(0, 6);
  const topByResource = (value.topByResource ?? []).slice(0, 6);

  const hasData =
    topBySeverity.length > 0 ||
    topByTitle.length > 0 ||
    topByNamespace.length > 0 ||
    topByResource.length > 0;

  return (
    <InfoCard
      title="Action Items (Top)"
      action={
        value.insightsUrl && (
          <Link
            href={value.insightsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Insights
          </Link>
        )
      }
    >
      {!hasData ? (
        <Typography>No action items found</Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography
              variant="subtitle1"
              fontWeight="fontWeightMedium"
              gutterBottom
              align="center"
            >
              By Severity
            </Typography>
            {topBySeverity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No data
              </Typography>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 220,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <PieChart
                  width={400}
                  height={220}
                  margin={{ top: 10, right: 30, bottom: 20, left: 20 }}
                  series={[
                    {
                      data: topBySeverity.map((r: ActionItemsTopItem) => ({
                        id: toTitleCase(r.title),
                        value: r.count,
                        label: toTitleCase(r.title),
                        color: SEVERITY_COLORS[r.title.toUpperCase()],
                      })),
                      innerRadius: '55%',
                      outerRadius: '90%',
                      arcLabel: 'value',
                      arcLabelMinAngle: 10,
                    },
                  ]}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography
              variant="subtitle1"
              fontWeight="fontWeightMedium"
              gutterBottom
              align="center"
            >
              Top Issues
            </Typography>
            {topByTitle.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No data
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 220 }}>
                <BarChart
                  barLabel={(item, _) =>
                    truncateLabel(topByTitle[item.dataIndex].title)
                  }
                  layout="horizontal"
                  yAxis={[
                    {
                      scaleType: 'band',
                      data: topByTitle.map((r: ActionItemsTopItem) =>
                        truncateLabel(r.title),
                      ),
                      tickInterval: () => false,
                    },
                  ]}
                  series={[
                    {
                      data: topByTitle.map((r: ActionItemsTopItem) => r.count),
                    },
                  ]}
                  height={220}
                  margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography
              variant="subtitle1"
              fontWeight="fontWeightMedium"
              gutterBottom
              align="center"
            >
              Top Namespaces
            </Typography>
            {topByNamespace.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No data
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 220 }}>
                <BarChart
                  barLabel={(item, _) =>
                    truncateLabel(topByNamespace[item.dataIndex].title)
                  }
                  layout="horizontal"
                  yAxis={[
                    {
                      scaleType: 'band',
                      data: topByNamespace.map((r: ActionItemsTopItem) =>
                        truncateLabel(r.title),
                      ),
                      tickInterval: () => false,
                    },
                  ]}
                  series={[
                    {
                      data: topByNamespace.map(
                        (r: ActionItemsTopItem) => r.count,
                      ),
                    },
                  ]}
                  height={220}
                  margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography
              variant="subtitle1"
              fontWeight="fontWeightMedium"
              gutterBottom
              align="center"
            >
              Top Workloads
            </Typography>
            {topByResource.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No data
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 220 }}>
                <BarChart
                  barLabel={(item, _) =>
                    truncateLabel(topByResource[item.dataIndex].title)
                  }
                  layout="horizontal"
                  yAxis={[
                    {
                      scaleType: 'band',
                      data: uniqueBandLabels(topByResource),
                      tickInterval: () => false,
                    },
                  ]}
                  series={[
                    {
                      data: topByResource.map(
                        (r: ActionItemsTopItem) => r.count,
                      ),
                    },
                  ]}
                  height={220}
                  margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
                  slotProps={{
                    legend: { hidden: true },
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      )}
    </InfoCard>
  );
};
