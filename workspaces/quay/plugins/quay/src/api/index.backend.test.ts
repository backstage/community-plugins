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

/**
 * This file holds similar tests to index.test.ts but it tests using the quay backend
 * instead of using the proxy.
 */

import { IdentityApi } from '@backstage/core-plugin-api';
import { mockApis } from '@backstage/test-utils';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { QUAY_SINGLE_INSTANCE_NAME } from '@backstage-community/plugin-quay-common';

import { QuayApiClient, QuayApiV1 } from './index';

const LOCAL_API_ADDR = 'https://localhost:7070/api/quay';
const DEFAULT_PROXY_ADDR = 'https://localhost:7070/api/proxy';

const apiHandlers = [
  // Default proxy request if apiUrl is not set.
  rest.get(
    `${DEFAULT_PROXY_ADDR}/quay/api/api/v1/repository/foo/bar/tag/`,
    (req, res, ctx) => {
      if (req.url.searchParams.get('limit') === '1') {
        return res(
          ctx.status(200),
          ctx.json(require(`${__dirname}/fixtures/tags/foo_limit.json`)),
        );
      } else if (req.url.searchParams.get('page') === '2') {
        return res(
          ctx.status(200),
          ctx.json(require(`${__dirname}/fixtures/tags/foo_page2.json`)),
        );
      }

      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/tags/foo_page1.json`)),
      );
    },
  ),
  rest.get(
    `${LOCAL_API_ADDR}/:instanceName/repository/foo/bar/tag?`,
    (req, res, ctx) => {
      if (req.url.searchParams.get('limit') === '1') {
        return res(
          ctx.status(200),
          ctx.json(require(`${__dirname}/fixtures/tags/foo_limit.json`)),
        );
      } else if (req.url.searchParams.get('page') === '2') {
        return res(
          ctx.status(200),
          ctx.json(require(`${__dirname}/fixtures/tags/foo_page2.json`)),
        );
      }

      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/tags/foo_page1.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_API_ADDR}/:instanceName/repository/not/found/tag?`,
    (_, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json(require(`${__dirname}/fixtures/tags/not_found.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_API_ADDR}/:instanceName/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_API_ADDR}/:instanceName/repository/foo/bar/manifest/sha256:e461dc54b4e2469bb7f5bf85a4b7445c175548ba9d56c3f617dd25bc3adf3752`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/bar.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_API_ADDR}/:instance/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/labels`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/labels/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_API_ADDR}/:instanceName/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/security`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/securityDetail/foo.json`)),
      );
    },
  ),
];

const server = setupServer(...apiHandlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('QuayApiClient-Backend', () => {
  let quayApi: QuayApiV1;
  let fetchSpy: jest.SpyInstance;
  const bearerToken = 'Bearer token';

  const identityApi = {
    async getCredentials() {
      return {
        token: bearerToken,
      };
    },
  } as IdentityApi;

  const mockDiscoveryApi = mockApis.discovery.mock({
    getBaseUrl: async (pluginId: string) =>
      `https://localhost:7070/api/${pluginId}`,
  });

  beforeEach(() => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            apiUrl: 'https://quay.example.io',
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should default to proxy if apiUrl is not set', async () => {
    // Proxy
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({ data: {} }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const proxyResult = await quayApi.getTags(undefined, 'foo', 'bar');

    expect(proxyResult).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(DEFAULT_PROXY_ADDR),
      expect.anything(),
    );
  });

  it('should use default instance when single-instance config', async () => {
    const result = await quayApi.getTags(undefined, 'foo', 'bar');

    expect(result).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${LOCAL_API_ADDR}/${QUAY_SINGLE_INSTANCE_NAME}`),
      expect.anything(),
    );
  });

  it('should use default instance (first) when multi-instance config', async () => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            instances: [
              { name: 'devel', apiUrl: 'https://quay.staging.example.io' },
              { name: 'staging', apiUrl: 'https://quay.staging.example.io' },
            ],
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const result = await quayApi.getTags(undefined, 'foo', 'bar');

    expect(result).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${LOCAL_API_ADDR}/devel`),
      expect.anything(),
    );
  });

  it('should use custom instance (from annotation) when multi-instance config', async () => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            instances: [
              { name: 'devel', apiUrl: 'https://quay.staging.example.io' },
              { name: 'staging', apiUrl: 'https://quay.staging.example.io' },
            ],
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const result = await quayApi.getTags('staging', 'foo', 'bar');

    expect(result).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${LOCAL_API_ADDR}/staging`),
      expect.anything(),
    );
  });

  it('should throw an error when the response is not ok', async () => {
    await expect(quayApi.getTags(undefined, 'not', 'found')).rejects.toEqual(
      new Error('failed to fetch data, status 404: Not Found'),
    );
  });

  describe('getTags', () => {
    it('should correctly get tags without optional arguments', async () => {
      const result = await quayApi.getTags(undefined, 'foo', 'bar');

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page1.json`),
      );
    });

    it('should correctly get tags with a limit', async () => {
      const result = await quayApi.getTags(
        undefined,
        'foo',
        'bar',
        undefined,
        1,
      );

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_limit.json`),
      );
    });
    it('should correctly get tags with a page number', async () => {
      const result = await quayApi.getTags(undefined, 'foo', 'bar', 2);

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page2.json`),
      );
    });
  });

  describe('getManifestByDigest', () => {
    it('should correctly get the manifest using its digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/foo.json`);
      const result = await quayApi.getManifestByDigest(
        undefined,
        'foo',
        'bar',
        manifest.digest,
      );

      expect(result).toEqual(manifest);
    });
  });

  describe('getLabels', () => {
    it('should correctly get the labels using the manifest digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/bar.json`);
      const result = await quayApi.getLabels(
        undefined,
        'foo',
        'bar',
        manifest.digest,
      );

      expect(result).toEqual(require(`${__dirname}/fixtures/labels/foo.json`));
    });
  });

  describe('getSecurityDetails', () => {
    it('should correctly get security details using the manifest digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/bar.json`);
      const result = await quayApi.getSecurityDetails(
        undefined,
        'foo',
        'bar',
        manifest.digest,
      );
      expect(result).toEqual(
        require(`${__dirname}/fixtures/securityDetail/foo.json`),
      );
    });
  });
});
