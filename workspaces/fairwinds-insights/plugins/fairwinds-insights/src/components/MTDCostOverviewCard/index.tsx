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
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

export const MTDCostOverviewCard = () => {
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
    return api.getCosts(entityRef);
  }, [entityRef, appGroups.join(',')]);

  if (appGroups.length === 0) {
    return (
      <InfoCard title="MTD Cost Overview">
        <MissingAnnotationEmptyState
          annotation="insights.fairwinds.com/app-groups"
          readMoreUrl="https://github.com/fairwindsops/backstage-plugin-fairwinds-insights#configuration"
        />
      </InfoCard>
    );
  }

  if (loading) {
    return (
      <InfoCard title="MTD Cost Overview">
        <Progress />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="MTD Cost Overview">
        <ResponseErrorPanel error={error} />
      </InfoCard>
    );
  }

  if (!value?.currentMtd || !value?.previousMtd) {
    return (
      <InfoCard title="MTD Cost Overview">
        <Typography>No cost data available</Typography>
      </InfoCard>
    );
  }

  const current = value.currentMtd.totalResourcesCost ?? 0;
  const previous = value.previousMtd.totalResourcesCost ?? 0;
  const percentChange =
    previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isDecrease = percentChange <= 0;

  return (
    <InfoCard
      title="MTD Cost Overview"
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
      <Box display="flex" flexDirection="column" alignItems="center" py={9}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Current MTD Cost
        </Typography>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          {formatCurrency(current)}
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          gap={1}
        >
          <Chip
            size="medium"
            icon={
              isDecrease ? (
                <TrendingDownIcon sx={{ fontSize: 20, marginLeft: 1.5 }} />
              ) : (
                <TrendingUpIcon sx={{ fontSize: 20, marginLeft: 1.5 }} />
              )
            }
            label={`${Math.abs(percentChange).toFixed(1)}%`}
            sx={{
              backgroundColor: isDecrease ? 'success.light' : 'error.light',
              color: isDecrease ? 'success.contrastText' : 'error.contrastText',
            }}
          />
          <Typography variant="body1" color="text.secondary">
            From Prev MTD
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(previous)}
          </Typography>
        </Box>
      </Box>
    </InfoCard>
  );
};
