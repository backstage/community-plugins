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
import {
  EntityProvider,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import React from 'react';
import { MaturityRankInfoCard } from './MaturityRankInfoCard';
import { ScoringDataApi, scoringDataApiRef } from '../../api';

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    namespace: 'default',
    name: 'bingaux-sources',
    title: 'Bingaux Sources',
    stakeholders: [
      {
        role: 'architect',
        email: 'some@email.com',
      },
    ],
    tags: ['python', 'csharp'],
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-119',
    system: 'api-tools',
  },
};

describe('<MaturityRankInfoCard />', () => {
  afterEach(() => jest.resetAllMocks());
  it('shows maturity rank infocard with rank and area', async () => {
    const summary: MaturitySummary = {
      rank: Rank.Bronze,
      maxRank: Rank.Silver,
      isMaxRank: true,
      points: 100,
      progress: {
        percentage: 100,
        totalChecks: 1,
        passedChecks: 1,
      },
      rankProgress: {
        percentage: 100,
        totalChecks: 1,
        passedChecks: 1,
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
          rank: Rank.Bronze,
          maxRank: Rank.Bronze,
          isMaxRank: true,
        },
      ],
    };

    const scoringApi: Partial<ScoringDataApi> = {
      getMaturitySummary: jest.fn().mockResolvedValue(summary),
    };

    const { getByText, getByAltText, getAllByAltText } = await renderInTestApp(
      <TestApiProvider apis={[[scoringDataApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturityRankInfoCard entity={entity} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText('Maturity Rank')).toBeInTheDocument(); // Title
    expect(getByText('Bronze')).toBeInTheDocument(); // current rank label

    expect(getByAltText('Stone')).toBeInTheDocument(); // rank progress avatars
    expect(getAllByAltText('Bronze')).toHaveLength(3); // rank progress avatars, Current Bronze Rank, Ownership area rank avatar
    expect(getByAltText('Silver')).toBeInTheDocument(); // rank progress
    expect(getByAltText('Gold')).toBeInTheDocument(); // rank progress avatars
    expect(
      getByText(
        'Has full Ownership, but Maintainability, Security, and Reliability are not ensured',
      ),
    ).toBeInTheDocument();
    expect(getByText('Ownership')).toBeInTheDocument(); // Area progress
  });
});
