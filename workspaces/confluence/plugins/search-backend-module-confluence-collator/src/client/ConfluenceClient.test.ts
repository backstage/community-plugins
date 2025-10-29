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
import { ConfluenceClient } from './ConfluenceClient';
import { mockServices } from '@backstage/backend-test-utils';
import { CacheService } from '@backstage/backend-plugin-api';

const logger = mockServices.logger.mock();

describe('ConfluenceClient', () => {
  const baseUrl = 'https://confluence.example.com';
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    withOptions: jest.fn(),
  } as jest.Mocked<CacheService>;

  const createClient = (options: { cache?: CacheService } = {}) => {
    return new ConfluenceClient({
      baseUrl,
      auth: 'bearer',
      token: 'test-token',
      logger,
      ...options,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search documents with version info', async () => {
    const client = createClient();
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: '123',
              _links: { self: '/rest/api/content/123' },
              version: { when: '2024-01-01T00:00:00.000Z' },
            },
          ],
          _links: {},
        }),
    });
    (client as any).fetch = mockFetch;

    const result = await client.searchDocuments('type=page');

    expect(result).toEqual([
      {
        url: 'https://confluence.example.com/rest/api/content/123',
        versionWhen: '2024-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('should use cache when available', async () => {
    const cachedDocument = { title: 'Cached Document', status: 'current' };
    mockCache.get.mockResolvedValue(cachedDocument);

    const client = createClient({ cache: mockCache });
    const result = await client.getDocument(
      '/rest/api/content/123',
      '2024-01-01T00:00:00.000Z',
    );

    expect(result).toEqual(cachedDocument);
    expect(mockCache.get).toHaveBeenCalledWith(
      'confluence:123:2024-01-01T00:00:00.000Z:v1',
    );
  });

  it('should fall back to fetching when cache fails', async () => {
    mockCache.get.mockRejectedValue(new Error('Cache error'));
    const fetchedDocument = { title: 'Fetched Document', status: 'current' };
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fetchedDocument),
    });

    const client = createClient({ cache: mockCache });
    (client as any).fetch = mockFetch;

    const result = await client.getDocument(
      '/rest/api/content/123',
      '2024-01-01T00:00:00.000Z',
    );

    expect(result).toEqual(fetchedDocument);
    expect(mockFetch).toHaveBeenCalled();
  });
});
