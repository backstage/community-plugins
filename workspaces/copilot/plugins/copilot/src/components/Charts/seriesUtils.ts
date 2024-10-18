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
import { Metric } from '@backstage-community/plugin-copilot-common';

const addSeriesIfTeam = (
  series: any[],
  condition: boolean,
  seriesConfig: any,
) => {
  if (condition) {
    return series.push(seriesConfig);
  }
  return series;
};

export const createAcceptanceRateSeries = (
  metrics: Metric[],
  metricsByTeam: Metric[],
  team?: string,
) => {
  const series = [
    {
      id: 'total_lines_suggested',
      label: 'Acceptance Rate (Overall)',
      valueFormatter: (v: number | null) => v?.toFixed(2).concat('%') ?? 'N/A',
      data: metrics.map(
        x => (x.total_lines_accepted / x.total_lines_suggested) * 100,
      ),
    },
  ];

  addSeriesIfTeam(series, !!team, {
    id: 'total_lines_suggested_by_team',
    label: `Acceptance Rate (${team})`,
    valueFormatter: (v: number | null) => v?.toFixed(2).concat('%') ?? 'N/A',
    data: metrics.map(metric => {
      const metricByteam = metricsByTeam.find(
        teamMetric => teamMetric.day === metric.day,
      );

      if (!metricByteam) return null;

      return (
        (metricByteam.total_lines_accepted /
          metricByteam.total_lines_suggested) *
        100
      );
    }),
  });

  return series;
};

export const createTotalSuggestionsAndAcceptancesSeries = (
  metrics: Metric[],
  metricsByTeam: Metric[],
  team?: string,
) => {
  const series = [
    {
      id: 'total_suggestions_count_general',
      label: 'Total Suggestions (Overall)',
      valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
      data: metrics.map(metric => metric.total_suggestions_count),
    },
    {
      id: 'total_acceptances_count_general',
      label: 'Total Acceptances (Overall)',
      valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
      data: metrics.map(metric => metric.total_acceptances_count),
    },
  ];

  addSeriesIfTeam(series, !!team, {
    id: 'total_suggestions_count_by_team',
    label: `Total Suggestions (${team})`,
    valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
    data: metrics.map(
      metric =>
        metricsByTeam.find(teamMetric => teamMetric.day === metric.day)
          ?.total_suggestions_count ?? null,
    ),
  });

  addSeriesIfTeam(series, !!team, {
    id: 'total_acceptances_count_by_team',
    label: `Total Acceptances (${team})`,
    valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
    data: metrics.map(
      metric =>
        metricsByTeam.find(teamMetric => teamMetric.day === metric.day)
          ?.total_acceptances_count ?? null,
    ),
  });

  return series;
};

export const createTotalLinesSuggestedAndAcceptedSeries = (
  metrics: Metric[],
  metricsByTeam: Metric[],
  team?: string,
) => {
  const series = [
    {
      id: 'total_lines_suggested',
      label: 'Total Lines Suggested (Overall)',
      valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
      data: metrics.map(x => x.total_lines_suggested),
    },
    {
      id: 'total_lines_accepted',
      label: 'Total Lines Accepted (Overall)',
      valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
      data: metrics.map(x => x.total_lines_accepted),
    },
  ];

  addSeriesIfTeam(series, !!team, {
    id: 'total_lines_suggested_by_team',
    label: `Total Lines Suggested (${team})`,
    valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
    data: metrics.map(
      metric =>
        metricsByTeam.find(teamMetric => teamMetric.day === metric.day)
          ?.total_lines_suggested ?? null,
    ),
  });

  addSeriesIfTeam(series, !!team, {
    id: 'total_lines_accepted_by_team',
    label: `Total Lines Accepted (${team})`,
    valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
    data: metrics.map(
      metric =>
        metricsByTeam.find(teamMetric => teamMetric.day === metric.day)
          ?.total_lines_accepted ?? null,
    ),
  });

  return series;
};

export const createTotalActiveUsersSeries = (
  metrics: Metric[],
  metricsByTeam: Metric[],
  team?: string,
) => {
  const series = [
    {
      label: 'Total Active Users (Overall)',
      valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
      data: metrics.map(x => x.total_active_users),
    },
  ];

  addSeriesIfTeam(series, !!team, {
    id: 'total_active_users_by_team',
    label: `Total Active Users (${team})`,
    valueFormatter: (v: number | null) => v?.toString() ?? 'N/A',
    data: metrics.map(
      metric =>
        metricsByTeam.find(teamMetric => teamMetric.day === metric.day)
          ?.total_active_users ?? null,
    ),
  });

  return series;
};
