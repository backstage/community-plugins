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
import { MaturityApi, maturityApiRef } from '../../api';
import {
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
        email: 'jcarres@mdsol.com',
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

const rank = {
  rank: Rank.Bronze,
  isMaxRank: false,
};

const result: MaturityCheckResult[] = [
  productOwnershipCheckResult, // bronze
  technicalOwnershipCheckResult, // silver
  {
    facts: {
      hasReadme: {
        id: 'hasReadme',
        value: false,
        type: 'boolean' as const,
        description: 'The entity has valid README file',
      },
    },
    result: false,
    check: {
      id: 'readmeValidationCheck',
      type: 'Documentation',
      name: 'Entity Documentation',
      description: 'Entity is thoroughly documented',
      factIds: ['hasReadme'],
      metadata: {
        exp: 100,
        rank: Rank.Bronze,
        category: 'Documentation',
        solution: '',
      },
    },
    updated: 'today',
  },
];

describe('<MaturityScoreInfoCard />', () => {
  afterEach(() => jest.resetAllMocks());

  const maturityApi: Partial<MaturityApi> = {
    getMaturityScore: jest.fn().mockResolvedValue(result),
    getMaturityRank: jest.fn().mockResolvedValue(rank),
  };

  it('shows maturity score table', async () => {
    const { getByText, queryByText, getAllByText } = await renderInTestApp(
      <TestApiProvider apis={[[maturityApiRef, maturityApi]]}>
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

    expect(getAllByText('Not yet run')).toHaveLength(2); // update timestamp
    expect(queryByText('Updated today')).toBeInTheDocument(); // hasReadme update timestamp
  });
});
