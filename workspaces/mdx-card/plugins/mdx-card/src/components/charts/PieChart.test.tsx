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
import { PieChart } from './PieChart';

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
  { name: 'Active', value: 45 },
  { name: 'Inactive', value: 12 },
  { name: 'Pending', value: 8 },
];

const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('PieChart', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<PieChart data={sampleData} />);
    expect(container).toBeDefined();
  });

  it('renders as donut chart', () => {
    const { container } = renderWithTheme(<PieChart data={sampleData} donut />);
    expect(container).toBeDefined();
  });

  it('renders without labels', () => {
    const { container } = renderWithTheme(
      <PieChart data={sampleData} showLabels={false} />,
    );
    expect(container).toBeDefined();
  });

  it('renders with custom colors', () => {
    const { container } = renderWithTheme(
      <PieChart data={sampleData} colors={['#ff0000', '#00ff00', '#0000ff']} />,
    );
    expect(container).toBeDefined();
  });

  it('renders without legend and tooltip', () => {
    const { container } = renderWithTheme(
      <PieChart data={sampleData} showLegend={false} showTooltip={false} />,
    );
    expect(container).toBeDefined();
  });
});
