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
  MaturityRank,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { MaturityRankWidget } from './MaturityRankWidget';
import { MaturityApi, maturityApiRef } from '../../api';

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

describe('<MaturityRankWidget />', () => {
  afterEach(() => jest.resetAllMocks());
  it('shows maturity rank widget with bronze rank', async () => {
    const rank: MaturityRank = {
      rank: Rank.Bronze,
      isMaxRank: true,
    };

    const scoringApi: Partial<MaturityApi> = {
      getMaturityRank: jest.fn().mockResolvedValue(rank),
    };

    const { getByAltText } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturityRankWidget entity={entity} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByAltText(/Bronze/)).toBeInTheDocument(); // image
  });

  it('shows maturity rank widget with Stone rank', async () => {
    const rank: MaturityRank = {
      rank: Rank.Stone,
      isMaxRank: false,
    };

    const scoringApi: Partial<MaturityApi> = {
      getMaturityRank: jest.fn().mockResolvedValue(rank),
    };

    const { getByAltText } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturityRankWidget entity={entity} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByAltText(/Stone/)).toBeInTheDocument(); // image
  });

  it('shows maturity rank widget with silver rank', async () => {
    const rank: MaturityRank = {
      rank: Rank.Silver,
      isMaxRank: true,
    };

    const scoringApi: Partial<MaturityApi> = {
      getMaturityRank: jest.fn().mockResolvedValue(rank),
    };

    const { getByAltText } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturityRankWidget entity={entity} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByAltText(/Silver/)).toBeInTheDocument(); // image
  });

  it('shows maturity rank widget with gold rank', async () => {
    const rank: MaturityRank = {
      rank: Rank.Gold,
      isMaxRank: true,
    };

    const scoringApi: Partial<MaturityApi> = {
      getMaturityRank: jest.fn().mockResolvedValue(rank),
    };

    const { getByAltText } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
        <EntityProvider entity={entity}>
          <MaturityRankWidget entity={entity} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(getByAltText(/Gold/)).toBeInTheDocument(); // image
  });
});
