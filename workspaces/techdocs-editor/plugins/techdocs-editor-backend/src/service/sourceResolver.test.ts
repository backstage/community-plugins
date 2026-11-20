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

import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';
import {
  resolveSource,
  fetchMkdocsContent,
  parseMkdocsContent,
  resolveDocsDirFromMkdocs,
} from './sourceResolver';

describe('resolveSource', () => {
  const reader = {} as UrlReaderService;
  const config = new ConfigReader({});
  const scmIntegrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        github: [{ host: 'github.com', token: 'fake' }],
      },
    }),
  );

  // A real on-disk source-location root, deliberately unrelated to the
  // backend's process.cwd(), reproducing the original "outside working
  // directory" bug. Recreated fresh for every test.
  let sourceRoot: string;

  beforeEach(async () => {
    sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'techdocs-editor-'));
  });

  afterEach(async () => {
    await fs.rm(sourceRoot, { recursive: true, force: true });
  });

  function dirEntity(target: string): Entity {
    return {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'documented-component',
        annotations: {
          'backstage.io/techdocs-ref': `dir:${target}`,
          'backstage.io/source-location': `url:file://${sourceRoot}`,
        },
      },
      spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
    };
  }

  it('uses docs_dir from mkdocs.yml when present at the base path', async () => {
    await fs.writeFile(
      path.join(sourceRoot, 'mkdocs.yml'),
      'site_name: Example\ndocs_dir: documentation\n',
      'utf-8',
    );
    await fs.mkdir(path.join(sourceRoot, 'documentation'));

    const result = await resolveSource(
      dirEntity('.'),
      scmIntegrations,
      reader,
      config,
    );

    expect(result).toEqual({
      local: {
        basePath: sourceRoot,
        docsDir: 'documentation',
      },
    });
  });

  it('falls back to the conventional docs/ directory when no mkdocs.yml is present', async () => {
    await fs.mkdir(path.join(sourceRoot, 'docs'));

    const result = await resolveSource(
      dirEntity('.'),
      scmIntegrations,
      reader,
      config,
    );

    expect(result).toEqual({
      local: {
        basePath: sourceRoot,
        docsDir: 'docs',
      },
    });
  });

  it('treats a dir: subdirectory that already is the docs folder as its own docs dir (no double-nesting)', async () => {
    // Regression: `dir:./docs` previously resolved docsDir to 'docs', causing
    // the tree endpoint to search '<root>/docs/docs' and return an empty list.
    const docsPath = path.join(sourceRoot, 'docs');
    await fs.mkdir(docsPath);
    await fs.writeFile(path.join(docsPath, 'index.md'), '# Home', 'utf-8');

    const result = await resolveSource(
      dirEntity('./docs'),
      scmIntegrations,
      reader,
      config,
    );

    expect(result).toEqual({
      local: {
        basePath: docsPath,
        docsDir: '.',
      },
    });
  });

  it('treats the base path as the docs dir when neither mkdocs.yml nor docs/ exist', async () => {
    const result = await resolveSource(
      dirEntity('.'),
      scmIntegrations,
      reader,
      config,
    );

    expect(result).toEqual({
      local: {
        basePath: sourceRoot,
        docsDir: '.',
      },
    });
  });

  it('rejects a dir: target that escapes the source root', async () => {
    await expect(
      resolveSource(dirEntity('../../etc'), scmIntegrations, reader, config),
    ).rejects.toThrow(/resolves outside the allowed source directory/);
  });

  it('resolves a url: GitHub annotation to a vcs source', async () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'remote-component',
        annotations: {
          'backstage.io/techdocs-ref':
            'url:https://github.com/backstage/backstage/tree/master/docs',
        },
      },
      spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
    };

    const result = await resolveSource(entity, scmIntegrations, reader, config);

    expect(result).toEqual({
      vcs: {
        repoUrl: 'https://github.com/backstage/backstage',
        docsDir: undefined,
        defaultBranch: 'master',
      },
    });
  });

  describe('GitLab URLs', () => {
    const gitlabIntegrations = ScmIntegrations.fromConfig(
      new ConfigReader({
        integrations: {
          gitlab: [
            {
              host: 'gitlab.example.com',
              apiBaseUrl: 'https://gitlab.example.com/api/v4',
              token: 'fake',
            },
          ],
        },
      }),
    );

    function gitlabEntity(annotations: Record<string, string>): Entity {
      return {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'gitlab-component', annotations },
        spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
      };
    }

    it.each([
      [
        'a bare nested-group project URL',
        'url:https://gitlab.example.com/group/sub1/sub2/project',
        'https://gitlab.example.com/group/sub1/sub2/project',
        undefined,
      ],
      [
        'a nested-group tree URL',
        'url:https://gitlab.example.com/group/sub/project/-/tree/main/docs',
        'https://gitlab.example.com/group/sub/project',
        'main',
      ],
      [
        'a top-level group/project tree URL',
        'url:https://gitlab.example.com/group/project/-/tree/develop',
        'https://gitlab.example.com/group/project',
        'develop',
      ],
    ])(
      'resolves %s',
      async (_case, techdocsRef, expectedRepoUrl, expectedBranch) => {
        const result = await resolveSource(
          gitlabEntity({ 'backstage.io/techdocs-ref': techdocsRef }),
          gitlabIntegrations,
          reader,
          config,
        );

        expect(result).toEqual({
          vcs: {
            repoUrl: expectedRepoUrl,
            docsDir: undefined,
            defaultBranch: expectedBranch,
          },
        });
      },
    );

    it('resolves dir: against a nested-group blob source-location (GitLab discovery pattern)', async () => {
      // The GitLab discovery provider sets source-location to a `/-/blob/` URL.
      const result = await resolveSource(
        gitlabEntity({
          'backstage.io/techdocs-ref': 'dir:.',
          'backstage.io/source-location':
            'url:https://gitlab.example.com/group/sub/project/-/blob/main/',
        }),
        gitlabIntegrations,
        reader,
        config,
      );

      expect(result).toEqual({
        vcs: {
          repoUrl: 'https://gitlab.example.com/group/sub/project',
          docsDir: undefined,
          defaultBranch: 'main',
        },
      });
    });

    it('rejects a GitLab URL without a project path', async () => {
      await expect(
        resolveSource(
          gitlabEntity({
            'backstage.io/techdocs-ref': 'url:https://gitlab.example.com/group',
          }),
          gitlabIntegrations,
          reader,
          config,
        ),
      ).rejects.toThrow(InputError);
    });
  });

  describe('resolveSource additive behavior', () => {
    it('populates both local and vcs when dir: annotation and a resolvable project-slug are both present', async () => {
      await fs.mkdir(path.join(sourceRoot, 'docs'));

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/techdocs-ref': 'dir:.',
            'backstage.io/source-location': `url:file://${sourceRoot}`,
            'github.com/project-slug': 'org/repo',
          },
        },
        spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
      };

      const result = await resolveSource(
        entity,
        scmIntegrations,
        reader,
        config,
      );

      expect(result.local).toEqual({
        basePath: expect.any(String),
        docsDir: expect.any(String),
      });
      expect(result.vcs).toEqual({
        repoUrl: expect.stringContaining('github.com/org/repo'),
        docsDir: undefined,
        defaultBranch: undefined,
      });
    });

    it('populates only local when dir: annotation present with no resolvable slug', async () => {
      await fs.mkdir(path.join(sourceRoot, 'docs'));

      const entity = dirEntity('.');

      const result = await resolveSource(
        entity,
        scmIntegrations,
        reader,
        config,
      );

      expect(result.local).toEqual({
        basePath: expect.any(String),
        docsDir: expect.any(String),
      });
      expect(result.vcs).toBeUndefined();
    });

    it('treats dir: on a remote GitHub-hosted entity as a VCS source (builders-library pattern)', async () => {
      // Entities ingested via the GitHub catalog provider have a url: source-location
      // pointing at GitHub, not a file:// path. The plugin must resolve dir:. against
      // that URL (like techdocs-node's DirectoryPreparer does) instead of falling back
      // to process.cwd(), which would show wrong/stale docs in the editor.
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'builders-library',
          annotations: {
            'backstage.io/techdocs-ref': 'dir:.',
            'backstage.io/source-location':
              'url:https://github.com/org/repo/blob/main/backstage-catalog.yaml',
            'github.com/project-slug': 'org/repo',
          },
        },
        spec: { type: 'library', lifecycle: 'production', owner: 'team' },
      };

      const result = await resolveSource(
        entity,
        scmIntegrations,
        reader,
        config,
      );

      // Must resolve to a VCS source pointing at the GitHub repo, not a local path.
      expect(result.local).toBeUndefined();
      expect(result.vcs).toEqual({
        repoUrl: 'https://github.com/org/repo',
        docsDir: undefined,
        defaultBranch: 'main',
      });
    });

    it('populates only vcs when url: annotation is present', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/techdocs-ref':
              'url:https://github.com/org/repo/tree/main/docs#docs',
          },
        },
        spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
      };

      const result = await resolveSource(
        entity,
        scmIntegrations,
        reader,
        config,
      );

      expect(result.local).toBeUndefined();
      expect(result.vcs).toEqual({
        repoUrl: expect.stringContaining('github.com/org/repo'),
        docsDir: 'docs',
        defaultBranch: 'main',
      });
    });

    it('populates only vcs when no techdocs-ref annotation but a resolvable slug annotation exists', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'github.com/project-slug': 'org/repo',
          },
        },
        spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
      };

      const result = await resolveSource(
        entity,
        scmIntegrations,
        reader,
        config,
      );

      expect(result.local).toBeUndefined();
      expect(result.vcs).toEqual({
        repoUrl: expect.stringContaining('github.com/org/repo'),
        docsDir: undefined,
        defaultBranch: undefined,
      });
    });

    it('throws InputError when neither dir:, url:, nor a resolvable slug is present', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test', annotations: {} },
        spec: { type: 'service', lifecycle: 'experimental', owner: 'guest' },
      };

      await expect(
        resolveSource(entity, scmIntegrations, reader, config),
      ).rejects.toThrow(InputError);
    });
  });
});

