/*
 * Copyright 2024 The Backstage Authors
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
import { JSON_RULE_ENGINE_CHECK_TYPE } from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity, ApiEntityV1alpha1 } from '@backstage/catalog-model';
import {
  FactRetriever,
  FactRetrieverContext,
} from '@backstage-community/plugin-tech-insights-node';

// export const checks = [
//   {
//     id: 'groupOwnerCheck',
//     type: JSON_RULE_ENGINE_CHECK_TYPE,
//     name: 'Group Owner Check',
//     description:
//       'Verifies that a Group has been set as the owner for this entity',
//     factIds: ['entityOwnershipFactRetriever'],
//     rule: {
//       conditions: {
//         all: [
//           {
//             fact: 'hasGroupOwner',
//             operator: 'equal',
//             value: true,
//           },
//         ],
//       },
//     },
//   },
//   {
//     id: 'apiDefinitionCheck',
//     type: JSON_RULE_ENGINE_CHECK_TYPE,
//     name: 'API definition Check',
//     description: 'Verifies that a API has a definition set',
//     factIds: ['apiDefinitionFactRetriever'],
//     rule: {
//       conditions: {
//         all: [
//           {
//             fact: 'hasDefinition',
//             operator: 'equal',
//             value: true,
//           },
//         ],
//       },
//     },
//   },
// ];

export const apiDefinitionFactRetriever: FactRetriever = {
  id: 'apiDefinitionFactRetriever',
  version: '0.0.1',
  title: 'API Definition',
  description: 'Generates facts which indicate the completeness of API spec',
  schema: {
    hasDefinition: {
      type: 'boolean',
      description: 'The entity has a definition in spec',
    },
  },
  handler: async ({ discovery, auth }: FactRetrieverContext) => {
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const catalogClient = new CatalogClient({
      discoveryApi: discovery,
    });
    const entities = await catalogClient.getEntities(
      { filter: { kind: ['API'] } },
      { token },
    );

    return entities.items.map((entity: Entity) => {
      return {
        entity: {
          namespace: entity.metadata.namespace!,
          kind: entity.kind,
          name: entity.metadata.name,
        },
        facts: {
          hasDefinition:
            (entity as ApiEntityV1alpha1).spec?.definition &&
            (entity as ApiEntityV1alpha1).spec?.definition.length > 0,
        },
      };
    });
  },
};

export const myFactRetriever: FactRetriever = {
  id: 'myFactRetriever', // unique identifier of the fact retriever
  version: '0.1.1', // SemVer version number of this fact retriever schema. This should be incremented if the implementation changes
  entityFilter: [{ kind: 'component' }], // EntityFilter to be used in the future (creating checks, graphs etc.) to figure out which entities this fact retrieves data for.
  schema: {
    // Name/identifier of an individual fact that this retriever returns
    examplenumberfact: {
      type: 'integer', // Type of the fact
      description: 'A fact of a number', // Description of the fact
    },
  },
  handler: async ({ discovery, auth }: FactRetrieverContext) => {
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const catalogClient = new CatalogClient({
      discoveryApi: discovery,
    });
    const entities = await catalogClient.getEntities(
      {
        filter: [{ kind: 'component' }],
      },
      { token },
    );
    return entities.items.map(it => {
      return {
        entity: {
          namespace: it.metadata.namespace!,
          kind: it.kind,
          name: it.metadata.name,
        },
        facts: {
          examplenumberfact: 2,
        },
      };
    });
  },
};
