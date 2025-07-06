/*
 * Copyright 2020 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';
import { createRouter } from './router';
import { CatalogRequestOptions } from '@backstage/catalog-client';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';

jest.mock('./CodeCoverageDatabase');

import { CodeCoverageDatabase } from './CodeCoverageDatabase';
import {
  DiscoveryService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';

CodeCoverageDatabase.create = jest.fn(
  async () =>
    ({
      getCodeCoverage: async () => ({
        files: [],
        metadata: {
          generationTime: 1,
        },
      }),
      getHistory: async () => ({}),
      insertCodeCoverage: async () => undefined,
    } as any),
);

let catalogRequestOptions: CatalogRequestOptions;

jest.mock('@backstage/catalog-client', () => ({
  CatalogClient: jest.fn().mockImplementation(() => ({
    getEntityByRef: async (_: string, options: CatalogRequestOptions) => {
      catalogRequestOptions = options;
      return {
        metadata: {
          annotations: {
            'backstage.io/code-coverage': 'enabled',
          },
        },
      };
    },
  })),
}));

const testDiscovery: jest.Mocked<DiscoveryService> = {
  getBaseUrl: jest
    .fn()
    .mockResolvedValue('http://localhost:7007/api/code-coverage'),
  getExternalBaseUrl: jest.fn(),
};
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

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      config: new ConfigReader({}),
      database: mockServices.database.mock(),
      discovery: testDiscovery,
      urlReader: mockUrlReader,
      logger: mockServices.logger.mock(),
      auth: mockServices.auth(),
      httpAuth: mockServices.httpAuth(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  [
    '/report?entity=component:default/mycomponent',
    '/history?entity=component:default/mycomponent',
  ].forEach(uri => {
    describe(`GET ${uri}`, () => {
      it('forwards request credentials to the catalog api call', async () => {
        const response = await request(app)
          .get(uri)
          .set(
            'Authorization',
            mockCredentials.user.header('user:default/other'),
          );

        expect(response.status).toEqual(200);
        expect(catalogRequestOptions.token).toEqual(
          mockCredentials.service.token({
            onBehalfOf: mockCredentials.user('user:default/other'),
            targetPluginId: 'catalog',
          }),
        );
      });
    });
  });

  describe('POST /report', () => {
    it('returns created when body does not exceed limit', async () => {
      const response = await request(app)
        .post('/report?entity=component:default/mycomponent&coverageType=lcov')
        .set('Content-Type', 'text/plain')
        .send(
          'TN:\nSF:/src/index.js\nFNF:0\nFNH:0\nLF:1\nLH:1\nBRF:0\nBRH:0\nend_of_record',
        );

      expect(response.status).toBe(201);
    });

    it('returns content too large when body exceeds limit', async () => {
      const router = await createRouter({
        config: new ConfigReader({
          codeCoverage: {
            bodySizeLimit: '1b',
          },
        }),
        database: mockServices.database.mock(),
        discovery: testDiscovery,
        urlReader: mockUrlReader,
        logger: mockServices.logger.mock(),
        auth: mockServices.auth.mock(),
        httpAuth: mockServices.httpAuth.mock(),
      });
      app = express().use(router);

      const response = await request(app)
        .post('/report?entity=component:default/mycomponent&coverageType=lcov')
        .set('Content-Type', 'text/plain')
        .send(
          'TN:\nSF:/src/index.js\nFNF:0\nFNH:0\nLF:1\nLH:1\nBRF:0\nBRH:0\nend_of_record',
        );

      expect(response.status).toBe(413);
    });
  });
});
