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

import { IdentityApi } from '@backstage/core-plugin-api';
import { mockApis } from '@backstage/test-utils';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { QUAY_SINGLE_INSTANCE_NAME } from '@backstage-community/plugin-quay-common';

import { QuayApiClient, QuayApiV1 } from './index';

const LOCAL_PROXY_ADDR = 'https://localhost:5050/api/proxy/quay/api/';
const LOCAL_CUSTOM_PROXY_ADDR =
  'https://localhost:5050/api/proxy/custom-quay/api/';

const proxyHandlers = [
  rest.get(
    `${LOCAL_PROXY_ADDR}api/v1/repository/foo/bar/tag/`,
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
    `${LOCAL_PROXY_ADDR}api/v1/repository/not/found/tag?`,
    (_, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json(require(`${__dirname}/fixtures/tags/not_found.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_PROXY_ADDR}api/v1/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_PROXY_ADDR}api/v1/repository/foo/bar/manifest/sha256:e461dc54b4e2469bb7f5bf85a4b7445c175548ba9d56c3f617dd25bc3adf3752`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/bar.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_PROXY_ADDR}api/v1/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/labels`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/labels/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_PROXY_ADDR}api/v1/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/security`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/securityDetail/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_CUSTOM_PROXY_ADDR}api/v1/repository/foo/bar/tag/`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/tags/foo_page1.json`)),
      );
    },
  ),
];

const server = setupServer(...proxyHandlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('QuayApiClient', () => {
  let quayApi: QuayApiV1;
  let fetchSpy: jest.SpyInstance;
  const bearerToken = 'Bearer token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  const mockDiscoveryApi = mockApis.discovery.mock({
    getBaseUrl: async (pluginId: string) =>
      `https://localhost:5050/api/${pluginId}`,
  });

  beforeEach(() => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            proxyPath: '/quay/api',
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

  it('should use default proxy path when no config', async () => {
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
      expect.stringContaining(LOCAL_PROXY_ADDR),
      expect.anything(),
    );
  });

  it('should use custom proxy path when set in single-instance config', async () => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            proxyPath: '/custom-quay/api',
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const proxyResult = await quayApi.getTags(undefined, 'foo', 'bar');

    expect(proxyResult).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(LOCAL_CUSTOM_PROXY_ADDR),
      expect.anything(),
    );
  });

  it('should use default proxy path when multi-instance config', async () => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            instances: [{ name: 'devel' }, { name: 'staging' }],
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const proxyResult = await quayApi.getTags(undefined, 'foo', 'bar');

    expect(proxyResult).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(LOCAL_PROXY_ADDR),
      expect.anything(),
    );
  });

  it('should use custom proxy path when set in multi-instance config', async () => {
    quayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            instances: [
              { name: 'devel' },
              { name: 'staging', proxyPath: '/custom-quay/api' },
            ],
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    const proxyResult = await quayApi.getTags('staging', 'foo', 'bar');

    expect(proxyResult).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(LOCAL_CUSTOM_PROXY_ADDR),
      expect.anything(),
    );
  });

  it('should throw an error when the response is not ok', async () => {
    await expect(
      quayApi.getTags(QUAY_SINGLE_INSTANCE_NAME, 'not', 'found'),
    ).rejects.toEqual(new Error('failed to fetch data, status 404: Not Found'));
  });

  describe('getTags', () => {
    it('should correctly get tags without optional arguments', async () => {
      const result = await quayApi.getTags(
        QUAY_SINGLE_INSTANCE_NAME,
        'foo',
        'bar',
      );

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page1.json`),
      );
    });

    it('should correctly get tags with a limit', async () => {
      const result = await quayApi.getTags(
        QUAY_SINGLE_INSTANCE_NAME,
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
      const result = await quayApi.getTags(
        QUAY_SINGLE_INSTANCE_NAME,
        'foo',
        'bar',
        2,
      );

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page2.json`),
      );
    });
  });

  describe('getManifestByDigest', () => {
    it('should correctly get the manifest using its digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/foo.json`);
      const result = await quayApi.getManifestByDigest(
        QUAY_SINGLE_INSTANCE_NAME,
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
        QUAY_SINGLE_INSTANCE_NAME,
        'foo',
        'bar',
        manifest.digest,
      );

      expect(result).toEqual(require(`${__dirname}/fixtures/labels/foo.json`));
    });
  });

  describe('getSecurityDetails', () => {
    it('should correctly get secuity details using the manifest digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/bar.json`);
      const result = await quayApi.getSecurityDetails(
        QUAY_SINGLE_INSTANCE_NAME,
        'foo',
        'bar',
        manifest.digest,
      );
      expect(result).toEqual(
        require(`${__dirname}/fixtures/securityDetail/foo.json`),
      );
    });
  });

  describe('getQuayInstance', () => {
    const multiInstanceQuayApi = QuayApiClient.fromConfig({
      configApi: mockApis.config({
        data: {
          quay: {
            instances: [
              {
                name: 'devel',
                proxyPath: LOCAL_CUSTOM_PROXY_ADDR,
                uiUrl: 'http://custom-quay.example.com',
              },
              { name: 'staging', apiUrl: 'https://quay-staging.example.com' },
            ],
          },
        },
      }),
      discoveryApi: mockDiscoveryApi,
      identityApi: identityApi,
    });

    it('should return default instance (first) when no instance name for single-instance config', () => {
      const instance = quayApi.getQuayInstance(undefined);
      expect(instance?.name).toBe(QUAY_SINGLE_INSTANCE_NAME);
    });

    it('should return instance by name for single-instance config', () => {
      const instance = quayApi.getQuayInstance(QUAY_SINGLE_INSTANCE_NAME);
      expect(instance?.name).toBe(QUAY_SINGLE_INSTANCE_NAME);
    });

    it('should return default instance (first) when no instance name for multi-instance config', () => {
      const develInstance = multiInstanceQuayApi.getQuayInstance();
      expect(develInstance).toEqual({
        name: 'devel',
        proxyPath: LOCAL_CUSTOM_PROXY_ADDR,
        uiUrl: 'http://custom-quay.example.com',
      });
    });

    it('should return instance by name for multi-instance config', () => {
      const stagingInstance = multiInstanceQuayApi.getQuayInstance('staging');
      expect(stagingInstance?.name).toEqual('staging');
    });

    it('should return undefined for non-existent instance', () => {
      const instance = quayApi.getQuayInstance('non-existent');
      expect(instance).toBeUndefined();
    });
  });
});
