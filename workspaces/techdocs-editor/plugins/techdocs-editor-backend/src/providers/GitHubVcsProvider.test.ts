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

const mockGetRef = jest.fn();
const mockGetTree = jest.fn();

jest.mock('octokit', () => ({
  Octokit: class MockOctokit {
    rest = {
      git: { getRef: mockGetRef, getTree: mockGetTree, createRef: jest.fn() },
      repos: {
        get: jest.fn(),
        getContent: jest.fn(),
        createOrUpdateFileContents: jest.fn(),
        deleteFile: jest.fn(),
      },
      pulls: { create: jest.fn() },
    };
  },
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

describe('GitHubVcsProvider listFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCredentials.mockResolvedValue({ token: 'fake-token', headers: {} });
    mockGetRef.mockResolvedValue({ data: { object: { sha: 'tree-sha' } } });
  });

  it('returns files within the docs directory', async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { type: 'blob', path: 'docs/index.md' },
          { type: 'blob', path: 'README.md' }, // outside docs dir
          { type: 'tree', path: 'docs' }, // directory, not blob
        ],
      },
    });

    const files = await buildProvider().listFiles({
      repoUrl: REPO_URL,
      ref: 'main',
      dirPath: 'docs',
    });

    expect(files).toEqual(['index.md']);
  });

  it('excludes node_modules even when it falls within the docs directory', async () => {
    mockGetTree.mockResolvedValue({
      data: {
        tree: [
          { type: 'blob', path: 'docs/index.md' },
          {
            type: 'blob',
            path: 'docs/node_modules/@apidevtools/json-schema-ref-parser/CHANGELOG.md',
          },
        ],
      },
    });

    const files = await buildProvider().listFiles({
      repoUrl: REPO_URL,
      ref: 'main',
      dirPath: 'docs',
    });

    expect(files).toEqual(['index.md']);
  });
});
