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

import { extractTemplateSourceUrl } from './entity';
import type { Entity } from '@backstage/catalog-model';
import { ANNOTATION_LOCATION } from '@backstage/catalog-model';
import type { VcsProviderRegistry } from '../vcs/VcsProviderRegistry';
import type { VcsProvider } from '../vcs/VcsProvider';
import { ScmIntegrations } from '@backstage/integration';
import { mockServices } from '@backstage/backend-test-utils';

// Mock ScmIntegrations
jest.mock('@backstage/integration');

describe('extractTemplateSourceUrl', () => {
  const mockConfig = mockServices.rootConfig();
  const mockLogger = mockServices.logger.mock();

  // Mock provider that returns a base URL with trailing slash
  const createMockProvider = (baseUrl: string | null): VcsProvider => ({
    getName: () => 'mock',
    canHandle: () => true,
    extractRepoUrl: () => baseUrl,
    parseUrl: () => null,
    createPullRequest: async () => ({ url: 'https://example.com/pr/1' }),
    getReviewerFromOwner: async () => null,
  });

  const createMockRegistry = (provider: VcsProvider | null) =>
    ({
      registerProvider: jest.fn(),
      getProviderForUrl: jest.fn(),
      getProviderForEntity: jest.fn(() => provider),
      getProviders: jest.fn(() => (provider ? [provider] : [])),
    } as unknown as VcsProviderRegistry);

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock ScmIntegrations.fromConfig to return a mock with resolveUrl
    (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue({
      resolveUrl: jest.fn(({ url, base }) => {
        // Simple mock implementation that combines base and relative URL
        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
        const relativePath = url.startsWith('./') ? url.substring(2) : url;
        return `${cleanBase}/${relativePath}`;
      }),
    });
  });

  it('should extract absolute URL from fetch:template action', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'test-template',
      },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: {
              url: 'https://github.com/org/repo/tree/main/template',
            },
          },
        ],
      },
    };

    const mockRegistry = createMockRegistry(createMockProvider(null));
    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBe('https://github.com/org/repo/tree/main/template');
  });

  it('should resolve relative URL using provider extractRepoUrl (GitHub)', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'test-template',
        annotations: {
          [ANNOTATION_LOCATION]:
            'url:https://github.com/org/repo/blob/main/templates/template-a/catalog-info.yaml',
        },
      },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: {
              url: './skeleton',
            },
          },
        ],
      },
    };

    // Provider returns base URL (already processed by extractRepoUrl)
    const mockProvider = createMockProvider(
      'https://github.com/org/repo/tree/main/templates/template-a/',
    );
    const mockRegistry = createMockRegistry(mockProvider);

    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBe(
      'https://github.com/org/repo/tree/main/templates/template-a/skeleton',
    );
    expect(ScmIntegrations.fromConfig).toHaveBeenCalledWith(mockConfig);
  });

  it('should resolve relative URL using provider extractRepoUrl (GitLab)', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'test-template',
        annotations: {
          [ANNOTATION_LOCATION]:
            'url:https://gitlab.com/org/repo/-/blob/main/templates/template-a/catalog-info.yaml',
        },
      },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: {
              url: './skeleton',
            },
          },
        ],
      },
    };

    // Provider returns base URL with /-/tree/ (already processed by extractRepoUrl)
    const mockProvider = createMockProvider(
      'https://gitlab.com/org/repo/-/tree/main/templates/template-a/',
    );
    const mockRegistry = createMockRegistry(mockProvider);

    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBe(
      'https://gitlab.com/org/repo/-/tree/main/templates/template-a/skeleton',
    );
  });

  it('should return null when no steps are present', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'test-template' },
      spec: {},
    };

    const mockRegistry = createMockRegistry(createMockProvider(null));
    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBeNull();
  });

  it('should return null when no fetch:template action is found', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'test-template' },
      spec: {
        steps: [
          {
            action: 'debug:log',
            input: { message: 'test' },
          },
        ],
      },
    };

    const mockRegistry = createMockRegistry(createMockProvider(null));
    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBeNull();
  });

  it('should return null when relative URL but no provider found', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'test-template' },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: { url: './skeleton' },
          },
        ],
      },
    };

    const mockRegistry = createMockRegistry(null);
    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBeNull();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('No VCS provider found'),
    );
  });

  it('should return null when relative URL but provider cannot extract base URL', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: { name: 'test-template' },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: { url: './skeleton' },
          },
        ],
      },
    };

    const mockProvider = createMockProvider(null);
    const mockRegistry = createMockRegistry(mockProvider);

    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBeNull();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Could not extract base URL'),
    );
  });

  it('should return null when ScmIntegrations.resolveUrl throws an error', () => {
    (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue({
      resolveUrl: jest.fn(() => {
        throw new Error('Failed to resolve URL');
      }),
    });

    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'test-template',
      },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: {
              url: './skeleton',
            },
          },
        ],
      },
    };

    const mockProvider = createMockProvider(
      'https://github.com/org/repo/tree/main/templates/',
    );
    const mockRegistry = createMockRegistry(mockProvider);

    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBeNull();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to resolve template URL'),
    );
  });

  it('should handle nested relative paths', () => {
    const entity: Entity = {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'test-template',
      },
      spec: {
        steps: [
          {
            action: 'fetch:template',
            input: {
              url: './templates/skeleton',
            },
          },
        ],
      },
    };

    const mockProvider = createMockProvider(
      'https://github.com/org/repo/tree/main/',
    );
    const mockRegistry = createMockRegistry(mockProvider);

    const result = extractTemplateSourceUrl(
      entity,
      mockRegistry,
      mockConfig,
      mockLogger,
    );

    expect(result).toBe(
      'https://github.com/org/repo/tree/main/templates/skeleton',
    );
  });
});
