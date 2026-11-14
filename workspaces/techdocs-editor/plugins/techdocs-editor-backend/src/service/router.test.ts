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

import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import type { Entity } from '@backstage/catalog-model';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';
import { createRouter } from './router';
import { VcsProviderRegistry } from './VcsProviderRegistry';

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
    if (res.headersSent) {
      return;
    }
    res.status(status).json({
      error: { message: err.message, name: err.name },
    });
  };
}

type BuildAppOptions = {
  entityAnnotations: Record<string, string>;
  permissionResult?: AuthorizeResult;
  localSourceDir?: string;
  registerProvider?: boolean;
};

type BuildAppResult = {
  app: express.Express;
  localSourceDir: string;
  provider: jest.Mocked<VcsProvider>;
};

function createNotFoundError(message = 'missing'): Error {
  return Object.assign(new Error(message), { name: 'NotFoundError' });
}

function buildRegistry(overrides?: Partial<jest.Mocked<VcsProvider>>): {
  registry: VcsProviderRegistry;
  provider: jest.Mocked<VcsProvider>;
} {
  const provider: jest.Mocked<VcsProvider> = {
    id: 'github',
    canHandle: jest
      .fn()
      .mockImplementation(repoUrl => repoUrl.startsWith('https://github.com/')),
    getDefaultBranch: jest.fn().mockResolvedValue('main'),
    readFile: jest.fn().mockRejectedValue(createNotFoundError()),
    listFiles: jest.fn().mockResolvedValue([]),
    openPullRequest: jest.fn().mockResolvedValue({
      url: 'https://github.com/org/repo/pull/1',
      number: 1,
    }),
    ...overrides,
  };

  const registry = new VcsProviderRegistry();
  registry.register(provider);
  return { registry, provider };
}

async function createLocalSource(): Promise<string> {
  const localSourceDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'techdocs-editor-router-'),
  );

  await fs.mkdir(path.join(localSourceDir, 'docs'), { recursive: true });
  await fs.writeFile(
    path.join(localSourceDir, 'mkdocs.yml'),
    'site_name: Test Docs\ndocs_dir: docs\n',
    'utf-8',
  );

  return localSourceDir;
}

async function buildApp(options: BuildAppOptions): Promise<BuildAppResult> {
  const localSourceDir = options.localSourceDir ?? (await createLocalSource());
  const { registry, provider } = buildRegistry();
  if (options.registerProvider === false) {
    const emptyRegistry = new VcsProviderRegistry();
    return buildAppWithRegistry(
      options,
      localSourceDir,
      emptyRegistry,
      provider,
    );
  }

  return buildAppWithRegistry(options, localSourceDir, registry, provider);
}

async function buildAppWithRegistry(
  options: BuildAppOptions,
  localSourceDir: string,
  registry: VcsProviderRegistry,
  provider: jest.Mocked<VcsProvider>,
): Promise<BuildAppResult> {
  const entity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      namespace: 'default',
      name: 'test',
      annotations: options.entityAnnotations,
    },
    spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
  };

  const catalog = {
    getEntityByRef: jest.fn().mockResolvedValue(entity),
  };

  const router = await createRouter({
    logger: mockServices.logger.mock(),
    config: new ConfigReader({
      backend: { workingDirectory: localSourceDir },
      integrations: {
        github: [{ host: 'github.com', token: 'fake-token' }],
      },
    }),
    reader: mockServices.urlReader.mock(),
    httpAuth: mockServices.httpAuth(),
    userInfo: mockServices.userInfo(),
    auth: mockServices.auth(),
    catalog: catalog as any,
    providerRegistry: registry,
    permissions: mockServices.permissions({
      result:
        options.permissionResult === AuthorizeResult.DENY
          ? AuthorizeResult.DENY
          : AuthorizeResult.ALLOW,
    }),
  });

  const app = express();
  app.use(router);
  app.use(backstageErrorHandler());

  return { app, localSourceDir, provider };
}

