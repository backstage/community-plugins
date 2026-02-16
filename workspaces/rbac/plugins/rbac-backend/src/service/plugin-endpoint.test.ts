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
import { mockServices } from '@backstage/backend-test-utils';
import { NotFoundError } from '@backstage/errors';

import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { policyEntityPermissions } from '@backstage-community/plugin-rbac-common';
import { rbacRules } from '../permissions';
import { extendablePluginIdProviderMock } from '../../__fixtures__/mock-utils';
import { ExtendablePluginIdProvider } from './extendable-id-provider';

describe('plugin-endpoint', () => {
  const mockPluginEndpointDiscovery = mockServices.discovery.mock({
    getBaseUrl: async (pluginId: string) => {
      return `https://localhost:7007/api/${pluginId}`;
    },
  });

  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    global.fetch = fetchMock as any;
  });

  afterAll(() => {
    // clean up global pollution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).fetch;
  });

  describe('Test list plugin policies', () => {
    it('should return empty plugin policies list', async () => {
      // asserts that when a plugin’s well-known endpoint is missing (404)
      // the collector returns an empty policies list instead of throwing.
      fetchMock.mockRejectedValueOnce(new NotFoundError());

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(0);
    });

    it('should return non empty plugin policies list with resourced permission', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          return {
            permissions: [
              {
                type: 'resource',
                name: 'catalog.entity.read',
                attributes: { action: 'read' },
                resourceType: 'catalog-entity',
              },
            ],
          };
        },
      } as any);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('catalog');
      expect(policiesMetadata[0].policies).toEqual([
        {
          name: 'catalog.entity.read',
          resourceType: 'catalog-entity',
          policy: 'read',
        },
      ]);
    });

    it('should return non empty plugin policies list with non resourced permission', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          return {
            permissions: [
              {
                type: 'basic',
                name: 'catalog.entity.create',
                attributes: { action: 'create' },
              },
            ],
          };
        },
      } as any);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('catalog');
      expect(policiesMetadata[0].policies).toEqual([
        {
          name: 'catalog.entity.create',
          policy: 'create',
        },
      ]);
    });

    it('should log warning for not found endpoint', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValueOnce(['catalog', 'unknown-plugin-id']);

      fetchMock.mockImplementation(async (wellKnownURL: string) => {
        if (
          wellKnownURL ===
          'https://localhost:7007/api/catalog/.well-known/backstage/permissions/metadata'
        ) {
          return {
            ok: true,
            json: async () => {
              return {
                permissions: [
                  {
                    type: 'resource',
                    resourceType: 'catalog-entity',
                    name: 'catalog.entity.read',
                    attributes: { action: 'read' },
                  },
                ],
              };
            },
          } as any;
        }

        throw new NotFoundError();
      });

      const logger = mockServices.logger.mock();
      const errorSpy = jest.spyOn(logger, 'warn').mockClear();
      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger,
          config: mockServices.rootConfig(),
        },
      });
      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('catalog');
      expect(policiesMetadata[0].policies).toEqual([
        {
          name: 'catalog.entity.read',
          resourceType: 'catalog-entity',
          policy: 'read',
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'No permission metadata found for unknown-plugin-id. NotFoundError',
        ),
      );
    });

    it('should log error when it is not possible to retrieve permission metadata for known endpoint', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockResolvedValueOnce(['scaffolder', 'catalog']);

      fetchMock.mockImplementation(async (wellKnownURL: string) => {
        if (
          wellKnownURL ===
          'https://localhost:7007/api/scaffolder/.well-known/backstage/permissions/metadata'
        ) {
          return {
            ok: true,
            json: async () => {
              return {
                permissions: [
                  {
                    type: 'resource',
                    resourceType: 'scaffolder-template',
                    name: 'scaffolder.template.parameter.read',
                    attributes: { action: 'read' },
                  },
                ],
              };
            },
          } as any;
        }

        throw new Error('Unexpected error');
      });

      const logger = mockServices.logger.mock();
      const errorSpy = jest.spyOn(logger, 'error').mockClear();
      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger,
          config: mockServices.rootConfig(),
        },
      });

      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('scaffolder');
      expect(policiesMetadata[0].policies).toEqual([
        {
          name: 'scaffolder.template.parameter.read',
          resourceType: 'scaffolder-template',
          policy: 'read',
        },
      ]);

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to retrieve permission metadata for catalog. Error: Unexpected error',
      );
    });

    it('should not log error caused by non json permission metadata for known endpoint', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValueOnce(['scaffolder', 'catalog']);
      fetchMock.mockImplementation(async (wellKnownURL: string) => {
        if (
          wellKnownURL ===
          'https://localhost:7007/api/scaffolder/.well-known/backstage/permissions/metadata'
        ) {
          return {
            ok: true,
            json: async () => {
              return {
                permissions: [
                  {
                    type: 'resource',
                    resourceType: 'scaffolder-template',
                    name: 'scaffolder.template.parameter.read',
                    attributes: { action: 'read' },
                  },
                ],
              };
            },
          } as any;
        }

        if (
          wellKnownURL ===
          'https://localhost:7007/api/catalog/.well-known/backstage/permissions/metadata'
        ) {
          return {
            ok: true,
            json: async () => {
              throw new Error('invalid json');
            },
          } as any;
        }

        throw new Error('Unexpected error');
      });

      const logger = mockServices.logger.mock();
      const errorSpy = jest.spyOn(logger, 'error').mockClear();

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger,
          config: mockServices.rootConfig(),
        },
      });
      const policiesMetadata = await collector.getPluginPolicies(
        mockServices.auth(),
      );

      expect(policiesMetadata.length).toEqual(1);
      expect(policiesMetadata[0].pluginId).toEqual('scaffolder');
      expect(policiesMetadata[0].policies).toEqual([
        {
          name: 'scaffolder.template.parameter.read',
          resourceType: 'scaffolder-template',
          policy: 'read',
        },
      ]);

      // workaround for https://issues.redhat.com/browse/RHIDP-1456
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Test list plugin condition rules', () => {
    it('should return empty condition rule list', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValueOnce([]);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const conditionRulesMetadata = await collector.getPluginConditionRules(
        mockServices.auth(),
      );

      expect(conditionRulesMetadata.length).toEqual(0);
    });

    it('should return non empty condition rule list', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValueOnce(['catalog']);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          return {
            rules: [
              {
                description: 'Allow entities with the specified label',
                name: 'HAS_LABEL',
                paramsSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  properties: {
                    label: {
                      description: 'Name of the label to match on',
                      type: 'string',
                    },
                  },
                  required: ['label'],
                  type: 'object',
                },
                resourceType: 'catalog-entity',
              },
            ],
          };
        },
      } as any);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const conditionRulesMetadata = await collector.getPluginConditionRules(
        mockServices.auth(),
      );

      expect(conditionRulesMetadata.length).toEqual(1);
      expect(conditionRulesMetadata[0].pluginId).toEqual('catalog');
      expect(conditionRulesMetadata[0].rules).toEqual([
        {
          description: 'Allow entities with the specified label',
          name: 'HAS_LABEL',
          paramsSchema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            additionalProperties: false,
            properties: {
              label: {
                description: 'Name of the label to match on',
                type: 'string',
              },
            },
            required: ['label'],
            type: 'object',
          },
          resourceType: 'catalog-entity',
        },
      ]);
    });
  });

  describe('Test get plugin metadata by id', () => {
    it('should return metadata by id', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValueOnce(['catalog']);

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          return {
            permissions: [
              {
                type: 'resource',
                name: 'catalog.entity.read',
                attributes: { action: 'read' },
                resourceType: 'catalog-entity',
              },
            ],
            rules: [
              {
                description: 'Allow entities with the specified label',
                name: 'HAS_LABEL',
                paramsSchema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  additionalProperties: false,
                  properties: {
                    label: {
                      description: 'Name of the label to match on',
                      type: 'string',
                    },
                  },
                  required: ['label'],
                  type: 'object',
                },
                resourceType: 'catalog-entity',
              },
            ],
          };
        },
      } as any);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const metadata = await collector.getMetadataByPluginId(
        'catalog',
        undefined,
      );

      expect(metadata).not.toBeUndefined();
      expect(metadata?.permissions).toEqual([
        {
          name: 'catalog.entity.read',
          attributes: { action: 'read' },
          type: 'resource',
          resourceType: 'catalog-entity',
        },
      ]);
      expect(metadata?.rules).toEqual([
        {
          description: 'Allow entities with the specified label',
          name: 'HAS_LABEL',
          paramsSchema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            additionalProperties: false,
            properties: {
              label: {
                description: 'Name of the label to match on',
                type: 'string',
              },
            },
            required: ['label'],
            type: 'object',
          },
          resourceType: 'catalog-entity',
        },
      ]);
    });

    it('should return metadata by id (rbac-plugin)', async () => {
      (
        extendablePluginIdProviderMock.getPluginIds as jest.Mock
      ).mockReturnValue(['permission']);

      const collector = new PluginPermissionMetadataCollector({
        deps: {
          discovery: mockPluginEndpointDiscovery,
          pluginIdProvider:
            extendablePluginIdProviderMock as ExtendablePluginIdProvider,
          logger: mockServices.logger.mock(),
          config: mockServices.rootConfig(),
        },
      });
      const metadata = await collector.getMetadataByPluginId(
        'permission',
        undefined,
      );

      expect(metadata).not.toBeUndefined();
      expect(metadata?.permissions).toEqual(policyEntityPermissions);
      expect(metadata?.rules).toEqual([rbacRules]);
    });
  });
});
