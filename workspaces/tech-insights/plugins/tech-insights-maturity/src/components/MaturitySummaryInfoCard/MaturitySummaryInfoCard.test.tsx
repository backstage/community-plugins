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
import { MaturitySummaryInfoCard } from './MaturitySummaryInfoCard';
import { MaturityApi, maturityApiRef } from '../../api';

const entity = {
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
    system: 'api-tools',
  },
};

describe('<MaturityOverviewCard />', () => {
  const result: MaturitySummary = {
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
        maxRank: Rank.Silver,
        isMaxRank: true,
      },
    ],
  };

  const scoringApi: Partial<MaturityApi> = {
    getMaturitySummary: jest.fn().mockResolvedValue(result),
  };

  afterEach(() => jest.resetAllMocks());

  it('shows maturity summary Info card', async () => {
    const { getByText, getByAltText, getAllByTestId } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturitySummaryInfoCard />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByText('Maturity')).toBeInTheDocument(); // card title
    expect(getByText(/Bronze/)).toBeInTheDocument(); // icon logo for overall and Total area label
    expect(getByText(/Ownership/)).toBeInTheDocument(); // Area
    expect(getByAltText(/Silver/)).toBeInTheDocument(); // icon logo for ownership area
    expect(getAllByTestId('progressbar').length).toBeGreaterThan(0); // progress bar
  });
});
