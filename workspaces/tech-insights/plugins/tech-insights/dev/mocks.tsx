/*
 * Copyright 2023 The Backstage Authors
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
  BulkCheckResponse,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import {
  BooleanCheck,
  CheckResultRenderer,
} from '@backstage-community/plugin-tech-insights-react';

export const runChecksResponse = [
  {
    facts: {
      'fact-id': {
        id: '1',
        type: 'boolean',
        description: 'fact description',
        value: true,
      },
    },
    check: {
      id: 'fact-id',
      type: 'boolean',
      name: 'The check name',
      description: `The check description  \nusing markdown **bold** and a [link](https://backstage.io)`,
      factIds: ['1'],
    },
    result: true,
  } as CheckResult,
];

export const checkResultRenderers = [
  {
    type: 'boolean',
    component: (check: CheckResult) => <BooleanCheck checkResult={check} />,
  } as CheckResultRenderer,
];

export const bulkCheckResponse = [
  {
    entity: 'api:default/hello-world',
    results: [
      {
        facts: {
          hasDescription: {
            id: 'factId',
            value: true,
            type: 'boolean',
            description: 'The entity has a description in metadata',
          },
        },
        result: true,
        check: {
          id: 'descriptionCheck',
          type: 'json-rules-engine',
          name: 'Description Check',
          description:
            'Verifies that a Description, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasDescription',
                  factResult: true,
                  result: true,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasTitle: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a title in metadata',
          },
        },
        result: false,
        check: {
          id: 'titleCheck',
          type: 'json-rules-engine',
          name: 'Title Check',
          description:
            'Verifies that a Title, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasTitle',
                  factResult: false,
                  result: false,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasAnnotationBackstageIoTechdocsRef: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a TechDocs reference annotation',
          },
        },
        result: false,
        check: {
          id: 'techDocsCheck',
          type: 'json-rules-engine',
          name: 'TechDocs Check',
          description:
            'Verifies that TechDocs has been enabled for this entity',
          factIds: ['techdocsFactRetriever'],
        },
      },
    ],
  },
  {
    entity: 'api:default/hello-world-trpc',
    results: [
      {
        facts: {
          hasDescription: {
            id: 'factId',
            value: true,
            type: 'boolean',
            description: 'The entity has a description in metadata',
          },
        },
        result: true,
        check: {
          id: 'descriptionCheck',
          type: 'json-rules-engine',
          name: 'Description Check',
          description:
            'Verifies that a Description, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasDescription',
                  factResult: true,
                  result: true,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasTitle: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a title in metadata',
          },
        },
        result: false,
        check: {
          id: 'titleCheck',
          type: 'json-rules-engine',
          name: 'Title Check',
          description:
            'Verifies that a Title, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasTitle',
                  factResult: false,
                  result: false,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasAnnotationBackstageIoTechdocsRef: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a TechDocs reference annotation',
          },
        },
        result: false,
        check: {
          id: 'techDocsCheck',
          type: 'json-rules-engine',
          name: 'TechDocs Check',
          description:
            'Verifies that TechDocs has been enabled for this entity',
          factIds: ['techdocsFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasAnnotationBackstageIoTechdocsRef',
                  factResult: false,
                  result: false,
                },
              ],
            },
          },
        },
      },
    ],
  },
  {
    entity: 'api:default/spotify',
    results: [
      {
        facts: {
          hasDescription: {
            id: 'factId',
            value: true,
            type: 'boolean',
            description: 'The entity has a description in metadata',
          },
        },
        result: true,
        check: {
          id: 'descriptionCheck',
          type: 'json-rules-engine',
          name: 'Description Check',
          description:
            'Verifies that a Description, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasDescription',
                  factResult: true,
                  result: true,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasTitle: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a title in metadata',
          },
        },
        result: false,
        check: {
          id: 'titleCheck',
          type: 'json-rules-engine',
          name: 'Title Check',
          description:
            'Verifies that a Title, used to improve readability, has been set for this entity',
          factIds: ['entityMetadataFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasTitle',
                  factResult: false,
                  result: false,
                },
              ],
            },
          },
        },
      },
      {
        facts: {
          hasAnnotationBackstageIoTechdocsRef: {
            id: 'factId',
            value: false,
            type: 'boolean',
            description: 'The entity has a TechDocs reference annotation',
          },
        },
        result: false,
        check: {
          id: 'techDocsCheck',
          type: 'json-rules-engine',
          name: 'TechDocs Check',
          description:
            'Verifies that TechDocs has been enabled for this entity',
          factIds: ['techdocsFactRetriever'],
          rule: {
            conditions: {
              priority: 1,
              all: [
                {
                  operator: 'equal',
                  value: true,
                  fact: 'hasAnnotationBackstageIoTechdocsRef',
                  factResult: false,
                  result: false,
                },
              ],
            },
          },
        },
      },
    ],
  },
] as BulkCheckResponse;
