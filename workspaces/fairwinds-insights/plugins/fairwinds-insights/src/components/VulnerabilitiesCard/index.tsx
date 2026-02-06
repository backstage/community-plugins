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
  type VulnerabilitiesTopItem,
} from '@backstage-community/plugin-fairwinds-insights-common';

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const MAX_LABEL_LEN = 35;

function truncateLabel(s: string, max = MAX_LABEL_LEN): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function sortBySeverityOrder(
  items: VulnerabilitiesTopItem[],
): VulnerabilitiesTopItem[] {
  return [...items].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.title as (typeof SEVERITY_ORDER)[number]) -
      SEVERITY_ORDER.indexOf(b.title as (typeof SEVERITY_ORDER)[number]),
  );
}

function toTitleCase(str: string): string {
  const lowerStr = str.toLowerCase();
  const words = lowerStr.split(' ');
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const VulnerabilitiesCard = () => {
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
    return api.getVulnerabilities(entityRef);
  }, [entityRef, appGroups.join(',')]);

  if (appGroups.length === 0) {
    return (
      <InfoCard title="Vulnerabilities">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (loading) {
    return (
      <InfoCard title="Vulnerabilities">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Vulnerabilities">
        <ResponseErrorPanel error={error} />
      </InfoCard>
    );
  }

  if (!value) {
    return (
      <InfoCard title="Vulnerabilities">
        <Typography>No vulnerability data available</Typography>
      </InfoCard>
    );
  }

  const topImages = (value.topByTitle || []).slice(0, 5);
  const severityData = sortBySeverityOrder(value.topBySeverity || []);
  const topPackages = (value.topByPackage || []).slice(0, 5);

  return (
    <InfoCard
      title="Vulnerabilities"
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
      {value.total === 0 ? (
        <Typography>No vulnerabilities found</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="fontWeightMedium"
                gutterBottom
                align="center"
              >
                Top Impacted Images
              </Typography>
              {topImages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 220 }}>
                  <BarChart
                    barLabel={(item, _) =>
                      truncateLabel(topImages[item.dataIndex].title)
                    }
                    layout="horizontal"
                    yAxis={[
                      {
                        scaleType: 'band',
                        data: topImages.map(
                          (r: VulnerabilitiesTopItem) => r.title,
                        ),
                        tickInterval: () => false,
                      },
                    ]}
                    series={[
                      {
                        data: topImages.map(
                          (r: VulnerabilitiesTopItem) => r.count,
                        ),
                      },
                    ]}
                    height={220}
                    margin={{ top: 10, right: 10, bottom: 20, left: 20 }}
                    slotProps={{
                      legend: { hidden: true },
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="fontWeightMedium"
                gutterBottom
                align="center"
              >
                Severity Breakdown
              </Typography>
              {severityData.length === 0 ? (
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
                    height={220}
                    width={380}
                    margin={{ top: 10, right: 30, bottom: 20, left: 20 }}
                    series={[
                      {
                        data: severityData.map((r: VulnerabilitiesTopItem) => ({
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

            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle1"
                fontWeight="fontWeightMedium"
                gutterBottom
                align="center"
              >
                Top Impacted Packages
              </Typography>
              {topPackages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No data
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 220 }}>
                  <BarChart
                    barLabel={(item, _) =>
                      truncateLabel(topPackages[item.dataIndex].title)
                    }
                    layout="horizontal"
                    yAxis={[
                      {
                        scaleType: 'band',
                        data: topPackages.map(
                          (r: VulnerabilitiesTopItem) => r.title,
                        ),
                        tickInterval: () => false,
                      },
                    ]}
                    series={[
                      {
                        data: topPackages.map(
                          (r: VulnerabilitiesTopItem) => r.count,
                        ),
                      },
                    ]}
                    height={220}
                    margin={{ top: 10, right: 10, bottom: 20, left: 20 }}
                    slotProps={{
                      legend: { hidden: true },
                    }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>

          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Total: {value.total} vulnerabilities
            </Typography>
          </Box>
        </>
      )}
    </InfoCard>
  );
};
