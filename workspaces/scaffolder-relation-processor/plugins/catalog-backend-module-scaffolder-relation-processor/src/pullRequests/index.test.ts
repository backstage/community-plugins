/*
 * Copyright 2026 The Backstage Authors
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

import type { CatalogClient } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';
import { mockServices } from '@backstage/backend-test-utils';

import { handleTemplateUpdatePullRequest } from './index';
import { fetchAndCompareFiles } from './comparison';
import { extractTemplateSourceUrl } from './template/entity';
import type { VcsProvider } from './vcs/VcsProvider';
import type { VcsProviderRegistry } from './vcs/VcsProviderRegistry';
import { fetchRepoFiles } from './vcs/utils/fileOperations';

jest.mock('./vcs/utils/fileOperations', () => ({
  fetchRepoFiles: jest.fn(),
}));

jest.mock('./comparison', () => ({
  fetchAndCompareFiles: jest.fn(),
}));

jest.mock('./template/entity', () => ({
  extractTemplateSourceUrl: jest.fn(),
}));

describe('handleTemplateUpdatePullRequest', () => {
  const mockLogger = mockServices.logger.mock();
  const mockUrlReader = mockServices.urlReader.mock();
  const mockConfig = mockServices.rootConfig();
  const mockCatalogClient = {
    getEntityByRef: jest.fn(),
  } as unknown as CatalogClient;

  const templateEntity: Entity = {
    apiVersion: 'scaffolder.backstage.io/v1beta3',
    kind: 'Template',
    metadata: {
      name: 'service-template',
      title: 'Service Template',
    },
  };

  const scaffoldedEntity: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'my-service' },
    spec: { owner: 'user:default/alice' },
  };

  const templateSourceUrl = 'https://github.com/org/template-repo';
  const scaffoldedUrl = 'https://github.com/org/my-service';
  const templateFiles = new Map([['README.md', '# template']]);

  let mockProvider: jest.Mocked<VcsProvider>;
  let mockRegistry: jest.Mocked<VcsProviderRegistry>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProvider = {
      getName: jest.fn().mockReturnValue('github'),
      canHandle: jest.fn().mockReturnValue(true),
      parseUrl: jest
        .fn()
        .mockReturnValue({ owner: 'org', repo: 'template-repo' }),
      extractRepoUrl: jest.fn().mockReturnValue(scaffoldedUrl),
      getReviewerFromOwner: jest.fn().mockResolvedValue('alice'),
      createPullRequest: jest.fn().mockResolvedValue({
        url: 'https://github.com/org/my-service/pull/1',
      }),
    } as unknown as jest.Mocked<VcsProvider>;

    mockRegistry = {
      getProviderForUrl: jest.fn().mockReturnValue(mockProvider),
      getProviderForEntity: jest.fn().mockReturnValue(mockProvider),
      registerProvider: jest.fn(),
      getProviders: jest.fn(),
    } as unknown as jest.Mocked<VcsProviderRegistry>;

    (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
      templateEntity,
    );
    (extractTemplateSourceUrl as jest.Mock).mockReturnValue(templateSourceUrl);
    (fetchRepoFiles as jest.Mock).mockResolvedValue(templateFiles);
    (fetchAndCompareFiles as jest.Mock).mockResolvedValue(
      new Map([['README.md', '# updated']]),
    );
  });

  it('marks all entities as failed when the template entity is missing', async () => {
    (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
      undefined,
    );

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/missing',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'Template entity not found: template:default/missing',
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Template entity not found: template:default/missing',
    );
    expect(fetchRepoFiles).not.toHaveBeenCalled();
  });

  it('marks all entities as failed when the template source URL is missing', async () => {
    (extractTemplateSourceUrl as jest.Mock).mockReturnValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'No template source URL found for template service-template',
    });
    expect(fetchRepoFiles).not.toHaveBeenCalled();
  });

  it('marks all entities as failed when template files cannot be fetched', async () => {
    (fetchRepoFiles as jest.Mock).mockRejectedValue(
      new Error('network unavailable'),
    );

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'Failed to fetch template files: network unavailable',
    });
  });

  it('creates a pull request when template and scaffolded repos differ', async () => {
    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: true,
      url: 'https://github.com/org/my-service/pull/1',
    });
    expect(mockProvider.getReviewerFromOwner).toHaveBeenCalledWith(
      scaffoldedEntity,
      'token',
    );
    expect(mockProvider.createPullRequest).toHaveBeenCalledWith(
      scaffoldedUrl,
      new Map([['README.md', '# updated']]),
      expect.objectContaining({
        owner: 'org',
        repo: 'template-repo',
        name: 'Service Template',
        previousVersion: '1.0.0',
        currentVersion: '1.1.0',
        componentName: 'my-service',
      }),
      'alice',
    );
  });

  it('falls back to the template metadata name when title is absent', async () => {
    (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue({
      ...templateEntity,
      metadata: { name: 'service-template' },
    });

    await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(mockProvider.createPullRequest).toHaveBeenCalledWith(
      scaffoldedUrl,
      expect.any(Map),
      expect.objectContaining({ name: 'service-template' }),
      'alice',
    );
  });

  it('stringifies non-Error failures when fetching template files', async () => {
    (fetchRepoFiles as jest.Mock).mockRejectedValue('boom');

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'Failed to fetch template files: boom',
    });
  });

  it('skips storing a result when there are no file differences', async () => {
    (fetchAndCompareFiles as jest.Mock).mockResolvedValue(new Map());

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.has('my-service')).toBe(false);
    expect(mockProvider.createPullRequest).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('No differences found'),
    );
  });

  it('records a failure when file comparison itself fails', async () => {
    (fetchAndCompareFiles as jest.Mock).mockResolvedValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'Failed to fetch or compare files for entity my-service',
    });
  });

  it('records a failure when no VCS provider is available for an entity', async () => {
    mockRegistry.getProviderForUrl.mockReturnValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'No VCS provider found for entity',
    });
  });

  it('records a failure when the template URL cannot be parsed', async () => {
    mockProvider.parseUrl.mockReturnValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'No VCS provider found for entity',
    });
  });

  it('records a failure when the scaffolded entity has no provider', async () => {
    mockRegistry.getProviderForEntity.mockReturnValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'No VCS provider found for entity',
    });
  });

  it('records a failure when the scaffolded repository URL cannot be extracted', async () => {
    mockProvider.extractRepoUrl.mockReturnValue(null);

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'No VCS provider found for entity',
    });
  });

  it('isolates per-entity failures while still succeeding for others', async () => {
    const secondEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'other-service' },
    };

    mockProvider.createPullRequest
      .mockResolvedValueOnce({
        url: 'https://github.com/org/my-service/pull/1',
      })
      .mockRejectedValueOnce(new Error('API rate limit'));

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity, secondEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: true,
      url: 'https://github.com/org/my-service/pull/1',
    });
    expect(results.get('other-service')).toEqual({
      success: false,
      error: 'API rate limit',
    });
  });

  it('stringifies non-Error failures during per-entity PR creation', async () => {
    mockProvider.createPullRequest.mockRejectedValue('unexpected');

    const results = await handleTemplateUpdatePullRequest(
      mockCatalogClient,
      'token',
      'template:default/service-template',
      mockLogger,
      mockUrlReader,
      mockRegistry,
      mockConfig,
      [scaffoldedEntity],
      '1.0.0',
      '1.1.0',
    );

    expect(results.get('my-service')).toEqual({
      success: false,
      error: 'unexpected',
    });
  });
});
