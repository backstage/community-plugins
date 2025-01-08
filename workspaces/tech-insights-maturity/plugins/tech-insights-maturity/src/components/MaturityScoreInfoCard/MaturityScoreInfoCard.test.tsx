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
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  MaturityCheckResult,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import React from 'react';
import { MaturityScoreInfoCard } from './MaturityScoreInfoCard';
import { ScoringDataApi, scoringDataApiRef } from '../../api';
import {
  hasReadMeCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
} from '../../api/testData';

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

describe('<MaturityScoreInfoCard />', () => {
  const rank = {
    rank: Rank.Bronze,
    isMaxRank: false,
  };

  const result: MaturityCheckResult[] = [
    productOwnershipCheckResult, // bronze
    technicalOwnershipCheckResult, // silver
    hasReadMeCheckResult, // bronze
  ];

  const scoringApi: Partial<ScoringDataApi> = {
    getMaturityCheckResults: jest.fn().mockResolvedValue(result),
    getMaturityRank: jest.fn().mockResolvedValue(rank),
  };

  afterEach(() => jest.resetAllMocks());

  it('shows maturity score table', async () => {
    const { getByText, queryByText, getAllByText } = await renderInTestApp(
      <TestApiProvider apis={[[scoringDataApiRef, scoringApi]]}>
        <MaturityScoreInfoCard entity={entity} />
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog/:namespace/:kind/:name': entityRouteRef,
        },
      },
    );

    expect(queryByText('Checks')).toBeInTheDocument(); // Title
    expect(queryByText('Bronze')).toBeInTheDocument(); // area Rank widget
    expect(getByText(/productOwnershipCheck/)).toBeInTheDocument();
    expect(getByText(/readmeValidationCheck/)).toBeInTheDocument();
    expect(getAllByText('Ownership')).toHaveLength(2); // productOwnership area, technicalOwnership area
    expect(getByText('Documentation')).toBeInTheDocument(); // hasReadMe area

    expect(queryByText('Silver')).toBeInTheDocument(); // area Rank widget
    expect(getByText(/technicalOwnershipCheck/)).toBeInTheDocument();
  });
});