describe('fetchMkdocsContent / resolveDocsDirFromMkdocs', () => {
  // Regression coverage for the "fixed for local, broken for GitHub (and vice
  // versa)" oscillation: every route handler must resolve docsDir from
  // mkdocs.yml through these two shared functions, for *every* source type,
  // so the effective docs directory can never drift between `/mkdocs`,
  // `/tree`, `/file` and `/submissions`, or between local and VCS sources.

  let sourceRoot: string;

  beforeEach(async () => {
    sourceRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'techdocs-editor-mkdocs-'),
    );
  });

  afterEach(async () => {
    await fs.rm(sourceRoot, { recursive: true, force: true });
  });

  it('reads mkdocs.yml from the local filesystem for local sources', async () => {
    await fs.writeFile(
      path.join(sourceRoot, 'mkdocs.yml'),
      'site_name: Example\ndocs_dir: documentation\n',
      'utf-8',
    );

    const content = await fetchMkdocsContent(
      { local: { basePath: sourceRoot, docsDir: '.' } },
      undefined,
      'local',
    );

    expect(content).toContain('docs_dir: documentation');

    const resolvedDocsDir = resolveDocsDirFromMkdocs(
      parseMkdocsContent(content),
      'docs',
    );
    expect(resolvedDocsDir).toBe('documentation');
  });

  it('returns undefined when a local source has no mkdocs.yml', async () => {
    const content = await fetchMkdocsContent(
      { local: { basePath: sourceRoot, docsDir: '.' } },
      undefined,
      'local',
    );
    expect(content).toBeUndefined();
  });

  it('reads mkdocs.yml via the VCS provider for remote sources, honoring docs_dir overrides', async () => {
    const provider: VcsProvider = {
      id: 'mock',
      getDefaultBranch: jest.fn(),
      listFiles: jest.fn(),
      readFile: jest.fn().mockResolvedValue({
        content: 'site_name: Example\ndocs_dir: documentation\n',
        etag: 'abc123',
      }),
      openPullRequest: jest.fn(),
      canHandle: jest.fn(),
    };

    const content = await fetchMkdocsContent(
      {
        vcs: {
          repoUrl: 'https://github.com/org/repo',
          docsDir: undefined,
        },
      },
      provider,
      'main',
    );

    expect(provider.readFile).toHaveBeenCalledWith({
      repoUrl: 'https://github.com/org/repo',
      ref: 'main',
      filePath: 'mkdocs.yml',
    });

    const resolvedDocsDir = resolveDocsDirFromMkdocs(
      parseMkdocsContent(content),
      'docs',
    );
    // Previously, `/tree` and `/file` for remote sources ignored mkdocs.yml
    // entirely and always used 'docs' unless a URL-hash docsDir was present —
    // meaning a repo with `docs_dir: documentation` in mkdocs.yml returned an
    // empty file list on GitHub/GitLab even though `/mkdocs` reported the
    // correct directory. This must now resolve identically everywhere.
    expect(resolvedDocsDir).toBe('documentation');
  });

  it('swallows a NotFoundError from the remote provider and falls back to the default docsDir', async () => {
    const notFound = Object.assign(new Error('missing'), {
      name: 'NotFoundError',
    });
    const provider: VcsProvider = {
      id: 'mock',
      getDefaultBranch: jest.fn(),
      listFiles: jest.fn(),
      readFile: jest.fn().mockRejectedValue(notFound),
      openPullRequest: jest.fn(),
      canHandle: jest.fn(),
    };

    const content = await fetchMkdocsContent(
      {
        vcs: {
          repoUrl: 'https://github.com/org/repo',
          docsDir: undefined,
        },
      },
      provider,
      'main',
    );
    expect(content).toBeUndefined();

    const resolvedDocsDir = resolveDocsDirFromMkdocs(
      parseMkdocsContent(content),
      'docs',
    );
    expect(resolvedDocsDir).toBe('docs');
  });

  it('rethrows non-NotFoundError errors from the remote provider instead of silently falling back', async () => {
    const provider: VcsProvider = {
      id: 'mock',
      getDefaultBranch: jest.fn(),
      listFiles: jest.fn(),
      readFile: jest.fn().mockRejectedValue(new Error('network timeout')),
      openPullRequest: jest.fn(),
      canHandle: jest.fn(),
    };

    await expect(
      fetchMkdocsContent(
        {
          vcs: {
            repoUrl: 'https://github.com/org/repo',
            docsDir: undefined,
          },
        },
        provider,
        'main',
      ),
    ).rejects.toThrow('network timeout');
  });

  it('rejects an unsafe docs_dir override to prevent path traversal via a malicious mkdocs.yml', () => {
    expect(() =>
      resolveDocsDirFromMkdocs({ docs_dir: '../../etc' }, 'docs'),
    ).toThrow(/must not escape the repository root/);
  });
});
