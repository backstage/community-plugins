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
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { BarChart, LineChart } from '@mui/x-charts';
import { Chart } from './Chart';
import { ChartsProps } from '../../types';
import { DateTime } from 'luxon';
import {
  createAcceptanceRateSeries,
  createTotalSuggestionsAndAcceptancesSeries,
  createTotalLinesSuggestedAndAcceptedSeries,
  createTotalActiveUsersSeries,
} from './seriesUtils';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const DashboardCharts = ({
  team,
  metrics,
  metricsByTeam,
}: PropsWithChildren<ChartsProps>) => (
  <MainBox>
    <Chart title="Acceptance Rate %">
      <LineChart
        xAxis={[
          {
            id: 'days',
            data: metrics.map(x => new Date(x.day)),
            scaleType: 'point',
            valueFormatter: date =>
              DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
          },
        ]}
        bottomAxis={{
          tickLabelStyle: {
            angle: 30,
            textAnchor: 'start',
          },
        }}
        series={createAcceptanceRateSeries(metrics, metricsByTeam, team)}
        height={300}
      />
    </Chart>
    <Chart title="Total Suggestions Count | Total Acceptances Count">
      <LineChart
        xAxis={[
          {
            id: 'days',
            data: metrics.map(x => new Date(x.day)),
            scaleType: 'point',
            valueFormatter: date =>
              DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
          },
        ]}
        bottomAxis={{
          tickLabelStyle: {
            angle: 30,
            textAnchor: 'start',
          },
        }}
        series={createTotalSuggestionsAndAcceptancesSeries(
          metrics,
          metricsByTeam,
          team,
        )}
        height={300}
      />
    </Chart>
    <Chart title="Total Lines Suggested | Total Lines Accepted">
      <LineChart
        xAxis={[
          {
            id: 'days',
            data: metrics.map(x => new Date(x.day)),
            scaleType: 'point',
            valueFormatter: date =>
              DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
          },
        ]}
        bottomAxis={{
          tickLabelStyle: {
            angle: 30,
            textAnchor: 'start',
          },
        }}
        series={createTotalLinesSuggestedAndAcceptedSeries(
          metrics,
          metricsByTeam,
          team,
        )}
        height={300}
      />
    </Chart>
    <Chart title="Total Active Users">
      <BarChart
        xAxis={[
          {
            data: metrics.map(x => new Date(x.day)),
            scaleType: 'band',
            valueFormatter: date =>
              DateTime.fromJSDate(date).toFormat('dd-MM-yy'),
          },
        ]}
        bottomAxis={{
          tickLabelStyle: {
            angle: 30,
            textAnchor: 'start',
          },
        }}
        series={createTotalActiveUsersSeries(metrics, metricsByTeam, team)}
        height={300}
      />
    </Chart>
  </MainBox>
);
