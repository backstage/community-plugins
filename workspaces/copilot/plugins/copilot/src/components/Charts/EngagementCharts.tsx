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
import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { BarChart, LineChart } from '@mui/x-charts';
import { Chart } from './Chart';
import { EngagementChartsProps } from '../../types';
import { DateTime } from 'luxon';
import {
  createAssignedSeatSeries,
  createEngagementSeries,
  createUnusedSeatSeries,
} from './seriesUtils';
import { EngagementMetrics } from '@backstage-community/plugin-copilot-common';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const EngagementCharts = ({
  team,
  metrics,
  metricsByTeam,
  seats,
  seatsByTeam,
}: PropsWithChildren<EngagementChartsProps>) => {
  // Helper function to create chart content
  const createChartContent = (
    title: string,
    metricKey: keyof EngagementMetrics,
  ) => {
    const baseSeriesData = createEngagementSeries(
      metrics,
      metricsByTeam,
      title,
      metricKey,
      team,
    );

    return (
      <Chart title={title}>
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
          series={baseSeriesData}
          height={300}
        />
      </Chart>
    );
  };

  const seatTotalSeries = createAssignedSeatSeries(
    seats,
    seatsByTeam,
    'Total Assigned Seats',
    team,
  );
  const seatsUnusedSeries = createUnusedSeatSeries(seats, seatsByTeam, team);

  return (
    <MainBox>
      <Chart title="Total Assigned Seats">
        <BarChart
          xAxis={[
            {
              data: seats.map(x => new Date(x.day)),
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
          series={seatTotalSeries}
          height={300}
        />
      </Chart>
      <Chart title="Unused Seats">
        <LineChart
          xAxis={[
            {
              data: seats.map(x => new Date(x.day)),
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
          series={seatsUnusedSeries}
          height={300}
        />
      </Chart>
      {createChartContent('Total Active Users', 'total_active_users')}
      {createChartContent('Total Engaged Users', 'total_engaged_users')}
      {createChartContent(
        'Total Engaged IDE code completion Users',
        'ide_completions_engaged_users',
      )}
      {createChartContent(
        'Total Engaged IDE chat Users',
        'ide_chats_engaged_users',
      )}
      {createChartContent(
        'Total Github.com chat Users',
        'dotcom_chats_engaged_users',
      )}
      {createChartContent(
        'Total Github.com Pull-Request Users',
        'dotcom_prs_engaged_users',
      )}
    </MainBox>
  );
};
