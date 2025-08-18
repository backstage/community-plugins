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
import { MaturityScorePage } from './MaturityScorePage';
import { MaturityApi, maturityApiRef } from '../../api';
import { MaturityScore } from '@backstage-community/plugin-tech-insights-maturity-common';
import { InsightFacts } from '@backstage-community/plugin-tech-insights-common';

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

const result: MaturityScore = {
  checks: [
    {
      check: {
        description: 'Entity is operable once deployed',
        factIds: ['systemAwsHealthWarningsFactRetriever'],
        id: 'awsWarningsCheck',
        metadata: {
          category: 'Operations',
          exp: 100,
          rank: 1,
          solution: '',
        },
        name: 'AWS Health Check',
        type: 'json-rules-engine',
      },
      facts: {
        hasEmptyAwsWarnings: {
          description:
            'There are no AWS Health Dashboard alert(s) for End of Life, End of Support, or Deprecation for any of the components within this system.',
          id: 'hasEmptyAwsWarnings',
          type: 'set',
          value: true,
        },
      },
      result: true,
    },
    {
      check: {
        description: 'Entity has a full product ownership',
        factIds: ['entityStakeholdersFactRetriever'],
        id: 'productOwnershipCheck',
        links: [
          {
            title: 'ownership doc1',
            url: 'https://test.net/docs/ownership/authoring-factbook/#ownership',
          },
          {
            title: 'ownership doc2',
            url: 'https://test.net/docs/ownership/authoring-factbook/#ownership',
          },
        ],
        metadata: {
          category: 'Ownership',
          exp: 100,
          rank: 1,
          solution:
            'Add a person with "product owner" role to metadata.people list in the factbook',
        },
        name: 'Product Owner Check',
        type: 'Ownership',
      },
      facts: {
        hasProductOwner: {
          description: 'Product owner is present in factbook',
          id: 'hasProductOwner',
          type: 'boolean',
          value: true,
        },
      },
      result: true,
    },
    {
      check: {
        description: 'Entity has a full technical ownership',
        factIds: ['entityStakeholdersFactRetriever'],
        id: 'technicalOwnershipCheck',
        links: [
          {
            title: 'ownership',
            url: 'https://test.net/docs/ownership/authoring-factbook/#ownership',
          },
        ],
        metadata: {
          category: 'Ownership',
          exp: 200,
          rank: 2,
          solution:
            'Add a person with "technical owner" role to metadata.people list in the factbook',
        },
        name: 'Technical Owner Check',
        type: 'Ownership',
      },
      facts: {
        hasTechnicalOwner: {
          description: 'Technical owner is present in factbook',
          id: 'hasTechnicalOwner',
          type: 'boolean',
          value: true,
        },
      },
      result: true,
    },
    {
      check: {
        description: 'Entity has a full technical ownership',
        factIds: ['entityStakeholdersFactRetriever'],
        id: 'technicalOwnershipCheck',
        links: [
          {
            title: 'ownership',
            url: 'https://test.net/docs/ownership/authoring-factbook/#ownership',
          },
        ],
        metadata: {
          category: 'Ownership',
          exp: 300,
          rank: 3,
          solution:
            'Add active engineer with "technical owner" role to metadata.people list in the factbook',
        },
        name: 'Technical Owner Check',
        type: 'Ownership',
      },
      facts: {
        technicalOwnersAreActive: {
          description: 'Technical owners are currently present',
          id: 'technicalOwnersAreActive',
          type: 'set',
          value: 'maica@hotmail.com',
        },
      },
      result: false,
    },
  ],
  rank: {
    isMaxRank: false,
    rank: 2,
  },
  summary: {
    areaSummaries: [
      {
        area: 'Ownership',
        isMaxRank: false,
        maxRank: 3,
        progress: {
          passedChecks: 2,
          percentage: 67,
          totalChecks: 3,
        },
        rank: 2,
        rankProgress: {
          passedChecks: 0,
          percentage: 0,
          totalChecks: 1,
        },
      },
      {
        area: 'Operations',
        isMaxRank: true,
        maxRank: 1,
        progress: {
          passedChecks: 1,
          percentage: 100,
          totalChecks: 1,
        },
        rank: 1,
        rankProgress: {
          passedChecks: 1,
          percentage: 100,
          totalChecks: 1,
        },
      },
    ],
    isMaxRank: false,
    maxRank: 3,
    points: 400,
    progress: {
      passedChecks: 3,
      percentage: 75,
      totalChecks: 4,
    },
    rank: 2,
    rankProgress: {
      passedChecks: 0,
      percentage: 0,
      totalChecks: 1,
    },
  },
};

const facts: InsightFacts = {
  entityStakeholdersFactRetriever: {
    timestamp: '2/22/2222',
    version: '1',
    facts: {
      hasProductOwner: true,
    },
  },
  systemAwsHealthWarningsFactRetriever: {
    timestamp: '1/11/1111',
    version: '1',
    facts: {
      hasEmptyAwsWarnings: true,
    },
  },
};

describe('<MaturityScorePage />', () => {
  const scoringApi: Partial<MaturityApi> = {
    getMaturityScore: jest.fn().mockResolvedValue(result),
    getFacts: jest.fn().mockResolvedValue(facts),
  };

  afterEach(() => jest.resetAllMocks());

  it('shows maturity score page', async () => {
    const { getByText, queryByText, getAllByText, getAllByAltText } =
      await renderInTestApp(
        <TestApiProvider apis={[[maturityApiRef, scoringApi]]}>
          <EntityProvider entity={entity}>
            <MaturityScorePage />
          </EntityProvider>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/catalog/:namespace/:kind/:name': entityRouteRef,
          },
        },
      );

    // Maturity Rank InfoCard
    expect(queryByText('Maturity Rank')).toBeInTheDocument(); // title

    // Maturity Check Table
    expect(queryByText('Checks')).toBeInTheDocument(); // title
    expect(getAllByAltText(/Bronze/)).toHaveLength(3); // Bronze Accordion + Maturity Summary chip
    expect(getAllByText(/Silver/)).toHaveLength(2); // Silver Accordion + Maturity Summary chip
    expect(getAllByText(/Gold/)).toHaveLength(2); // Gold Accordion + Maturity Summary chip
    expect(getByText(/Product Owner Check/)).toBeInTheDocument();
    expect(
      getByText(
        /Add a person with \"product owner\" role to metadata.people list in the factbook/,
      ),
    ).toBeInTheDocument();
    expect(getByText(/ownership doc1/)).toBeInTheDocument(); // link 1
    expect(getByText(/ownership doc2/)).toBeInTheDocument(); // link 2
    expect(getAllByText(/2\/22\/22/)).toHaveLength(3); // Updated timestamp

    // Failed Check
    expect(
      getByText(/Technical owners are currently present: maica@hotmail.com/),
    ).toBeInTheDocument(); // display failed check fact
  });
});
