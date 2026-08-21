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
import { Entity } from '@backstage/catalog-model';
import { mockServices } from '@backstage/backend-test-utils';
import { EntityPatchClient } from './EntityPatchClient';

let mockFetch: jest.SpyInstance;

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'my-service', namespace: 'default' },
  spec: {},
};

const mockCache = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
};

function makeClient() {
  return new EntityPatchClient({
    logger: mockServices.logger.mock(),
    discovery: mockServices.discovery(),
    auth: mockServices.auth(),
  });
}

beforeEach(() => {
  mockFetch = jest.spyOn(global, 'fetch');
  jest.clearAllMocks();
  mockCache.get.mockResolvedValue(undefined);
});

afterEach(() => {
  mockFetch.mockRestore();
});

describe('EntityPatchClient', () => {
  describe('getPatchData', () => {
    it('returns data and stores it in the cache on a 200 response', async () => {
      const patchData = { 'comp-patch': { description: 'patched' } };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-v1"' : null) },
        json: async () => patchData,
      });

      const result = await makeClient().getPatchData(entity, mockCache as any);

      expect(result).toEqual(patchData);
      expect(mockCache.set).toHaveBeenCalledWith(
        'component:default/my-service',
        expect.objectContaining({ data: patchData, etag: '"etag-v1"' }),
      );
    });

    it('returns cached data and re-writes the cache entry on a 304 response', async () => {
      const cached = {
        data: { 'comp-patch': { description: 'cached' } },
        etag: '"etag-v1"',
      };
      mockCache.get.mockResolvedValue(cached);
      mockFetch.mockResolvedValue({ ok: false, status: 304 });

      const result = await makeClient().getPatchData(entity, mockCache as any);

      expect(result).toEqual(cached.data);
      // Must re-write so the cache entry survives the next cycle (matches UrlReaderProcessor pattern)
      expect(mockCache.set).toHaveBeenCalledWith(
        'component:default/my-service',
        cached,
      );
    });

    it('sends If-None-Match header when a cached ETag is available', async () => {
      mockCache.get.mockResolvedValue({ data: {}, etag: '"etag-v1"' });
      mockFetch.mockResolvedValue({ ok: false, status: 304 });

      await makeClient().getPatchData(entity, mockCache as any);

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['If-None-Match']).toBe('"etag-v1"');
    });

    it('omits If-None-Match header when there is no cached data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({}),
      });

      await makeClient().getPatchData(entity, mockCache as any);

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['If-None-Match']).toBeUndefined();
    });

    it('returns null on a 404 response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const result = await makeClient().getPatchData(entity, mockCache as any);

      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('returns null on a non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      const result = await makeClient().getPatchData(entity, mockCache as any);

      expect(result).toBeNull();
    });

    it('returns null on a network error', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await makeClient().getPatchData(entity, mockCache as any);

      expect(result).toBeNull();
    });

    it('builds the correct URL from entity kind, namespace and name', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => ({}),
      });

      await makeClient().getPatchData(
        {
          ...entity,
          kind: 'Group',
          metadata: { name: 'platform team', namespace: 'my-ns' },
        },
        mockCache as any,
      );

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/values/my-ns/Group/platform%20team');
    });
  });
});
