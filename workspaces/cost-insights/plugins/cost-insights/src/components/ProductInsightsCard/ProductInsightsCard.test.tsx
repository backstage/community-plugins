/*
 * Copyright 2020 The Backstage Authors
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

import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { ProductInsightsCard } from './ProductInsightsCard';
import { CostInsightsApi, costInsightsApiRef } from '../../api';
import {
  createMockEntity,
  mockDefaultLoadingState,
  MockComputeEngine,
  MockConfigProvider,
  MockCurrencyProvider,
  MockBillingDateProvider,
  MockScrollProvider,
  MockLoadingProvider,
} from '../../testUtils';
import { Duration } from '../../types';
import {
  Entity,
  Product,
} from '@backstage-community/plugin-cost-insights-common';

// suppress recharts componentDidUpdate warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});

const costInsightsApi = (entity: Entity): Partial<CostInsightsApi> => ({
  getProductInsights: () => Promise.resolve(entity),
});

const mockProductCost = createMockEntity(() => ({
  id: 'test-id',
  entities: {},
  aggregation: [3000, 4000],
  change: {
    ratio: 0.23,
    amount: 1000,
  },
}));

const renderProductInsightsCardInTestApp = async (
  entity: Entity,
  product: Product,
  duration = Duration.P30D,
  onSelectAsync = jest.fn(() => Promise.resolve(mockProductCost)),
) =>
  await renderInTestApp(
    <TestApiProvider apis={[[costInsightsApiRef, costInsightsApi(entity)]]}>
      <MockConfigProvider>
        <MockCurrencyProvider>
          <MockLoadingProvider state={mockDefaultLoadingState}>
            <MockBillingDateProvider>
              <MockScrollProvider>
                <ProductInsightsCard
                  product={product}
                  initialState={{ entity, duration }}
                  onSelectAsync={onSelectAsync}
                />
              </MockScrollProvider>
            </MockBillingDateProvider>
          </MockLoadingProvider>
        </MockCurrencyProvider>
      </MockConfigProvider>
    </TestApiProvider>,
  );

describe('<ProductInsightsCard/>', () => {
  const { ResizeObserver } = window;
  beforeEach(() => {
    // @ts-expect-error
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterEach(() => {
    window.ResizeObserver = ResizeObserver;
    jest.restoreAllMocks();
  });

  it('Should render the right subheader for products with cost data', async () => {
    const entity = {
      ...mockProductCost,
      entities: { entity: [...Array(1000)].map(createMockEntity) },
    };
    const rendered = await renderProductInsightsCardInTestApp(
      entity,
      MockComputeEngine,
    );
    expect(
      rendered.getByText(/1000 entities, sorted by cost/),
    ).toBeInTheDocument();
  });

  it('Should render the right subheader if there is no cost data or change data', async () => {
    const entity: Entity = {
      id: 'test-id',
      entities: {},
      aggregation: [0, 0],
      change: { ratio: 0, amount: 0 },
    };
    const subheader = `There are no ${MockComputeEngine.name} costs within this time frame for your team's projects.`;
    const rendered = await renderProductInsightsCardInTestApp(
      entity,
      MockComputeEngine,
      Duration.P30D,
    );
    const subheaderRgx = new RegExp(subheader);
    expect(rendered.getByText(subheaderRgx)).toBeInTheDocument();
    expect(rendered.queryByText(/sorted by cost/)).not.toBeInTheDocument();
    expect(
      rendered.queryByTestId('.resource-growth-chart-legend'),
    ).not.toBeInTheDocument();
    expect(
      rendered.queryByTestId('.insights-bar-chart'),
    ).not.toBeInTheDocument();
  });

  describe.each`
    duration         | periodStartText    | periodEndText
    ${Duration.P30D} | ${'First 30 Days'} | ${'Last 30 Days'}
    ${Duration.P90D} | ${'First 90 Days'} | ${'Last 90 Days'}
  `(
    'Should display the correct relative time',
    ({ duration, periodStartText, periodEndText }) => {
      it(`Should display the correct relative time for ${duration}`, async () => {
        const entity = {
          ...mockProductCost,
          entities: { entity: [...Array(3)].map(createMockEntity) },
        };
        const rendered = await renderProductInsightsCardInTestApp(
          entity,
          MockComputeEngine,
          duration,
        );
        expect(rendered.getByText(periodStartText)).toBeInTheDocument();
        expect(rendered.getByText(periodEndText)).toBeInTheDocument();
      });
    },
  );
});
