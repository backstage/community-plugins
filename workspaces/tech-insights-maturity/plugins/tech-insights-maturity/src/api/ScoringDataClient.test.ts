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
import { CatalogApi } from '@backstage/catalog-client';
import {
  Entity,
  RELATION_HAS_MEMBER,
  RELATION_HAS_PART,
  RELATION_MEMBER_OF,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PART_OF,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

import {
  BulkMaturityCheckResponse,
  MaturityCheckResult,
  MaturityRank,
  MaturitySummary,
  Rank,
} from '@internal/plugin-maturity-common';
import { ScoringDataClient } from './ScoringDataClient';
import {
  activeOwnershipCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
} from './testData';

const mockSystem = {
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
      targetRef: 'component:default/ampridatvir',
    },
  ],
  spec: {
    owner: 'unknown',
    domain: 'platform',
  },
};

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    namespace: 'default',
    annotations: {
      'fossa.io/project-name': 'Ampridatvir',
      'mdsol/medistrano-id': '219',
      'sonarqube.org/project-key': 'com.mdsol:Medidata.Ampridatvir',
    },
    json_schema:
      'https://github.com/mdsol/platform-standards/blob/main/schemas/factbook.v1.json',
    name: 'ampridatvir',
    title: 'Ampridatvir (Self Help Service)',
    description:
      'A service that helps users of our platform report issues, and helps customer service and Medidata engineers to debug issues by providing essential information from backend services.',
    teams: [
      {
        name: 'SRE',
        number: 248,
        email: 'sre@mdsol.com',
      },
    ],
    channels: [
      {
        url: 'https://mdsol.slack.com/archives/team-51',
        automated_messaging: false,
        role: 'slack',
      },
    ],
    stakeholders: [
      {
        role: 'technical owner',
        email: 'bvillanueva@mdsol.com',
      },
      {
        role: 'product owner',
        email: 'jcarres@mdsol.com',
      },
    ],
    tags: ['csharp', 'gherkin'],
  },
  relations: [
    {
      type: RELATION_PART_OF,
      targetRef: 'system:default/mock-system',
    },
    {
      type: RELATION_OWNED_BY,
      targetRef: 'group:test/mock-team',
    },
  ],
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-248',
    system: 'error-reporting',
  },
};

const awsWarningsCheckResult: MaturityCheckResult = {
  facts: {
    hasEmptyAwsWarnings: {
      id: 'hasEmptyAwsWarnings',
      value: true,
      type: 'set',
      description:
        'There are no AWS Health Dashboard alert(s) for End of Life, End of Support, or Deprecation for any of the components within this system.',
    },
  },
  result: true,
  check: {
    id: 'awsWarningsCheck',
    type: 'json-rules-engine',
    name: 'AWS Health Check',
    description: 'Entity is operable once deployed',
    factIds: ['systemAwsHealthWarningsFactRetriever'],
    metadata: {
      category: 'Operations',
      rank: Rank.Bronze,
      solution: '',
      exp: 100,
    },
  },
};

// Check Result for System/Domain
const mockSystemCheckResult: MaturityCheckResult[] = [
  awsWarningsCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
  activeOwnershipCheckResult,
  {
    facts: {
      hasTechnicalOwner: {
        id: 'hasTechnicalOwner',
        type: 'boolean' as const,
        description: 'Technical owner is present in factbook',
        value: false,
      },
    },
    result: false,
    check: {
      id: 'technicalOwnershipCheck',
      type: 'json-rules-engine',
      name: 'Technical Ownership',
      description: 'Entity has a full technical ownership',
      factIds: ['entityStakeholdersFactRetriever'],
      links: [
        {
          title: 'ownership',
          url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
        },
      ],
      metadata: {
        exp: 200,
        rank: Rank.Silver,
        category: 'Ownership',
        solution:
          'Add medidata engineer with "technical owner" role to metadata.people list in the factbook',
      },
    },
  },
  {
    facts: {
      technicalOwnersAreActive: {
        id: 'technicalOwnersAreActive',
        type: 'boolean' as const,
        description: 'Technical owners are currently present in Medidata',
        value: true,
      },
    },
    result: true,
    check: {
      id: 'technicalOwnershipCheck',
      type: 'Ownership',
      name: 'Technical Ownership',
      description: 'Entity has a full technical ownership',
      factIds: ['entityStakeholdersFactRetriever'],
      links: [
        {
          title: 'ownership',
          url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
        },
      ],
      metadata: {
        category: 'Ownership',
        rank: Rank.Gold,
        solution:
          'Add active medidata engineer with "technical owner" role to metadata.people list in the factbook',
        exp: 300,
      },
    },
  },
  {
    facts: {
      hasTechnicalOwner: {
        id: 'hasTechnicalOwner',
        type: 'boolean' as const,
        description: 'Technical owner is present in factbook',
        value: true,
      },
      technicalOwnersAreActive: {
        id: 'technicalOwnersAreActive',
        type: 'boolean' as const,
        description: 'Technical owners are currently present in Medidata',
        value: true,
      },
    },
    result: true,
    check: {
      id: 'technicalOwnershipCheck',
      type: 'Ownership',
      name: 'Technical Ownership',
      description: 'Entity has a full technical ownership',
      factIds: ['entityStakeholdersFactRetriever'],
      links: [
        {
          title: 'ownership',
          url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
        },
      ],
      metadata: {
        category: 'Ownership',
        exp: 200,
        rank: Rank.Silver,
        solution:
          'Add active medidata engineer with "technical owner" role to metadata.people list in the factbook',
      },
    },
  },
  {
    facts: {
      technicalOwnersAreActive: {
        id: 'technicalOwnersAreActive',
        type: 'boolean' as const,
        description: 'Technical owners are currently present in Medidata',
        value: false,
      },
    },
    result: false,
    check: {
      id: 'technicalOwnershipCheck',
      type: 'Ownership',
      name: 'Technical Ownership',
      description: 'Entity has a full technical ownership',
      factIds: ['entityStakeholdersFactRetriever'],
      links: [
        {
          title: 'ownership',
          url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
        },
      ],
      metadata: {
        category: 'Ownership',
        rank: Rank.Gold,
        exp: 300,
        solution:
          'Add active medidata engineer with "technical owner" role to metadata.people list in the factbook',
      },
    },
  },
];

