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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LineChart } from './LineChart';

jest.mock('recharts', () => {
  const Original = jest.requireActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

const theme = createTheme();

const sampleData = [
  { date: '2024-01', latency: 120, errors: 5 },
  { date: '2024-02', latency: 110, errors: 3 },
  { date: '2024-03', latency: 130, errors: 8 },
];

const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('LineChart', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(
      <LineChart data={sampleData} xKey="date" yKeys={['latency']} />,
    );
    expect(container).toBeDefined();
  });

  it('renders with multiple yKeys', () => {
    const { container } = renderWithTheme(
      <LineChart data={sampleData} xKey="date" yKeys={['latency', 'errors']} />,
    );
    expect(container).toBeDefined();
  });

  it('renders with straight lines', () => {
    const { container } = renderWithTheme(
      <LineChart
        data={sampleData}
        xKey="date"
        yKeys={['latency']}
        curved={false}
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders without dots', () => {
    const { container } = renderWithTheme(
      <LineChart
        data={sampleData}
        xKey="date"
        yKeys={['latency']}
        showDots={false}
      />,
    );
    expect(container).toBeDefined();
  });

  it('renders without grid, legend, and tooltip', () => {
    const { container } = renderWithTheme(
      <LineChart
        data={sampleData}
        xKey="date"
        yKeys={['latency']}
        showGrid={false}
        showLegend={false}
        showTooltip={false}
      />,
    );
    expect(container).toBeDefined();
  });
});
