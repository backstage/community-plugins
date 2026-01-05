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

import { GitHubProvider } from './GitHubProvider';
import type { CatalogClient } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';
import { ScmIntegrations } from '@backstage/integration';
import { mockServices } from '@backstage/backend-test-utils';

// Mock dependencies
jest.mock('@backstage/integration');
jest.mock('git-url-parse');

describe('GitHubProvider', () => {
  const mockLogger = mockServices.logger.mock();
  const mockConfig = mockServices.rootConfig();
  const mockCatalogClient = {
    getEntityByRef: jest.fn(),
  } as unknown as CatalogClient;

  let provider: GitHubProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GitHubProvider(mockLogger, mockConfig, mockCatalogClient);
  });

  describe('getName', () => {
    it('should return "github"', () => {
      expect(provider.getName()).toBe('github');
    });
  });

  describe('canHandle', () => {
    it('should return true for github.com URLs when integration is configured', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue({ config: {} }),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const result = provider.canHandle('https://github.com/org/repo');

      expect(result).toBe(true);
    });

    it('should return true for GitHub Enterprise URLs when integration is configured', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue({ config: {} }),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const result = provider.canHandle('https://github.example.com/org/repo');

      expect(result).toBe(true);
    });

    it('should return false when no GitHub integration is configured', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue(undefined),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const result = provider.canHandle('https://github.com/org/repo');

      expect(result).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      const result = provider.canHandle('not-a-url');

      expect(result).toBe(false);
    });

    it('should return false for non-GitHub URLs', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue(undefined),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const result = provider.canHandle('https://gitlab.com/org/repo');

      expect(result).toBe(false);
    });
  });

  describe('extractRepoUrl', () => {
    it('should extract GitHub URL from entity managed-by-location annotation', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue({ config: {} }),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/managed-by-location':
              'url:https://github.com/org/repo/blob/main/catalog-info.yaml',
          },
        },
      };

      const result = provider.extractRepoUrl(entity);

      // Should convert blob to tree and remove filename
      expect(result).toBe('https://github.com/org/repo/tree/main/');
    });

    it('should convert blob to tree in GitHub URLs', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue({ config: {} }),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/managed-by-location':
              'url:https://github.com/org/repo/blob/main/src/catalog-info.yaml',
          },
        },
      };

      const result = provider.extractRepoUrl(entity);

      expect(result).toBe('https://github.com/org/repo/tree/main/src/');
    });

    it('should return null when entity has no annotations', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
        },
      };

      const result = provider.extractRepoUrl(entity);

      expect(result).toBeNull();
    });

    it('should return null when entity has no managed-by-location annotation', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'other.annotation': 'value',
          },
        },
      };

      const result = provider.extractRepoUrl(entity);

      expect(result).toBeNull();
    });

    it('should return null when URL is not a GitHub URL', () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue(undefined),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/managed-by-location':
              'url:https://gitlab.com/org/repo/blob/main/catalog-info.yaml',
          },
        },
      };

      const result = provider.extractRepoUrl(entity);

      expect(result).toBeNull();
    });

    it('should return null for non-URL location types', () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test',
          annotations: {
            'backstage.io/managed-by-location':
              'file:/path/to/catalog-info.yaml',
          },
        },
      };

      const result = provider.extractRepoUrl(entity);

      expect(result).toBeNull();
    });
  });

  describe('parseUrl', () => {
    it('should parse a GitHub URL successfully', () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockReturnValue({
        owner: 'test-owner',
        name: 'test-repo',
        ref: 'main',
        filepath: 'src/path',
      });

      const result = provider.parseUrl(
        'https://github.com/test-owner/test-repo/tree/main/src/path',
      );

      expect(result).toEqual({
        owner: 'test-owner',
        repo: 'test-repo',
      });
    });

    it('should handle URLs without branch or path', () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockReturnValue({
        owner: 'test-owner',
        name: 'test-repo',
        ref: null,
        filepath: null,
      });

      const result = provider.parseUrl(
        'https://github.com/test-owner/test-repo',
      );

      expect(result).toEqual({
        owner: 'test-owner',
        repo: 'test-repo',
        branch: undefined,
        path: undefined,
      });
    });

    it('should return null when owner is missing', () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockReturnValue({
        owner: null,
        name: 'test-repo',
      });

      const result = provider.parseUrl('https://github.com/test-repo');

      expect(result).toBeNull();
    });

    it('should return null when repo name is missing', () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockReturnValue({
        owner: 'test-owner',
        name: null,
      });

      const result = provider.parseUrl('https://github.com/test-owner');

      expect(result).toBeNull();
    });

    it('should return null when parsing fails', () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const result = provider.parseUrl('invalid-url');

      expect(result).toBeNull();
    });
  });

  describe('getReviewerFromOwner', () => {
    it('should return GitHub login for User entity with annotation', async () => {
      const mockUserEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: 'test-user',
          annotations: {
            'github.com/user-login': 'github-user',
          },
        },
      };

      (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
        mockUserEntity,
      );

      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { owner: 'user:default/test-user' },
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBe('github-user');
      expect(mockCatalogClient.getEntityByRef).toHaveBeenCalledWith(
        'user:default/test-user',
        { token: 'test-token' },
      );
    });

    it('should return null when entity has no owner', async () => {
      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: {},
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBeNull();
      expect(mockCatalogClient.getEntityByRef).not.toHaveBeenCalled();
    });

    it('should return null when owner entity is not found', async () => {
      (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
        undefined,
      );

      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { owner: 'user:default/missing' },
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBeNull();
    });

    it('should return null when owner is a Group', async () => {
      const mockGroupEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: {
          name: 'test-group',
          annotations: {
            'github.com/user-login': 'github-team',
          },
        },
      };

      (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
        mockGroupEntity,
      );

      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { owner: 'group:default/test-group' },
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBeNull();
    });

    it('should return null when User has no GitHub annotation', async () => {
      const mockUserEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'User',
        metadata: {
          name: 'test-user',
          annotations: {},
        },
      };

      (mockCatalogClient.getEntityByRef as jest.Mock).mockResolvedValue(
        mockUserEntity,
      );

      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { owner: 'user:default/test-user' },
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBeNull();
    });

    it('should return null when catalog client throws error', async () => {
      (mockCatalogClient.getEntityByRef as jest.Mock).mockRejectedValue(
        new Error('Catalog error'),
      );

      const scaffoldedEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { owner: 'user:default/test-user' },
      };

      const result = await provider.getReviewerFromOwner(
        scaffoldedEntity,
        'test-token',
      );

      expect(result).toBeNull();
    });
  });

  describe('createPullRequest', () => {
    it('should throw error when client creation fails', async () => {
      // Mock integration that will cause issues downstream
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue(undefined),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const filesToUpdate = new Map([['README.md', 'content']]);
      const templateInfo = {
        owner: 'test-owner',
        repo: 'test-repo',
        name: 'test-template',
        previousVersion: '1.0.0',
        currentVersion: '2.0.0',
        componentName: 'test-component',
      };

      await expect(
        provider.createPullRequest(
          'https://github.com/org/repo',
          filesToUpdate,
          templateInfo,
          null,
        ),
      ).rejects.toThrow('GitHub authentication failed');
    });

    it('should throw error when no integration is configured', async () => {
      const mockIntegration = {
        github: {
          byHost: jest.fn().mockReturnValue(undefined),
        },
      };
      (ScmIntegrations.fromConfig as jest.Mock).mockReturnValue(
        mockIntegration,
      );

      const filesToUpdate = new Map([['README.md', 'content']]);
      const templateInfo = {
        owner: 'test-owner',
        repo: 'test-repo',
        name: 'test-template',
        previousVersion: '1.0.0',
        currentVersion: '2.0.0',
        componentName: 'test-component',
      };

      await expect(
        provider.createPullRequest(
          'https://github.com/org/repo',
          filesToUpdate,
          templateInfo,
          null,
        ),
      ).rejects.toThrow('GitHub authentication failed');
    });
  });
});
