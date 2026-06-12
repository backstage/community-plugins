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

import {
  getProxyConfig,
  listApiDocs,
  listServices,
} from './ThreeScaleAPIConnector';
import type { APIDocs, Proxy, Services } from './types';

describe('ThreeScaleAPIConnector', () => {
  const baseUrl = 'https://example-admin.3scale.net';
  const accessToken = 'test-token';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listServices', () => {
    it('returns parsed JSON for a successful response', async () => {
      const services: Services = { services: [] };
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => services,
      } as Response);

      await expect(listServices(baseUrl, accessToken, 2, 100)).resolves.toEqual(
        services,
      );

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/admin/api/services.json');
      expect(calledUrl).toContain(`access_token=${accessToken}`);
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('size=100');
    });

    it('throws with statusText for a non-OK response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      } as Response);

      await expect(listServices(baseUrl, accessToken, 0, 500)).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('listApiDocs', () => {
    it('returns parsed JSON for a successful response', async () => {
      const apiDocs: APIDocs = { api_docs: [] };
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => apiDocs,
      } as Response);

      await expect(listApiDocs(baseUrl, accessToken)).resolves.toEqual(apiDocs);

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/admin/api/active_docs.json');
      expect(calledUrl).toContain(`access_token=${accessToken}`);
    });

    it('throws with statusText for a non-OK response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      } as Response);

      await expect(listApiDocs(baseUrl, accessToken)).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('getProxyConfig', () => {
    it('returns parsed JSON for a successful response', async () => {
      const proxy: Proxy = {
        proxy: {
          service_id: 2,
          endpoint: 'https://production.example.com',
          sandbox_endpoint: 'https://staging.example.com',
        } as Proxy['proxy'],
      };
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => proxy,
      } as Response);

      await expect(getProxyConfig(baseUrl, accessToken, 2)).resolves.toEqual(
        proxy,
      );

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/admin/api/services/2/proxy.json');
      expect(calledUrl).toContain(`access_token=${accessToken}`);
    });

    it('throws with statusText for a non-OK response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      } as Response);

      await expect(getProxyConfig(baseUrl, accessToken, 2)).rejects.toThrow(
        'Unauthorized',
      );
    });
  });
});
