/*
 * Copyright 2025 The Backstage Authors
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
/** @jest-environment jsdom */
import {
  Entity,
  RELATION_HAS_PART,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  CatalogApi,
  catalogApiRef,
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  BulkMaturitySummary,
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';

import { MaturitySummaryTable } from './MaturitySummaryTable';
import { MaturityApi, maturityApiRef } from '../../api';

const mockSystem: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'System',
  metadata: {
    namespace: 'default',
    name: 'mock-system',
    title: 'Mock System',
  },
  relations: [
    {
      type: RELATION_HAS_PART,
      targetRef: 'component:default/bingaux-sources',
    },
  ],
  spec: {
    owner: 'unknown',
    domain: 'platform',
  },
};

const mockComponent: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    namespace: 'default',
    name: 'bingaux-sources',
    title: 'Bingaux Sources',
    tags: ['python', 'csharp'],
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-119',
    system: 'mock-system',
  },
  relations: [
    {
      targetRef: 'system:default/mock-system',
      type: RELATION_PART_OF,
    },
  ],
};

describe('<MaturitySummaryTable />', () => {
  afterEach(() => jest.resetAllMocks());

  const summary: MaturitySummary = {
    rank: Rank.Silver,
    maxRank: Rank.Gold,
    isMaxRank: false,
    points: 100,
    progress: {
      percentage: 100,
      totalChecks: 1,
      passedChecks: 1,
    },
    rankProgress: {
      percentage: 0,
      totalChecks: 0,
      passedChecks: 0,
    },
    areaSummaries: [
      {
        area: 'Ownership',
        progress: {
          percentage: 100,
          totalChecks: 1,
          passedChecks: 1,
        },
        rankProgress: {
          percentage: 0,
          totalChecks: 0,
          passedChecks: 0,
        },
        rank: Rank.Silver,
        maxRank: Rank.Gold,
        isMaxRank: false,
      },
    ],
  };

  const bulkSummary: BulkMaturitySummary = [
    { entity: 'component:default/bingaux-sources', summary },
  ];

  const catalogApi: Partial<CatalogApi> = {
    getEntitiesByRefs: jest.fn().mockResolvedValue({ items: [mockComponent] }),
  };

  const scoringDataApi: Partial<MaturityApi> = {
    getBulkMaturitySummary: jest.fn().mockResolvedValue(bulkSummary),
  };

  afterEach(() => jest.resetAllMocks());

  it('shows maturity summary table', async () => {
    const { getByText, queryByText, getAllByAltText, getAllByTestId } =
      await renderInTestApp(
        <TestApiProvider
          apis={[
            [catalogApiRef, catalogApi],
            [maturityApiRef, scoringDataApi],
          ]}
        >
          <EntityProvider entity={mockSystem}>
            <MaturitySummaryTable entities={[mockComponent]} />
          </EntityProvider>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );
    expect(queryByText(/Component Maturity/)).toBeInTheDocument(); // Title

    expect(getByText(mockComponent.metadata.name)).toBeInTheDocument(); // Component name
    expect(getAllByAltText(/Silver/)).toHaveLength(2); // Overall, Ownership
    expect(queryByText(/100%/)).not.toBeInTheDocument(); // Overall progress hidden by default
    expect(getByText(/Ownership/)).toBeInTheDocument(); // Area name

    expect(queryByText(/0 Gold tasks left/)).toBeInTheDocument(); // Next Rank progress tip
    expect(queryByText(/Max rank!/)).not.toBeInTheDocument(); // Next Rank progress tip
    expect(getAllByTestId('progressbar').length).toBeGreaterThan(0); // Next Rank progress bar
  });
});
