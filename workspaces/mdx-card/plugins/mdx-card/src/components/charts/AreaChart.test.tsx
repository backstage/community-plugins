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
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { AreaChart } from './AreaChart';

jest.mock('recharts', () => {
  const Original = jest.requireActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

const sampleData = [
  { hour: '00:00', requests: 100 },
  { hour: '06:00', requests: 250 },
  { hour: '12:00', requests: 800 },
  { hour: '18:00', requests: 600 },
];

const renderWithTheme = (ui: ReactElement) => render(ui);

describe('AreaChart', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(
      <AreaChart data={sampleData} xKey="hour" yKeys={['requests']} />,
    );
    expect(container).toBeDefined();
  });

  it('renders stacked areas', () => {
    const multiData = [
      { month: 'Jan', frontend: 100, backend: 200 },
      { month: 'Feb', frontend: 150, backend: 180 },
    ];
    const { container } = renderWithTheme(
      <AreaChart
        data={multiData}
        xKey="month"
        yKeys={['frontend', 'backend']}
        stacked
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders with straight lines', () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={sampleData}
        xKey="hour"
        yKeys={['requests']}
        curved={false}
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders without grid, legend, and tooltip', () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={sampleData}
        xKey="hour"
        yKeys={['requests']}
        showGrid={false}
        showLegend={false}
        showTooltip={false}
      />,
    );
    expect(container).toBeDefined();
  });
});