describe('GET /sources/:namespace/:kind/:name/mkdocs', () => {
  let localSourceDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      localSourceDirs.map(dir => fs.rm(dir, { recursive: true, force: true })),
    );
    localSourceDirs = [];
  });

  it('returns canSaveLocally=true and canCreatePullRequest=true for a dir: entity with a resolvable slug', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
        'github.com/project-slug': 'org/repo',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app).get(
      '/sources/default/component/test/mkdocs',
    );

    expect(response.status).toBe(200);
    expect(response.body.canSaveLocally).toBe(true);
    expect(response.body.canCreatePullRequest).toBe(true);
  });

  it('returns canSaveLocally=true and canCreatePullRequest=false for a dir: entity with no resolvable slug', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app).get(
      '/sources/default/component/test/mkdocs',
    );

    expect(response.status).toBe(200);
    expect(response.body.canSaveLocally).toBe(true);
    expect(response.body.canCreatePullRequest).toBe(false);
  });

  it('returns canSaveLocally=false and canCreatePullRequest=true for a url: entity', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref':
          'url:https://github.com/org/repo/tree/main/docs',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app).get(
      '/sources/default/component/test/mkdocs',
    );

    expect(response.status).toBe(200);
    expect(response.body.canSaveLocally).toBe(false);
    expect(response.body.canCreatePullRequest).toBe(true);
  });
});

describe('POST /submissions/:namespace/:kind/:name', () => {
  let localSourceDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      localSourceDirs.map(dir => fs.rm(dir, { recursive: true, force: true })),
    );
    localSourceDirs = [];
  });

  it('returns 200 with savedLocally=true when action=save-locally and source has local', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: { 'backstage.io/techdocs-ref': 'dir:.' },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
        action: 'save-locally',
      });

    expect(response.status).toBe(200);
    expect(response.body.savedLocally).toBe(true);
    await expect(
      fs.readFile(path.join(localSourceDir, 'docs', 'index.md'), 'utf-8'),
    ).resolves.toBe('# Hello');
  });

  it('returns 400 when action=create-pull-request and source has no vcs', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: { 'backstage.io/techdocs-ref': 'dir:.' },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
        action: 'create-pull-request',
        prTitle: 'Update docs',
      });

    expect(response.status).toBe(400);
  });

  it('returns 200 with pullRequestUrl when action=create-pull-request and source has vcs', async () => {
    const { app, localSourceDir, provider } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
        'github.com/project-slug': 'org/repo',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
        action: 'create-pull-request',
        prTitle: 'Update docs',
      });

    expect(response.status).toBe(200);
    expect(response.body.pullRequestUrl).toBe(
      'https://github.com/org/repo/pull/1',
    );
    expect(provider.openPullRequest).toHaveBeenCalled();
  });

  it('returns an actionable error when action=create-pull-request and no provider is registered', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
        'github.com/project-slug': 'org/repo',
      },
      registerProvider: false,
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
        action: 'create-pull-request',
        prTitle: 'Update docs',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain(
      "backend.add(import('@backstage-community/plugin-techdocs-editor-backend/alpha'))",
    );
  });

  it('returns 400 when the action value is missing', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
        'github.com/project-slug': 'org/repo',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
      });

    expect(response.status).toBe(400);
  });

  it('returns 400 when the action value is invalid', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: {
        'backstage.io/techdocs-ref': 'dir:.',
        'github.com/project-slug': 'org/repo',
      },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [{ path: 'index.md', content: '# Hello', etag: '' }],
        commitMessage: 'Update docs',
        action: 'not-a-real-action',
      });

    expect(response.status).toBe(400);
  });

  it('accepts submission payloads larger than 100kb for media-heavy edits', async () => {
    const { app, localSourceDir } = await buildApp({
      entityAnnotations: { 'backstage.io/techdocs-ref': 'dir:.' },
    });
    localSourceDirs.push(localSourceDir);

    const response = await request(app)
      .post('/submissions/default/component/test')
      .send({
        files: [
          {
            path: 'large.md',
            content: `# Large\n\n${'a'.repeat(150_000)}`,
            etag: '',
          },
        ],
        commitMessage: 'Submit large docs edit',
        action: 'save-locally',
      });

    expect(response.status).toBe(200);
    expect(response.body.savedLocally).toBe(true);
  });
});
