/*
 * Copyright 2022 The Backstage Authors
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

import express from 'express';
import request from 'supertest';
import { Server } from 'http';
import { createRouter } from './router';
import { wrapServer } from '@backstage/backend-openapi-utils/testUtils';
import { LinguistBackendApi } from '../api';
import {
  mockCredentials,
  mockServices,
  TestDatabases,
} from '@backstage/backend-test-utils';
import {
  linguistReadPermission,
  linguistProcessPermission,
} from '@backstage-community/plugin-linguist-common';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PermissionsService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';

const mockUrlReader: UrlReaderService = {
  readUrl: url =>
    Promise.resolve({
      buffer: async () => Buffer.from(url),
      etag: 'buffer',
      stream: jest.fn(),
    }),
  readTree: jest.fn(),
  search: jest.fn(),
};

const databases = TestDatabases.create();

describe('createRouter', () => {
  const linguistBackendApi: jest.Mocked<LinguistBackendApi> =
    {} as jest.Mocked<LinguistBackendApi>;
  let app: express.Express | Server;

  describe('GET /health', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    beforeAll(async () => {
      const knex = await databases.init('SQLITE_3');
      const getClient = jest.fn(async () => knex);
      const router = await createRouter({
        linguistBackendApi: linguistBackendApi,
        discovery: mockServices.discovery.mock(),
        database: mockServices.database.mock({ getClient }),
        reader: mockUrlReader,
        logger: mockServices.logger.mock(),
        config: mockServices.rootConfig(),
        auth: mockServices.auth(),
      });
      app = await wrapServer(express().use(router));
    });
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('actions registry', () => {
    const mockActionsRegistry = { register: jest.fn() };
    const actionsApi: jest.Mocked<LinguistBackendApi> =
      {} as jest.Mocked<LinguistBackendApi>;
    const mockPermissions: jest.Mocked<PermissionsService> = {
      authorize: jest.fn(),
    } as unknown as jest.Mocked<PermissionsService>;

    beforeAll(async () => {
      const knex = await databases.init('SQLITE_3');
      const getClient = jest.fn(async () => knex);
      await createRouter({
        linguistBackendApi: actionsApi,
        discovery: mockServices.discovery.mock(),
        database: mockServices.database.mock({ getClient }),
        reader: mockUrlReader,
        logger: mockServices.logger.mock(),
        config: mockServices.rootConfig(),
        auth: mockServices.auth(),
        actionsRegistry: mockActionsRegistry as any,
        permissions: mockPermissions,
      });
    });

    it('registers the get-entity-languages action', () => {
      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'get-entity-languages',
      )?.[0];
      expect(reg).toBeDefined();
      expect(reg.title).toBe('Get Entity Languages');
      expect(reg.attributes).toEqual({
        readOnly: true,
        idempotent: true,
        destructive: false,
      });
      expect(reg.visibilityPermission).toBe(linguistReadPermission);
    });

    it('registers the process-entities action', () => {
      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'process-entities',
      )?.[0];
      expect(reg).toBeDefined();
      expect(reg.title).toBe('Process Entities');
      expect(reg.attributes).toEqual({
        readOnly: false,
        idempotent: false,
        destructive: false,
      });
      expect(reg.visibilityPermission).toBe(linguistProcessPermission);
    });

    it('get-entity-languages action calls getEntityLanguages when authorized', async () => {
      const mockLanguages = {
        languageCount: 2,
        totalBytes: 1000,
        processedDate: '2026-01-01T00:00:00Z',
        breakdown: [
          {
            name: 'TypeScript',
            percentage: 80,
            bytes: 800,
            type: 'programming' as const,
            color: '#3178c6',
          },
          {
            name: 'JavaScript',
            percentage: 20,
            bytes: 200,
            type: 'programming' as const,
            color: '#f1e05a',
          },
        ],
      };
      actionsApi.getEntityLanguages = jest
        .fn()
        .mockResolvedValue(mockLanguages);
      mockPermissions.authorize.mockResolvedValueOnce([
        { result: AuthorizeResult.ALLOW },
      ]);

      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'get-entity-languages',
      )?.[0];

      const result = await reg.action({
        input: { entityRef: 'component:default/my-service' },
        credentials: mockCredentials.user(),
        logger: mockServices.logger.mock(),
      });

      expect(mockPermissions.authorize).toHaveBeenCalledWith(
        [{ permission: linguistReadPermission }],
        { credentials: mockCredentials.user() },
      );
      expect(actionsApi.getEntityLanguages).toHaveBeenCalledWith(
        'component:default/my-service',
      );
      expect(result.output).toEqual(mockLanguages);
    });

    it('get-entity-languages action throws when not allowed', async () => {
      mockPermissions.authorize.mockResolvedValueOnce([
        { result: AuthorizeResult.CONDITIONAL },
      ]);

      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'get-entity-languages',
      )?.[0];

      await expect(
        reg.action({
          input: { entityRef: 'component:default/my-service' },
          credentials: mockCredentials.user(),
          logger: mockServices.logger.mock(),
        }),
      ).rejects.toThrow('Unauthorized');
    });

    it('process-entities action calls processEntities when authorized', async () => {
      actionsApi.processEntities = jest.fn().mockResolvedValue(undefined);
      mockPermissions.authorize.mockResolvedValueOnce([
        { result: AuthorizeResult.ALLOW },
      ]);

      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'process-entities',
      )?.[0];

      const result = await reg.action({
        input: {},
        credentials: mockCredentials.user(),
        logger: mockServices.logger.mock(),
      });

      expect(mockPermissions.authorize).toHaveBeenCalledWith(
        [{ permission: linguistProcessPermission }],
        { credentials: mockCredentials.user() },
      );
      expect(actionsApi.processEntities).toHaveBeenCalled();
      expect(result.output).toEqual({});
    });

    it('process-entities action throws when not allowed', async () => {
      mockPermissions.authorize.mockResolvedValueOnce([
        { result: AuthorizeResult.CONDITIONAL },
      ]);

      const reg = mockActionsRegistry.register.mock.calls.find(
        (c: any[]) => c[0].name === 'process-entities',
      )?.[0];

      await expect(
        reg.action({
          input: {},
          credentials: mockCredentials.user(),
          logger: mockServices.logger.mock(),
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
