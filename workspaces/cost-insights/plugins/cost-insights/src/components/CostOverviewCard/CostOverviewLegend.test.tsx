/*
 * Copyright 2021 The Backstage Authors
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

import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { Duration } from '../../types';
import { CostOverviewLegend } from './CostOverviewLegend';
import {
  MockBillingDateProvider,
  MockConfigProvider,
  MockFilterProvider,
  MockCurrencyProvider,
} from '../../testUtils';

function render(children: JSX.Element) {
  return renderInTestApp(
    <MockConfigProvider>
      <MockCurrencyProvider>
        <MockBillingDateProvider>
          <MockFilterProvider>{children}</MockFilterProvider>
        </MockBillingDateProvider>
      </MockCurrencyProvider>
    </MockConfigProvider>,
  );
}

describe('<CostOverviewLegend />', () => {
  it('displays the legend without exploding', async () => {
    await render(
      <CostOverviewLegend
        metric={{
          kind: 'msc',
          name: 'MSC',
          default: false,
        }}
        metricData={{
          id: 'msc',
          format: 'number',
          aggregation: [],
          change: {
            ratio: 0,
            amount: 0,
          },
        }}
        dailyCostData={{
          id: 'mock-id',
          aggregation: [],
          change: {
            amount: 0,
          },
        }}
      />,
    );

    expect(await screen.findByText('Cost Trend')).toBeInTheDocument();
    expect(await screen.findByText('MSC Trend')).toBeInTheDocument();
  });

  it('does not display metric legend if metric data is not provided', async () => {
    await render(
      <CostOverviewLegend
        metric={{
          kind: 'msc',
          name: 'MSC',
          default: false,
        }}
        metricData={null}
        dailyCostData={{
          id: 'mock-id',
          aggregation: [],
          change: {
            amount: 0,
          },
        }}
      />,
    );

    expect(await screen.findByText('Cost Trend')).toBeInTheDocument();
    expect(screen.queryByText('MSC Trend')).not.toBeInTheDocument();
  });
});

describe.each`
  ratio        | amount    | title   | expected
  ${undefined} | ${1_000}  | ${'∞'}  | ${'Your Excess'}
  ${undefined} | ${-1_000} | ${'-∞'} | ${'Your Savings'}
`('<CostOverviewLegend />', ({ ratio, amount, title, expected }) => {
  it('displays the correct legend if ratio cannot be calculated and costs are within time period', async () => {
    await render(
      <CostOverviewLegend
        metric={{
          kind: 'msc',
          name: 'MSC',
          default: false,
        }}
        metricData={{
          id: 'msc',
          format: 'number',
          change: {
            ratio: ratio,
            amount: amount,
          },
          aggregation: [
            {
              date: '2020-01-01',
              amount: 0,
            },
            {
              date: '2020-07-01', // within default P90D period
              amount: amount,
            },
          ],
        }}
        dailyCostData={{
          id: 'mock-id',
          change: {
            ratio,
            amount,
          },
          aggregation: [
            {
              date: '2020-01-01',
              amount: 0,
            },
            {
              date: '2020-07-01', // within default P90D period
              amount: amount,
            },
          ],
        }}
      />,
    );

    expect(await screen.findByText('Cost Trend')).toBeInTheDocument();
    expect(await screen.findByText('MSC Trend')).toBeInTheDocument();
    expect(await screen.findAllByText(title).then(res => res.length)).toBe(2);
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });
});

describe('<CostOverviewLegend /> with custom date range', () => {
  it('should handle CUSTOM duration with custom date range without errors', async () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-31' };

    await renderInTestApp(
      <MockConfigProvider>
        <MockCurrencyProvider>
          <MockBillingDateProvider lastCompleteBillingDate="2020-09-01">
            <MockFilterProvider
              pageFilters={{
                group: 'tech',
                project: null,
                duration: Duration.CUSTOM,
                metric: null,
                customDateRange: customDateRange,
              }}
            >
              <CostOverviewLegend
                metric={{
                  kind: 'msc',
                  name: 'MSC',
                  default: false,
                }}
                metricData={{
                  id: 'msc',
                  format: 'number',
                  change: {
                    ratio: 0.1,
                    amount: 100,
                  },
                  aggregation: [
                    {
                      date: '2020-01-01',
                      amount: 1000,
                    },
                    {
                      date: '2020-01-15',
                      amount: 1100,
                    },
                  ],
                }}
                dailyCostData={{
                  id: 'mock-id',
                  change: {
                    ratio: 0.05,
                    amount: 50,
                  },
                  aggregation: [
                    {
                      date: '2020-01-01',
                      amount: 1000,
                    },
                    {
                      date: '2020-01-15',
                      amount: 1050,
                    },
                  ],
                }}
              />
            </MockFilterProvider>
          </MockBillingDateProvider>
        </MockCurrencyProvider>
      </MockConfigProvider>,
    );

    expect(await screen.findByText('Cost Trend')).toBeInTheDocument();
    expect(await screen.findByText('MSC Trend')).toBeInTheDocument();
  });
});
