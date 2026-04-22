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
import { InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { resolveSourceUrl } from './sourceResolver';

const mockReader = {
  readUrl: jest.fn(),
  readTree: jest.fn(),
  search: jest.fn(),
} as any;

function buildIntegrations(type: 'github' | 'gitlab') {
  const config =
    type === 'github'
      ? new ConfigReader({
          integrations: { github: [{ host: 'github.com', token: 'tok' }] },
        })
      : new ConfigReader({
          integrations: { gitlab: [{ host: 'gitlab.com', token: 'tok' }] },
        });
  return ScmIntegrations.fromConfig(config);
}

function entity(
  annotation: string,
  extraAnnotations?: Record<string, string>,
): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'sample',
      namespace: 'default',
      annotations: {
        'backstage.io/techdocs-ref': annotation,
        ...extraAnnotations,
      },
    },
    spec: {},
  };
}

function entityWithSlug(slug: string, type: 'github' | 'gitlab'): Entity {
  const annotation =
    type === 'github' ? 'github.com/project-slug' : 'gitlab.com/project-slug';
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'sample',
      namespace: 'default',
      annotations: { 'backstage.io/techdocs-ref': 'dir:.', [annotation]: slug },
    },
    spec: {},
  };
}

function entityNoTechDocs(slug: string, type: 'github' | 'gitlab'): Entity {
  const annotation =
    type === 'github' ? 'github.com/project-slug' : 'gitlab.com/project-slug';
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'sample',
      namespace: 'default',
      annotations: { [annotation]: slug },
    },
    spec: {},
  };
}

describe('resolveSourceUrl', () => {
  describe('GitHub annotations', () => {
    const integrations = buildIntegrations('github');

    it('parses owner/repo from tree URL', async () => {
      const result = await resolveSourceUrl(
        entity('url:https://github.com/org/my-repo/tree/main'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://github.com/org/my-repo');
      expect(result.defaultBranch).toBe('main');
      expect(result.docsDir).toBeUndefined();
    });

    it('extracts docsDir from URL hash fragment', async () => {
      const result = await resolveSourceUrl(
        entity('url:https://github.com/org/my-repo/tree/main#my-docs'),
        integrations,
        mockReader,
      );
      expect(result.docsDir).toBe('my-docs');
    });

    it('parses bare repo URL without branch', async () => {
      const result = await resolveSourceUrl(
        entity('url:https://github.com/org/my-repo'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://github.com/org/my-repo');
      expect(result.defaultBranch).toBeUndefined();
    });
  });

  describe('error cases', () => {
    const integrations = buildIntegrations('github');

    it('throws InputError when annotation is missing', async () => {
      const noAnnotation: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'x', namespace: 'default' },
        spec: {},
      };
      await expect(
        resolveSourceUrl(noAnnotation, integrations, mockReader),
      ).rejects.toThrow(InputError);
    });

    it('throws InputError for dir: annotation when no slug fallback exists', async () => {
      // entity has dir:. and NO project-slug annotation
      const noSlugEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'x',
          namespace: 'default',
          annotations: { 'backstage.io/techdocs-ref': 'dir:.' },
        },
        spec: {},
      };
      await expect(
        resolveSourceUrl(noSlugEntity, integrations, mockReader),
      ).rejects.toThrow(InputError);
    });

    it('throws InputError when no SCM integration matches', async () => {
      const noIntegrations = ScmIntegrations.fromConfig(new ConfigReader({}));
      await expect(
        resolveSourceUrl(
          entity('url:https://unknown-host.example.com/org/repo'),
          noIntegrations,
          mockReader,
        ),
      ).rejects.toThrow(InputError);
    });
  });

  describe('project-slug fallback', () => {
    it('resolves from github.com/project-slug when techdocs-ref is dir:.', async () => {
      const integrations = buildIntegrations('github');
      const result = await resolveSourceUrl(
        entityWithSlug('org/my-repo', 'github'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://github.com/org/my-repo');
      expect(result.defaultBranch).toBeUndefined();
      expect(result.docsDir).toBeUndefined();
    });

    it('resolves from gitlab.com/project-slug when techdocs-ref is dir:.', async () => {
      const integrations = buildIntegrations('gitlab');
      const result = await resolveSourceUrl(
        entityWithSlug('group/my-repo', 'gitlab'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://gitlab.com/group/my-repo');
      expect(result.defaultBranch).toBeUndefined();
    });

    it('resolves from project-slug when techdocs-ref annotation is absent', async () => {
      const integrations = buildIntegrations('github');
      const result = await resolveSourceUrl(
        entityNoTechDocs('org/my-repo', 'github'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://github.com/org/my-repo');
    });

    it('throws when dir:. and no project-slug and no integration', async () => {
      const noIntegrations = ScmIntegrations.fromConfig(new ConfigReader({}));
      const noSlugEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'x',
          namespace: 'default',
          annotations: { 'backstage.io/techdocs-ref': 'dir:.' },
        },
        spec: {},
      };
      await expect(
        resolveSourceUrl(noSlugEntity, noIntegrations, mockReader),
      ).rejects.toThrow(InputError);
    });

    it('prefers url: techdocs-ref over project-slug', async () => {
      const integrations = buildIntegrations('github');
      // entity has both a url: annotation AND a project-slug — url: must win
      const result = await resolveSourceUrl(
        entity('url:https://github.com/org/explicit-repo/tree/main', {
          'github.com/project-slug': 'org/other-repo',
        }),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://github.com/org/explicit-repo');
    });
  });

  describe('GitLab annotations', () => {
    const integrations = buildIntegrations('gitlab');

    it('parses group/repo from GitLab tree URL', async () => {
      const result = await resolveSourceUrl(
        entity('url:https://gitlab.com/group/my-repo/-/tree/main'),
        integrations,
        mockReader,
      );
      expect(result.repoUrl).toBe('https://gitlab.com/group/my-repo');
      expect(result.defaultBranch).toBe('main');
    });
  });
});
