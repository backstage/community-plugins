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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { MetricChart } from './MetricChart';
import { DoraMetricTrendPoint } from '@backstage-community/plugin-devlake-common';

// recharts renders SVG; mock the heavy components to simplify testing
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const trendData: DoraMetricTrendPoint[] = [
  { date: '2024-01-01', value: 2 },
  { date: '2024-01-08', value: 3 },
  { date: '2024-01-15', value: 4 },
];

describe('MetricChart', () => {
  it('renders the chart title', async () => {
    await renderInTestApp(
      <MetricChart
        title="Deployment Frequency"
        data={trendData}
        color="#4caf50"
        unit="deploys/day"
      />,
    );
    expect(screen.getByText('Deployment Frequency')).toBeInTheDocument();
  });

  it('renders the chart container', async () => {
    await renderInTestApp(
      <MetricChart
        title="Lead Time for Changes"
        data={trendData}
        color="#2196f3"
        unit="hours"
      />,
    );
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('renders with an empty data set without crashing', async () => {
    await renderInTestApp(
      <MetricChart
        title="Change Failure Rate"
        data={[]}
        color="#ff9800"
        unit="%"
      />,
    );
    expect(screen.getByText('Change Failure Rate')).toBeInTheDocument();
  });
});
