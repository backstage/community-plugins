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

import { VcsProviderRegistry } from './VcsProviderRegistry';
import type { VcsProvider } from './VcsProvider';
import type { Entity } from '@backstage/catalog-model';

describe('VcsProviderRegistry', () => {
  const mockGithubProvider: VcsProvider = {
    getName: () => 'github',
    canHandle: (url: string) => url.includes('github.com'),
    extractRepoUrl: (entity: Entity) =>
      entity.metadata.annotations?.['backstage.io/source-location']?.includes(
        'github.com',
      )
        ? entity.metadata.annotations['backstage.io/source-location']
        : null,
    parseUrl: () => ({ owner: 'test', repo: 'test' }),
    createPullRequest: async () => ({
      url: 'https://github.com/test/test/pull/1',
    }),
    getReviewerFromOwner: async () => null,
  };

  const mockGitlabProvider: VcsProvider = {
    getName: () => 'gitlab',
    canHandle: (url: string) => url.includes('gitlab.com'),
    extractRepoUrl: (entity: Entity) =>
      entity.metadata.annotations?.['backstage.io/source-location']?.includes(
        'gitlab.com',
      )
        ? entity.metadata.annotations['backstage.io/source-location']
        : null,
    parseUrl: () => ({ owner: 'test', repo: 'test' }),
    createPullRequest: async () => ({
      url: 'https://gitlab.com/test/test/-/merge_requests/1',
    }),
    getReviewerFromOwner: async () => null,
  };

  describe('registerProvider', () => {
    it('should register a single provider', () => {
      const registry = new VcsProviderRegistry();

      registry.registerProvider(mockGithubProvider);

      expect(registry.getProviders()).toHaveLength(1);
      expect(registry.getProviders()[0]).toBe(mockGithubProvider);
    });

    it('should register multiple providers', () => {
      const registry = new VcsProviderRegistry();

      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(mockGitlabProvider);

      expect(registry.getProviders()).toHaveLength(2);
      expect(registry.getProviders()).toContain(mockGithubProvider);
      expect(registry.getProviders()).toContain(mockGitlabProvider);
    });
  });

  describe('getProviderForUrl', () => {
    it('should return provider that can handle the URL', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(mockGitlabProvider);

      const provider = registry.getProviderForUrl(
        'https://github.com/org/repo',
      );

      expect(provider).toBe(mockGithubProvider);
    });

    it('should return first matching provider when multiple can handle URL', () => {
      const registry = new VcsProviderRegistry();
      const catchAllProvider: VcsProvider = {
        ...mockGithubProvider,
        getName: () => 'catchall',
        canHandle: () => true,
      };

      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(catchAllProvider);

      const provider = registry.getProviderForUrl(
        'https://github.com/org/repo',
      );

      // Should return the first one that matches (GitHub)
      expect(provider).toBe(mockGithubProvider);
    });

    it('should return null when no provider can handle the URL', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);

      const provider = registry.getProviderForUrl(
        'https://bitbucket.org/org/repo',
      );

      expect(provider).toBeNull();
    });

    it('should return null when registry is empty', () => {
      const registry = new VcsProviderRegistry();

      const provider = registry.getProviderForUrl(
        'https://github.com/org/repo',
      );

      expect(provider).toBeNull();
    });
  });

  describe('getProviderForEntity', () => {
    it('should return provider that can extract repo URL from entity', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(mockGitlabProvider);

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/source-location': 'url:https://github.com/org/repo',
          },
        },
      };

      const provider = registry.getProviderForEntity(entity);

      expect(provider).toBe(mockGithubProvider);
    });

    it('should return first provider that can extract URL', () => {
      const registry = new VcsProviderRegistry();
      const catchAllProvider: VcsProvider = {
        ...mockGithubProvider,
        getName: () => 'catchall',
        extractRepoUrl: () => 'https://example.com/repo',
      };

      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(catchAllProvider);

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/source-location': 'url:https://github.com/org/repo',
          },
        },
      };

      const provider = registry.getProviderForEntity(entity);

      // Should return the first one that successfully extracts
      expect(provider).toBe(mockGithubProvider);
    });

    it('should return null when no provider can extract URL from entity', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/source-location':
              'url:https://bitbucket.org/org/repo',
          },
        },
      };

      const provider = registry.getProviderForEntity(entity);

      expect(provider).toBeNull();
    });

    it('should return null when entity has no annotations', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      const provider = registry.getProviderForEntity(entity);

      expect(provider).toBeNull();
    });

    it('should return null when registry is empty', () => {
      const registry = new VcsProviderRegistry();

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/source-location': 'url:https://github.com/org/repo',
          },
        },
      };

      const provider = registry.getProviderForEntity(entity);

      expect(provider).toBeNull();
    });
  });

  describe('getProviders', () => {
    it('should return empty array when no providers registered', () => {
      const registry = new VcsProviderRegistry();

      const providers = registry.getProviders();

      expect(providers).toEqual([]);
    });

    it('should return all registered providers', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);
      registry.registerProvider(mockGitlabProvider);

      const providers = registry.getProviders();

      expect(providers).toHaveLength(2);
      expect(providers).toContain(mockGithubProvider);
      expect(providers).toContain(mockGitlabProvider);
    });

    it('should return a copy of the providers array', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);

      const providers1 = registry.getProviders();
      const providers2 = registry.getProviders();

      expect(providers1).not.toBe(providers2);
      expect(providers1).toEqual(providers2);
    });

    it('should not allow external modification of internal providers array', () => {
      const registry = new VcsProviderRegistry();
      registry.registerProvider(mockGithubProvider);

      const providers = registry.getProviders();
      providers.push(mockGitlabProvider);

      expect(registry.getProviders()).toHaveLength(1);
    });
  });
});