const bulkSystemCheckResult = [
  {
    entity: stringifyEntityRef(mockSystem),
    results: mockSystemCheckResult,
  },
];

const checkResults = [
  awsWarningsCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
  activeOwnershipCheckResult,
];

const bulkComponentCheckResult = [
  {
    entity: stringifyEntityRef(entity),
    results: checkResults,
  },
];

const mockUser: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    namespace: 'test',
    name: 'mock-user',
    title: 'Test User',
  },
  relations: [
    {
      type: RELATION_MEMBER_OF,
      targetRef: 'group:test/mock-team',
    },
  ],
};

const mockTeam: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Group',
  metadata: {
    namespace: 'test',
    name: 'mock-team',
    title: 'Test Team',
  },
  spec: {
    type: 'team',
  },
  relations: [
    {
      type: RELATION_HAS_MEMBER,
      targetRef: 'user:test/mock-user',
    },
    {
      type: RELATION_OWNER_OF,
      targetRef: 'component:default/ampridatvir',
    },
  ],
};

const mockCatalogApi: Partial<CatalogApi> = {
  getEntityByRef: entityRef => {
    if (typeof entityRef === 'string') {
      if (entityRef.includes('system')) {
        return Promise.resolve(mockSystem);
      }
      return Promise.resolve(entity);
    }
    if (entityRef.kind === 'group') {
      return Promise.resolve(mockTeam);
    }
    return Promise.resolve(entity);
  },
};

let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
let mockIdentityApi: jest.Mocked<IdentityApi>;

jest.mock('@backstage-community/plugin-tech-insights', () => ({
  TechInsightsClient: jest.fn(() => ({
    runChecks: jest.fn().mockResolvedValue(checkResults),
    runBulkChecks: jest
      .fn()
      .mockResolvedValueOnce(bulkComponentCheckResult)
      .mockResolvedValue(bulkSystemCheckResult),
  })),
}));

describe('ScoringDataClient', () => {
  const sdc = new ScoringDataClient({
    catalogApi: mockCatalogApi as CatalogApi,
    discoveryApi: mockDiscoveryApi,
    identityApi: mockIdentityApi,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBulkMaturityCheckResults', () => {
    it('generates bulk maturity scores for a given user', async () => {
      const expected: BulkMaturityCheckResponse = [
        {
          entity: 'component:default/ampridatvir',
          checks: [
            awsWarningsCheckResult,
            productOwnershipCheckResult,
            technicalOwnershipCheckResult,
            activeOwnershipCheckResult,
          ],
          rank: Rank.Silver,
          isMaxRank: false,
        },
      ];

      expect(await sdc.getChildMaturityCheckResults(mockUser)).toEqual(
        expected,
      );
    });
  });

  describe('getMaturityRank', () => {
    it('generates a  maturity rank for a given component', async () => {
      const expected: MaturityRank = {
        rank: Rank.Bronze,
        isMaxRank: false,
      };

      expect(await sdc.getMaturityRank(mockSystem)).toMatchObject(expected);
    });
  });

  describe('getMaturitySummary', () => {
    it('generates a maturity summary for a given system', async () => {
      const expected: MaturitySummary = {
        rank: Rank.Bronze,
        maxRank: Rank.Gold,
        points: 900,
        isMaxRank: false,
        progress: {
          passedChecks: 5,
          totalChecks: 8,
          percentage: 63,
        },
        rankProgress: {
          passedChecks: 2,
          totalChecks: 3,
          percentage: 67,
        },
        areaSummaries: [
          {
            area: 'Ownership',
            progress: {
              passedChecks: 4,
              totalChecks: 7,
              percentage: 57,
            },
            rankProgress: {
              passedChecks: 2,
              totalChecks: 3,
              percentage: 67,
            },
            rank: Rank.Bronze,
            maxRank: Rank.Gold,
            isMaxRank: false,
          },
          {
            area: 'Operations',
            progress: {
              passedChecks: 1,
              totalChecks: 1,
              percentage: 100,
            },
            rankProgress: {
              passedChecks: 1,
              totalChecks: 1,
              percentage: 100,
            },
            rank: Rank.Bronze,
            maxRank: Rank.Bronze,
            isMaxRank: true,
          },
        ],
      };

      expect(await sdc.getMaturitySummary(mockSystem)).toEqual(expected);
    });
  });
});
