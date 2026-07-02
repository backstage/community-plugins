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
import { GitHubVcsProvider } from './GitHubVcsProvider';

// Mock the credentials provider
const mockGetCredentials = jest.fn();
jest.mock('@backstage/integration', () => {
  const real = jest.requireActual('@backstage/integration');
  return {
    ...real,
    DefaultGithubCredentialsProvider: {
      fromIntegrations: () => ({
        getCredentials: mockGetCredentials,
      }),
    },
  };
});

// Mock Octokit
const mockGetRef = jest.fn();
const mockGetTree = jest.fn();
const mockGetContent = jest.fn();
const mockReposGet = jest.fn();
const mockCreatePullRequest = jest.fn();

jest.mock('octokit', () => ({
  Octokit: class MockOctokit {
    static plugin() {
      return class ExtendedOctokit {
        rest = {
          git: { getRef: mockGetRef, getTree: mockGetTree },
          repos: { get: mockReposGet, getContent: mockGetContent },
        };
        createPullRequest = mockCreatePullRequest;
      };
    }
  },
}));

jest.mock('octokit-plugin-create-pull-request', () => ({
  createPullRequest: jest.fn(),
}));

function buildProvider() {
  const config = new ConfigReader({
    integrations: {
      github: [{ host: 'github.com', token: 'fake-token' }],
    },
  });
  return new GitHubVcsProvider(config);
}

const REPO_URL = 'https://github.com/org/my-docs';

describe('GitHubVcsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCredentials.mockResolvedValue({ token: 'fake-token', headers: {} });
  });

  describe('canHandle', () => {
    it('returns true for github.com URLs', () => {
      const p = buildProvider();
      expect(p.canHandle('https://github.com/org/repo')).toBe(true);
    });

    it('returns false for non-github URLs', () => {
      const p = buildProvider();
      expect(p.canHandle('https://gitlab.com/org/repo')).toBe(false);
    });
  });

  describe('getDefaultBranch', () => {
    it('returns the default branch from the API', async () => {
      mockReposGet.mockResolvedValue({ data: { default_branch: 'main' } });
      const p = buildProvider();
      const branch = await p.getDefaultBranch(REPO_URL);
      expect(branch).toBe('main');
    });
  });

  describe('listFiles', () => {
    it('returns files within the docs directory', async () => {
      mockGetRef.mockResolvedValue({
        data: { object: { sha: 'tree-sha' } },
      });
      mockGetTree.mockResolvedValue({
        data: {
          tree: [
            { type: 'blob', path: 'docs/index.md' },
            { type: 'blob', path: 'docs/guide/setup.md' },
            { type: 'blob', path: 'README.md' }, // outside docs dir
            { type: 'tree', path: 'docs' }, // directory, not blob
          ],
        },
      });

      const p = buildProvider();
      const files = await p.listFiles({
        repoUrl: REPO_URL,
        ref: 'main',
        dirPath: 'docs',
      });

      expect(files).toEqual(['index.md', 'guide/setup.md']);
    });
  });

  describe('readFile', () => {
    it('returns decoded content and etag', async () => {
      const content = Buffer.from('# Hello World').toString('base64');
      mockGetContent.mockResolvedValue({
        data: { content, sha: 'abc123' },
      });

      const p = buildProvider();
      const result = await p.readFile({
        repoUrl: REPO_URL,
        ref: 'main',
        filePath: 'docs/index.md',
      });

      expect(result.content).toBe('# Hello World');
      expect(result.etag).toBe('abc123');
    });

    it('throws NotFoundError for 404 responses', async () => {
      const err = Object.assign(new Error('Not Found'), { status: 404 });
      mockGetContent.mockRejectedValue(err);

      const p = buildProvider();
      await expect(
        p.readFile({ repoUrl: REPO_URL, ref: 'main', filePath: 'missing.md' }),
      ).rejects.toThrow('File not found');
    });
  });

  describe('openPullRequest', () => {
    it('calls createPullRequest with mapped options', async () => {
      mockCreatePullRequest.mockResolvedValue({
        data: { html_url: 'https://github.com/org/repo/pull/42', number: 42 },
      });

      const p = buildProvider();
      const result = await p.openPullRequest({
        repoUrl: REPO_URL,
        headBranch: 'techdocs-editor/user/1234567890',
        baseBranch: 'main',
        title: 'docs: update index',
        files: new Map([['docs/index.md', '# Updated']]),
        commitMessage: 'docs: update index.md',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
      });

      expect(result.url).toBe('https://github.com/org/repo/pull/42');
      expect(result.number).toBe(42);
      expect(mockCreatePullRequest).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'docs: update index' }),
      );
    });
  });
});
