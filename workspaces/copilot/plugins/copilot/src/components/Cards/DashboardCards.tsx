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
import React, { PropsWithChildren } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CodeIcon from '@mui/icons-material/Code';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { CardsProps } from '../../types';
import { styled } from '@mui/material/styles';
import { Metric } from '@backstage-community/plugin-copilot-common';

const CardBox = styled(Box)({
  flex: '1 1 calc(50% - 10px)',
  minWidth: 300,
  maxWidth: 'calc(50% - 10px)',
  boxSizing: 'border-box',
});

export const DashboardCards = ({
  team,
  metrics,
  metricsByTeam,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const sumProperty = (data: any[], property: string) =>
    data.reduce((acc, item) => acc + (item[property] || 0), 0);

  const calculateAcceptanceRate = (metricsData: Metric[]) => {
    const totalSuggested = sumProperty(metricsData, 'total_lines_suggested');
    const totalAccepted = sumProperty(metricsData, 'total_lines_accepted');
    return totalSuggested > 0
      ? ((totalAccepted / totalSuggested) * 100).toFixed(2).concat('%')
      : 'N/A';
  };

  const overallMetrics = {
    acceptanceRate: calculateAcceptanceRate(metrics),
    suggestionsCount:
      metrics.length > 0
        ? sumProperty(metrics, 'total_suggestions_count')
        : 'N/A',
    acceptancesCount:
      metrics.length > 0
        ? sumProperty(metrics, 'total_acceptances_count')
        : 'N/A',
    linesAccepted:
      metrics.length > 0 ? sumProperty(metrics, 'total_lines_accepted') : 'N/A',
  };

  const teamMetrics = {
    acceptanceRate: calculateAcceptanceRate(metricsByTeam),
    suggestionsCount:
      metricsByTeam.length > 0
        ? sumProperty(metricsByTeam, 'total_suggestions_count')
        : 'N/A',
    acceptancesCount:
      metricsByTeam.length > 0
        ? sumProperty(metricsByTeam, 'total_acceptances_count')
        : 'N/A',
    linesAccepted:
      metricsByTeam.length > 0
        ? sumProperty(metricsByTeam, 'total_lines_accepted')
        : 'N/A',
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between">
      <CardBox>
        <Card
          team={team}
          title="Acceptance Rate Average"
          primaryValue={
            team ? teamMetrics.acceptanceRate : overallMetrics.acceptanceRate
          }
          secondaryValue={team ? overallMetrics.acceptanceRate : undefined}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <CheckCircleIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          team={team}
          title="Nº of Suggestions"
          primaryValue={
            team
              ? teamMetrics.suggestionsCount
              : overallMetrics.suggestionsCount
          }
          secondaryValue={team ? overallMetrics.suggestionsCount : undefined}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <AssessmentIcon style={{ color: '#2196F3' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          team={team}
          title="Nº of Accepted Prompts"
          primaryValue={
            team
              ? teamMetrics.acceptancesCount
              : overallMetrics.acceptancesCount
          }
          secondaryValue={team ? overallMetrics.acceptancesCount : undefined}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <ThumbUpIcon style={{ color: '#FF9800' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          team={team}
          title="Nº Lines of Code Accepted"
          primaryValue={
            team ? teamMetrics.linesAccepted : overallMetrics.linesAccepted
          }
          secondaryValue={team ? overallMetrics.linesAccepted : undefined}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <CodeIcon style={{ color: '#FF5722' }} fontSize="large" />
          )}
        />
      </CardBox>
    </Box>
  );
};
