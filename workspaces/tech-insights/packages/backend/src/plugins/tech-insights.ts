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

export const checks = [
  {
    id: 'groupOwnerCheck',
    type: JSON_RULE_ENGINE_CHECK_TYPE,
    name: 'Group Owner Check',
    description:
      'Verifies that a Group has been set as the owner for this entity',
    factIds: ['entityOwnershipFactRetriever'],
    rule: {
      conditions: {
        all: [
          {
            fact: 'hasGroupOwner',
            operator: 'equal',
            value: true,
          },
        ],
      },
    },
  },
  {
    id: 'apiDefinitionCheck',
    type: JSON_RULE_ENGINE_CHECK_TYPE,
    name: 'API definition Check',
    description: 'Verifies that a API has a definition set',
    factIds: ['apiDefinitionFactRetriever'],
    rule: {
      conditions: {
        all: [
          {
            fact: 'hasDefinition',
            operator: 'equal',
            value: true,
          },
        ],
      },
    },
  },
];

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
