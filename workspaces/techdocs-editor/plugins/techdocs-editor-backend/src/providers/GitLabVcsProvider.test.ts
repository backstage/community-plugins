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

import { ConfigReader } from '@backstage/config';
import { GitLabVcsProvider } from './GitLabVcsProvider';

// Mock @gitbeaker/rest
const mockProjectsShow = jest.fn();
const mockRepositoryFilesShow = jest.fn();
const mockRepositoriesAllTrees = jest.fn();
const mockBranchesCreate = jest.fn();
const mockCommitsCreate = jest.fn();
const mockMergeRequestsCreate = jest.fn();

jest.mock('@gitbeaker/rest', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    Projects: { show: mockProjectsShow },
    RepositoryFiles: { show: mockRepositoryFilesShow },
    Repositories: { allRepositoryTrees: mockRepositoriesAllTrees },
    Branches: { create: mockBranchesCreate },
    Commits: { create: mockCommitsCreate },
    MergeRequests: { create: mockMergeRequestsCreate },
  })),
}));

const gitlabConfig = new ConfigReader({
  integrations: {
    gitlab: [{ host: 'gitlab.com', token: 'glpat-test-token' }],
  },
});

describe('GitLabVcsProvider', () => {
  let provider: GitLabVcsProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GitLabVcsProvider(gitlabConfig);
  });

  describe('canHandle', () => {
    it('returns true for a gitlab.com URL', () => {
      expect(provider.canHandle('https://gitlab.com/org/repo')).toBe(true);
    });

    it('returns false for a github.com URL', () => {
      expect(provider.canHandle('https://github.com/org/repo')).toBe(false);
    });

    it('returns false for an invalid URL', () => {
      expect(provider.canHandle('not-a-url')).toBe(false);
    });
  });

  describe('getDefaultBranch', () => {
    it('returns default_branch from the project', async () => {
      mockProjectsShow.mockResolvedValue({ default_branch: 'main' });
      const branch = await provider.getDefaultBranch(
        'https://gitlab.com/org/repo',
      );
      expect(mockProjectsShow).toHaveBeenCalledWith('org/repo');
      expect(branch).toBe('main');
    });

    it('falls back to main when default_branch is undefined', async () => {
      mockProjectsShow.mockResolvedValue({ default_branch: undefined });
      const branch = await provider.getDefaultBranch(
        'https://gitlab.com/org/repo',
      );
      expect(branch).toBe('main');
    });
  });

  describe('readFile', () => {
    it('decodes base64 content and returns blob_id as etag', async () => {
      const content = Buffer.from('# Hello World').toString('base64');
      mockRepositoryFilesShow.mockResolvedValue({
        content,
        blob_id: 'abc123',
      });

      const result = await provider.readFile({
        repoUrl: 'https://gitlab.com/org/repo',
        filePath: 'docs/index.md',
        ref: 'main',
      });

      expect(mockRepositoryFilesShow).toHaveBeenCalledWith(
        'org/repo',
        'docs/index.md',
        'main',
      );
      expect(result.content).toBe('# Hello World');
      expect(result.etag).toBe('abc123');
    });

    it('throws NotFoundError on 404', async () => {
      mockRepositoryFilesShow.mockRejectedValue({
        message: '404 File Not Found',
      });

      await expect(
        provider.readFile({
          repoUrl: 'https://gitlab.com/org/repo',
          filePath: 'docs/missing.md',
          ref: 'main',
        }),
      ).rejects.toThrow('File not found: docs/missing.md');
    });

    it('re-throws unexpected errors', async () => {
      mockRepositoryFilesShow.mockRejectedValue(new Error('Network error'));

      await expect(
        provider.readFile({
          repoUrl: 'https://gitlab.com/org/repo',
          filePath: 'docs/index.md',
          ref: 'main',
        }),
      ).rejects.toThrow('Network error');
    });
  });

  describe('listFiles', () => {
    it('returns blob paths stripped of the dirPath prefix', async () => {
      mockRepositoriesAllTrees.mockResolvedValue([
        { type: 'tree', path: 'docs/sub' },
        { type: 'blob', path: 'docs/index.md' },
        { type: 'blob', path: 'docs/guide/setup.md' },
      ]);

      const files = await provider.listFiles({
        repoUrl: 'https://gitlab.com/org/repo',
        dirPath: 'docs',
        ref: 'main',
      });

      expect(mockRepositoriesAllTrees).toHaveBeenCalledWith('org/repo', {
        path: 'docs',
        ref: 'main',
        recursive: true,
      });
      expect(files).toEqual(['index.md', 'guide/setup.md']);
    });

    it('excludes non-blob items', async () => {
      mockRepositoriesAllTrees.mockResolvedValue([
        { type: 'tree', path: 'docs' },
        { type: 'commit', path: 'docs/sub' },
        { type: 'blob', path: 'docs/page.md' },
      ]);

      const files = await provider.listFiles({
        repoUrl: 'https://gitlab.com/org/repo',
        dirPath: 'docs',
        ref: 'main',
      });
      expect(files).toEqual(['page.md']);
    });
  });

  describe('openPullRequest', () => {
    it('creates branch, commits files, and opens a merge request', async () => {
      mockRepositoryFilesShow.mockRejectedValue({ message: '404' }); // new file
      mockBranchesCreate.mockResolvedValue({});
      mockCommitsCreate.mockResolvedValue({});
      mockMergeRequestsCreate.mockResolvedValue({
        web_url: 'https://gitlab.com/org/repo/-/merge_requests/42',
        iid: 42,
      });

      const result = await provider.openPullRequest({
        repoUrl: 'https://gitlab.com/org/repo',
        headBranch: 'techdocs-editor/patch-1',
        baseBranch: 'main',
        title: 'Update docs',
        description: 'Fixed a typo',
        commitMessage: 'docs: fix typo',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        files: new Map([['docs/index.md', '# Updated']]),
      });

      expect(mockBranchesCreate).toHaveBeenCalledWith(
        'org/repo',
        'techdocs-editor/patch-1',
        'main',
      );
      expect(mockCommitsCreate).toHaveBeenCalledWith(
        'org/repo',
        'techdocs-editor/patch-1',
        'docs: fix typo',
        expect.arrayContaining([
          expect.objectContaining({
            action: 'create',
            file_path: 'docs/index.md',
          }),
        ]),
        { authorName: 'Test User', authorEmail: 'test@example.com' },
      );
      expect(result.url).toBe(
        'https://gitlab.com/org/repo/-/merge_requests/42',
      );
      expect(result.number).toBe(42);
    });

    it('uses update action for an existing file', async () => {
      mockRepositoryFilesShow.mockResolvedValue({
        content: 'old',
        blob_id: 'x',
      });
      mockBranchesCreate.mockResolvedValue({});
      mockCommitsCreate.mockResolvedValue({});
      mockMergeRequestsCreate.mockResolvedValue({
        web_url: 'https://gitlab.com/mr/1',
        iid: 1,
      });

      await provider.openPullRequest({
        repoUrl: 'https://gitlab.com/org/repo',
        headBranch: 'patch-2',
        baseBranch: 'main',
        title: 'Update',
        commitMessage: 'update',
        authorName: 'A',
        authorEmail: 'a@b.com',
        files: new Map([['docs/page.md', '# New content']]),
      });

      expect(mockCommitsCreate).toHaveBeenCalledWith(
        'org/repo',
        'patch-2',
        'update',
        expect.arrayContaining([
          expect.objectContaining({
            action: 'update',
            file_path: 'docs/page.md',
          }),
        ]),
        expect.any(Object),
      );
    });
  });
});
