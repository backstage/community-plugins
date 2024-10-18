import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { type IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { ConfigApiMock } from '../../__fixtures__/mocks';
import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from '../../annotations';
import { NexusRepositoryManagerApiClient } from './nexus-repository-manager-api-client';

const LOCAL_ADDR = 'https://localhost:7007/nexus-repository-manager';

const handlers = [
  rest.get(`${LOCAL_ADDR}/service/rest/v1/search`, (req, res, ctx) => {
    if (req.url.searchParams.has('docker.imageName')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/service/rest/v1/search/docker/imageName/${req.url.searchParams.get(
            'docker.imageName',
          )}/index.json`),
        ),
      );
    }

    if (req.url.searchParams.has('docker.imageTag')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/service/rest/v1/search/docker/imageTag/${req.url.searchParams.get(
            'docker.imageTag',
          )}/index.json`),
        ),
      );
    }

    if (req.url.searchParams.has('maven.groupId')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/service/rest/v1/search/maven/groupId/${req.url.searchParams.get(
            'maven.groupId',
          )}/index.json`),
        ),
      );
    }

    return res(
      ctx.status(404),
      ctx.json(
        require(`${__dirname}/../../__fixtures__/service/rest/v1/search/404.json`),
      ),
    );
  }),

  rest.head(/\/repository\/proxied-maven-central\//, (req, res, ctx) => {
    const sizes = {
      jar: '1000000',
      'jar.sha1': '40',
      pom: '200',
      'pom.sha1': '44',
      'tar.gz': '3000000',
    };

    for (const [extension, size] of Object.entries(sizes)) {
      if (req.url.pathname.endsWith(extension)) {
        return res(ctx.status(200), ctx.set('Content-Length', size));
      }
    }

    return res(ctx.status(404));
  }),

  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest.json`),
        ),
      );
    },
  ),

  // Always returns manifest v2 schema 1, regardless of the accept header, to
  // simulate a server that does not support schema 2.
  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b-schema1.json`),
        ),
      );
    },
  ),

  // Conditionally returns manifest v2 schema 1/2, depending on the accept
  // header, to simulate a server that supports both schemas.
  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-de3dbf1`,
    (req, res, ctx) => {
      let fixtureName = 'sha-de3dbf1-schema1.json';
      if (
        req.headers
          .get('accept')
          ?.includes('application/vnd.docker.distribution.manifest.v2+json')
      ) {
        fixtureName = 'sha-de3dbf1-schema2.json';
      }

      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/${fixtureName}`),
        ),
      );
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('NexusRepositoryManagerApiClient', () => {
  let nexusApi: NexusRepositoryManagerApiClient;
  const identityApi = {
    async getCredentials() {
      return { token: 'Bearer token' };
    },
  } as IdentityApi;

  beforeEach(() => {
    nexusApi = new NexusRepositoryManagerApiClient({
      configApi: new ConfigApiMock(),
      discoveryApi: UrlPatternDiscovery.compile('https://localhost:7007'),
      identityApi: identityApi,
    });
  });

  afterEach(() => {
    server.events.removeAllListeners();
  });

  it('should use the default proxy path', async () => {
    const { components } = await nexusApi.getComponents({
      dockerImageName: 'janus-idp/backstage-showcase',
    });

    expect(components).toEqual(
      require('./../../__fixtures__/components/all.json'),
    );
  });

  it('should throw an error when the response is not ok', async () => {
    await expect(
      nexusApi.getComponents({
        dockerImageName: 'janus-idp/backstage-showcase1',
      }),
    ).rejects.toThrow('Failed to fetch');
  });

  describe('getComponents', () => {
    it('should return components using dockerImageName', async () => {
      const { components } = await nexusApi.getComponents({
        dockerImageName: 'janus-idp/backstage-showcase',
      });

      expect(components).toEqual(
        require('./../../__fixtures__/components/all.json'),
      );
    });

    it('sets headers requesting manifest 2 schema 2', async () => {
      server.events.on('request:start', req => {
        let expectedAcceptHeader = 'application/json';
        if (req.url.pathname.includes('/manifests')) {
          expectedAcceptHeader =
            'application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.v1+json;q=0.9, */*;q=0.8';
        }

        expect(req.headers.get('accept')).toEqual(expectedAcceptHeader);
      });

      const { components } = await nexusApi.getComponents({
        dockerImageTag: 'sha-de3dbf1',
      });

      expect(components[0]?.dockerManifests[0]?.schemaVersion).toEqual(2);
    });

    it('should not set special headers for non-docker GETs', async () => {
      server.events.on('request:start', req => {
        expect(req.headers.get('accept') ?? '').not.toContain(
          'application/vnd.docker',
        );
      });

      await nexusApi.getComponents({
        mavenGroupId: 'com.example',
      });
    });

    it('should return components using dockerImageTag', async () => {
      const { components } = await nexusApi.getComponents({
        dockerImageTag: 'latest',
      });

      expect(components).toEqual(
        require('./../../__fixtures__/components/latest.json'),
      );
    });

    it('should return components using mavenGroupId', async () => {
      const { components } = await nexusApi.getComponents({
        mavenGroupId: 'com.example',
      });

      expect(components).toEqual(
        require('./../../__fixtures__/components/maven.json'),
      );
    });

    it('should not make requests for poms and hashes', async () => {
      server.events.on('request:start', req => {
        expect(req.url.pathname).not.toMatch(/pom$/);
        expect(req.url.pathname).not.toMatch(/sha1$/);
        expect(req.url.pathname).not.toMatch(/md5$/);
        expect(req.url.pathname).not.toMatch(/sha256$/);
      });

      await nexusApi.getComponents({
        mavenGroupId: 'com.example',
      });
    });
  });

  describe('getAnnotations', () => {
    it('should not include experimental annotations', () => {
      const { ANNOTATIONS } = nexusApi.getAnnotations();

      expect(ANNOTATIONS).toEqual(NEXUS_REPOSITORY_MANAGER_ANNOTATIONS);
    });

    it('should include experimental annotations', () => {
      nexusApi = new NexusRepositoryManagerApiClient({
        configApi: new ConfigApiMock({
          getOptionalBoolean: jest.fn().mockReturnValue(true),
        }),
        discoveryApi: UrlPatternDiscovery.compile('https://localhost:7007'),
        identityApi: identityApi,
      });

      const { ANNOTATIONS } = nexusApi.getAnnotations();

      expect(ANNOTATIONS).toEqual([
        ...NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
        ...NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
      ]);
    });
  });
});
