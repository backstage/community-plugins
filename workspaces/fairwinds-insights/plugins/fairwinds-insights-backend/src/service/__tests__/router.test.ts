/*
 * Copyright 2026 The Backstage Authors
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
import { ConfigReader } from '@backstage/config';
import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from '../router';
import { AuthService } from '@backstage/backend-plugin-api';

describe('createRouter', () => {
  const mockCatalogApi = {
    getEntityByRef: jest.fn(),
  } as unknown as CatalogClient;

  const mockAuth = {
    getToken: jest.fn(),
  } as unknown as AuthService;

  const mockCache = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    withOptions: jest.fn().mockReturnThis(),
  };

  const config = new ConfigReader({
    fairwindsInsights: {
      apiUrl: 'https://insights.fairwinds.com',
      apiKey: 'test-api-key',
      organization: 'test-org',
      cacheTTL: 300,
    },
  });

  const logger = mockServices.logger.mock();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a router', async () => {
    const router = await createRouter({
      config,
      catalogApi: mockCatalogApi,
      logger,
      auth: mockAuth,
      cache: mockCache,
    });

    expect(router).toBeDefined();
  });

  // Additional tests would require mocking the Fairwinds Insights API
  // and setting up proper test infrastructure
});
