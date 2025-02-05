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

import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { QuayApiClient, QuayApiV1 } from './index';

const LOCAL_ADDR = 'https://localhost:7070/api/quay';

const handlers = [
  rest.get(`${LOCAL_ADDR}/repository/foo/bar/tag?`, (req, res, ctx) => {
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
  }),

  rest.get(`${LOCAL_ADDR}/repository/not/found/tag?`, (_, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json(require(`${__dirname}/fixtures/tags/not_found.json`)),
    );
  }),

  rest.get(
    `${LOCAL_ADDR}/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repository/foo/bar/manifest/sha256:e461dc54b4e2469bb7f5bf85a4b7445c175548ba9d56c3f617dd25bc3adf3752`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/manifests/bar.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/labels`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/labels/foo.json`)),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repository/foo/bar/manifest/sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54/security`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(require(`${__dirname}/fixtures/securityDetail/foo.json`)),
      );
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('QuayApiClient', () => {
  let quayApi: QuayApiV1;
  const bearerToken = 'Bearer token';

  const identityApi = {
    async getCredentials() {
      return { token: bearerToken };
    },
  } as IdentityApi;

  beforeEach(() => {
    quayApi = new QuayApiClient({
      discoveryApi: UrlPatternDiscovery.compile(
        'https://localhost:7070/api/quay',
      ),
      identityApi: identityApi,
    });
  });

  it('should use a correct default api', async () => {
    quayApi = new QuayApiClient({
      discoveryApi: UrlPatternDiscovery.compile(
        'https://localhost:7070/api/quay',
      ),
      identityApi: identityApi,
    });

    const result = await quayApi.getTags('foo', 'bar');

    expect(result).toEqual(
      require(`${__dirname}/fixtures/tags/foo_page1.json`),
    );
  });

  it('should throw an error when the response is not ok', async () => {
    await expect(quayApi.getTags('not', 'found')).rejects.toEqual(
      new Error('failed to fetch data, status 404: Not Found'),
    );
  });

  describe('getTags', () => {
    it('should correctly get tags without optional arguments', async () => {
      const result = await quayApi.getTags('foo', 'bar');

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page1.json`),
      );
    });

    it('should correctly get tags with a limit', async () => {
      const result = await quayApi.getTags('foo', 'bar', undefined, 1);

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_limit.json`),
      );
    });
    it('should correctly get tags with a page number', async () => {
      const result = await quayApi.getTags('foo', 'bar', 2);

      expect(result).toEqual(
        require(`${__dirname}/fixtures/tags/foo_page2.json`),
      );
    });
  });

  describe('getManifestByDigest', () => {
    it('should correctly get the manifest using its digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/foo.json`);
      const result = await quayApi.getManifestByDigest(
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
      const result = await quayApi.getLabels('foo', 'bar', manifest.digest);

      expect(result).toEqual(require(`${__dirname}/fixtures/labels/foo.json`));
    });
  });

  describe('getSecurityDetails', () => {
    it('should correctly get secuity details using the manifest digest', async () => {
      const manifest = require(`${__dirname}/fixtures/manifests/bar.json`);
      const result = await quayApi.getSecurityDetails(
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
