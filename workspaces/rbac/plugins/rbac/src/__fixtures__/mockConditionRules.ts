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
export const mockConditionRules = [
  {
    pluginId: 'catalog',
    rules: [
      {
        name: 'HAS_ANNOTATION',
        description: 'Allow entities with the specified annotation',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            annotation: {
              type: 'string',
              description: 'Name of the annotation to match on',
            },
            value: {
              type: 'string',
              description: 'Value of the annotation to match on',
            },
          },
          required: ['annotation'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_LABEL',
        description: 'Allow entities with the specified label',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Name of the label to match on',
            },
          },
          required: ['label'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_METADATA',
        description: 'Allow entities with the specified metadata subfield',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property within the entities metadata to match on',
            },
            value: {
              type: 'string',
              description: 'Value of the given property to match on',
            },
          },
          required: ['key'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_SPEC',
        description: 'Allow entities with the specified spec subfield',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property within the entities spec to match on',
            },
            value: {
              type: 'string',
              description: 'Value of the given property to match on',
            },
          },
          required: ['key'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'IS_ENTITY_KIND',
        description: 'Allow entities matching a specified kind',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            kinds: {
              type: 'array',
              items: { type: 'string' }, // TODO: should be enum?
              minItems: 1,
              description: 'List of kinds to match at least one of',
            },
          },
          required: ['kinds'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'IS_ENTITY_OWNER',
        description: 'Allow entities owned by a specified claim',
        resourceType: 'catalog-entity',
        paramsSchema: {
          type: 'object',
          properties: {
            claims: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description:
                'List of claims to match at least one on within ownedBy',
            },
          },
          required: ['claims'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    rules: [
      {
        name: 'HAS_TAG',
        description: 'Match parameters or steps with the given tag',
        resourceType: 'scaffolder-template',
        paramsSchema: {
          type: 'object',
          properties: {
            tag: {
              type: 'string',
              description: 'Name of the tag to match on',
            },
          },
          required: ['tag'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_ACTION_ID',
        description: 'Match actions with the given actionId',
        resourceType: 'scaffolder-action',
        paramsSchema: {
          type: 'object',
          properties: {
            actionId: {
              type: 'string',
              description: 'Name of the actionId to match on',
            },
          },
          required: ['actionId'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_BOOLEAN_PROPERTY',
        description: 'Allow actions with the specified property',
        resourceType: 'scaffolder-action',
        paramsSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property within the action parameters to match on',
            },
            value: {
              type: 'boolean',
              description: 'Value of the given property to match on',
            },
          },
          required: ['key', 'value'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_NUMBER_PROPERTY',
        description: 'Allow actions with the specified property',
        resourceType: 'scaffolder-action',
        paramsSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property within the action parameters to match on',
            },
            value: {
              type: 'number',
              description: 'Value of the given property to match on',
            },
          },
          required: ['key', 'value'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
      {
        name: 'HAS_STRING_PROPERTY',
        'descriptio* Connection #0 to host localhost left intactn':
          'Allow actions with the specified property',
        resourceType: 'scaffolder-action',
        paramsSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Property within the action parameters to match on',
            },
            value: {
              type: 'string',
              description: 'Value of the given property to match on',
            },
          },
          required: ['key', 'value'],
          additionalProperties: false,
          $schema: 'http://json-schema.org/draft-07/schema#',
        },
      },
    ],
  },
];
