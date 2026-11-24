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
import { BarChart } from './BarChart';

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
  { month: 'Jan', deploys: 10, rollbacks: 2 },
  { month: 'Feb', deploys: 15, rollbacks: 1 },
  { month: 'Mar', deploys: 20, rollbacks: 3 },
];

const renderWithTheme = (ui: ReactElement) => render(ui);

describe('BarChart', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(
      <BarChart data={sampleData} xKey="month" yKeys={['deploys']} />,
    );
    expect(container).toBeDefined();
  });

  it('renders with multiple yKeys', () => {
    const { container } = renderWithTheme(
      <BarChart
        data={sampleData}
        xKey="month"
        yKeys={['deploys', 'rollbacks']}
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders stacked bars', () => {
    const { container } = renderWithTheme(
      <BarChart
        data={sampleData}
        xKey="month"
        yKeys={['deploys', 'rollbacks']}
        stacked
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders horizontal bars', () => {
    const { container } = renderWithTheme(
      <BarChart
        data={sampleData}
        xKey="month"
        yKeys={['deploys']}
        horizontal
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders with custom colors', () => {
    const { container } = renderWithTheme(
      <BarChart
        data={sampleData}
        xKey="month"
        yKeys={['deploys']}
        colors={['#ff0000', '#00ff00']}
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders without grid, legend, and tooltip', () => {
    const { container } = renderWithTheme(
      <BarChart
        data={sampleData}
        xKey="month"
        yKeys={['deploys']}
        showGrid={false}
        showLegend={false}
        showTooltip={false}
      />,
    );
    expect(container).toBeDefined();
  });
});
