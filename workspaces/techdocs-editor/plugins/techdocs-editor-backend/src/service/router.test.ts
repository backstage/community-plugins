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

import request from 'supertest';
import express from 'express';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createRouter } from './router';
import { VcsProviderRegistry } from './VcsProviderRegistry';
import { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';

/** Maps @backstage/errors typed errors to proper HTTP status codes in tests. */
function backstageErrorHandler(): express.ErrorRequestHandler {
  const statusMap: Record<string, number> = {
    InputError: 400,
    NotAllowedError: 403,
    NotFoundError: 404,
    ConflictError: 409,
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: any, _req, res, _next) => {
    const status = err.statusCode ?? statusMap[err.name] ?? 500;
    if (res.headersSent) return;
    res.status(status).json({
      error: { message: err.message, name: err.name },
    });
  };
}

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const ENTITY = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'sample-docs',
    namespace: 'default',
    annotations: {
      'backstage.io/techdocs-ref':
        'url:https://github.com/org/sample-docs/tree/main',
    },
  },
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
};

const mockProvider: jest.Mocked<VcsProvider> = {
  id: 'github',
  canHandle: jest.fn().mockReturnValue(true),
  getDefaultBranch: jest.fn().mockResolvedValue('main'),
  readFile: jest.fn().mockResolvedValue({ content: '# Hello', etag: 'abc123' }),
  listFiles: jest.fn().mockResolvedValue(['index.md', 'guide/setup.md']),
  openPullRequest: jest.fn().mockResolvedValue({
    url: 'https://github.com/org/sample-docs/pull/1',
    number: 1,
  }),
};

function buildRegistry(): VcsProviderRegistry {
  const reg = new VcsProviderRegistry();
  reg.register(mockProvider);
  return reg;
}

async function buildApp(overrides?: {
  permissions?: any;
  catalog?: any;
}): Promise<express.Express> {
  const config = new ConfigReader({
    integrations: {
      github: [{ host: 'github.com', token: 'fake-token' }],
    },
  });

  const catalog = overrides?.catalog ?? {
    getEntityByRef: jest.fn().mockResolvedValue(ENTITY),
  };

  const permissions = overrides?.permissions ?? {
    authorize: jest.fn().mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
  };

  const auth = {
    ...mockServices.auth.mock(),
    getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    getOwnServiceCredentials: jest.fn().mockResolvedValue({}),
  };

  const router = await createRouter({
    logger: mockServices.logger.mock(),
    config,
    reader: mockServices.urlReader.mock(),
    httpAuth: mockServices.httpAuth.mock(),
    userInfo: mockServices.userInfo.mock(),
    auth,
    catalog,
    providerRegistry: buildRegistry(),
    permissions,
  });

  const app = express();
  app.use(express.json());
  app.use(router);
  app.use(backstageErrorHandler());
  return app;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 ok without auth', async () => {
    const app = await buildApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /sources/:namespace/:kind/:name/tree', () => {
  it('returns file list and branch', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/tree')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.files).toEqual(['index.md', 'guide/setup.md']);
    expect(res.body.branch).toBe('main');
    expect(res.body.docsDir).toBe('docs');
  });

  it('returns 404 when entity is not found', async () => {
    const app = await buildApp({
      catalog: { getEntityByRef: jest.fn().mockResolvedValue(null) },
    });
    const res = await request(app)
      .get('/sources/default/component/missing/tree')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
  });

  it('returns 403 when permission is denied', async () => {
    const app = await buildApp({
      permissions: {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
      },
    });
    const res = await request(app)
      .get('/sources/default/component/sample-docs/tree')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(403);
  });
});

describe('GET /sources/:namespace/:kind/:name/file', () => {
  it('returns file content and etag', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/file?path=index.md')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('# Hello');
    expect(res.body.etag).toBe('abc123');
  });

  it('returns 400 when path query param is missing', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/file')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
  });

  it('blocks path traversal via ../', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/file?path=../../etc/passwd')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Invalid file path/);
  });

  it('blocks absolute paths', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/file?path=/etc/passwd')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Invalid file path/);
  });

  it('blocks paths with null bytes', async () => {
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/file?path=index%00.md')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Invalid file path/);
  });
});

describe('GET /sources/:namespace/:kind/:name/mkdocs', () => {
  it('returns parsed mkdocs config with defaults when file is missing', async () => {
    mockProvider.readFile.mockRejectedValueOnce(new Error('not found'));
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/mkdocs')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      site_name: 'sample-docs',
      docs_dir: expect.any(String),
    });
  });

  it('returns parsed mkdocs config when file exists', async () => {
    mockProvider.readFile.mockResolvedValueOnce({
      content: 'site_name: My Docs\ndocs_dir: docs\n',
      etag: 'sha1',
    });
    const app = await buildApp();
    const res = await request(app)
      .get('/sources/default/component/sample-docs/mkdocs')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.site_name).toBe('My Docs');
  });
});

describe('POST /submissions/:namespace/:kind/:name', () => {
  const validBody = {
    files: [{ path: 'index.md', content: '# Updated', etag: 'abc123' }],
    prTitle: 'docs: update index',
    commitMessage: 'docs: update index.md',
  };

  it('opens a PR and returns the URL', async () => {
    const app = await buildApp({
      permissions: {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
      },
    });

    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.pullRequestUrl).toBe(
      'https://github.com/org/sample-docs/pull/1',
    );
    expect(res.body.pullRequestNumber).toBe(1);
    expect(typeof res.body.headBranch).toBe('string');
  });

  it('returns 400 when files are missing', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send({ prTitle: 'x', commitMessage: 'x' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when prTitle is missing', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send({
        files: [{ path: 'index.md', content: '# x', etag: '' }],
        commitMessage: 'x',
      });
    expect(res.status).toBe(400);
  });

  it('blocks path traversal in file paths', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send({
        ...validBody,
        files: [{ path: '../../secret.md', content: 'evil', etag: '' }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Invalid file path/);
  });

  it('returns 409 on etag conflict', async () => {
    // Provider returns a different etag than what the client sent
    mockProvider.readFile.mockResolvedValueOnce({
      content: '# Different',
      etag: 'different-etag',
    });
    const app = await buildApp();
    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send({
        ...validBody,
        files: [{ path: 'index.md', content: '# Updated', etag: 'stale-etag' }],
      });
    expect(res.status).toBe(409);
    expect(res.body.conflicts).toHaveLength(1);
  });

  it('returns 403 when write permission is denied', async () => {
    const app = await buildApp({
      permissions: {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
      },
    });
    const res = await request(app)
      .post('/submissions/default/component/sample-docs')
      .set('Authorization', 'Bearer token')
      .send(validBody);
    expect(res.status).toBe(403);
  });
});
