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

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const EnterpriseCharts = ({
  metrics,
}: PropsWithChildren<ChartsProps>) => {
  return (
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
          series={[
            {
              id: 'total_lines_suggested',
              label: 'Acceptance Rate',
              valueFormatter: v => v?.toFixed(2).concat('%') ?? 'N/A',
              data: metrics.map(
                x => (x.total_lines_accepted / x.total_lines_suggested) * 100,
              ),
            },
          ]}
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
          series={[
            {
              id: 'total_suggestions_count',
              label: 'Total Suggestions',
              data: metrics.map(x => x.total_suggestions_count),
            },
            {
              id: 'total_acceptances_count',
              label: 'Total Acceptances',
              data: metrics.map(x => x.total_acceptances_count),
            },
          ]}
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
          series={[
            {
              id: 'total_lines_suggested',
              label: 'Total Lines Suggested',
              data: metrics.map(x => x.total_lines_suggested),
            },
            {
              id: 'total_lines_accepted',
              label: 'Total Lines Accepted',
              data: metrics.map(x => x.total_lines_accepted),
            },
          ]}
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
          series={[
            {
              label: 'Total Active Users',
              data: metrics.map(x => x.total_active_users),
            },
          ]}
          height={300}
        />
      </Chart>
    </MainBox>
  );
};
