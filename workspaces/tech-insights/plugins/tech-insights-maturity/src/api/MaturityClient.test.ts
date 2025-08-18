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
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  MaturityCheckResult,
  MaturityRank,
  MaturitySummary,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { MaturityClient } from './MaturityClient';
import {
  activeOwnershipCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
} from './testData';
import { mockApis } from '@backstage/test-utils';

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
      type: 'hasPart',
      targetRef: 'component:default/mock-component',
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
    name: 'mock-component',
    title: 'mock-component (Self Help Service)',
    description: 'A service that helps users of our platform report issues',
  },
  relations: [
    {
      type: 'partOf',
      targetRef: 'system:default/mock-system',
    },
    {
      type: 'ownedBy',
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

const checkResults = [
  awsWarningsCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
  activeOwnershipCheckResult,
];

const bulkCheckResult = [
  {
    entity: stringifyEntityRef(entity),
    results: checkResults,
  },
];

const maturitySummary: MaturitySummary = {
  rank: Rank.Silver,
  maxRank: Rank.Gold,
  points: 400,
  isMaxRank: false,
  progress: {
    passedChecks: 3,
    totalChecks: 4,
    percentage: 75,
  },
  rankProgress: {
    passedChecks: 0,
    totalChecks: 1,
    percentage: 0,
  },
  areaSummaries: [
    {
      area: 'Ownership',
      progress: {
        passedChecks: 2,
        totalChecks: 3,
        percentage: 67,
      },
      rankProgress: {
        passedChecks: 0,
        totalChecks: 1,
        percentage: 0,
      },
      rank: Rank.Silver,
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
      type: 'hasMember',
      targetRef: 'user:test/mock-user',
    },
    {
      type: 'ownerOf',
      targetRef: 'component:default/mock-component',
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

const sdc = new MaturityClient({
  catalogApi: mockCatalogApi as CatalogApi,
  discoveryApi: mockApis.discovery.mock(),
  identityApi: mockApis.identity.mock(),
});

describe('MaturityClient', () => {
  describe('getMaturityRank', () => {
    it('generates a  maturity rank for a given component', async () => {
      const expected: MaturityRank = {
        rank: Rank.Silver,
        isMaxRank: false,
      };
      jest.spyOn(sdc, 'runChecks').mockResolvedValue(checkResults);

      expect(await sdc.getMaturityRank(mockSystem)).toMatchObject(expected);
    });
  });

  describe('getMaturityScore', () => {
    jest.spyOn(sdc, 'runChecks').mockResolvedValue(checkResults);
    it('generates a maturity score for a given component', async () => {
      const score = await sdc.getMaturityScore(entity);
      expect(score.checks).toEqual(checkResults); // Ownership and Operations
      expect(score.rank.rank).toEqual(2); // Silver
      expect(score.rank.isMaxRank).toEqual(false);
      expect(score.summary).toEqual(maturitySummary);
    });
  });

  describe('getMaturitySummary', () => {
    jest.spyOn(sdc, 'runBulkChecks').mockResolvedValue(bulkCheckResult);

    it('generates a maturity summary for a given system', async () => {
      expect(await sdc.getMaturitySummary(mockSystem)).toEqual(maturitySummary);
    });
  });
});
