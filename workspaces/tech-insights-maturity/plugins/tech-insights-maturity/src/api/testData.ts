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
  MaturityCheckResult,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';

export const productOwnershipCheckResult: MaturityCheckResult = {
  facts: {
    hasProductOwner: {
      id: 'hasProductOwner',
      type: 'boolean' as const,
      description: 'Product owner is present in factbook',
      value: true,
    },
  },
  result: true,
  check: {
    id: 'productOwnershipCheck',
    type: 'Ownership',
    name: 'Product Ownership',
    description: 'Entity has a full product ownership',
    factIds: ['entityStakeholdersFactRetriever'],
    links: [
      {
        title: 'ownership',
        url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
      },
    ],
    metadata: {
      exp: 100,
      rank: Rank.Bronze,
      category: 'Ownership',
      solution:
        'Add a person with "product owner" role to metadata.people list in the factbook',
    },
  },
  updated: 'updated today',
};

export const technicalOwnershipCheckResult: MaturityCheckResult = {
  facts: {
    hasTechnicalOwner: {
      id: 'hasTechnicalOwner',
      type: 'boolean' as const,
      description: 'Technical owner is present in factbook',
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
        'Add a person with "technical owner" role to metadata.people list in the factbook',
    },
  },
  updated: 'updated today',
};

export const activeOwnershipCheckResult: MaturityCheckResult = {
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
    links: [
      {
        title: 'ownership',
        url: 'https://devops.imedidata.net/docs/default/component/observability/practices/ownership/authoring-factbook/#ownership',
      },
    ],
    metadata: {
      exp: 300,
      rank: Rank.Gold,
      category: 'Ownership',
      solution:
        'Add active medidata engineer with "technical owner" role to metadata.people list in the factbook',
    },
    factIds: ['entityStakeholdersFactRetriever'],
  },
  updated: 'updated today',
};

export const hasReadMeCheckResult: MaturityCheckResult = {
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
  updated: 'updated today',
};
