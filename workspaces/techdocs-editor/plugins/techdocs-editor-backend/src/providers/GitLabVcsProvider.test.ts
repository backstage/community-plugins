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

const mockRepositoriesAllTrees = jest.fn();

jest.mock('@gitbeaker/rest', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    Projects: { show: jest.fn() },
    RepositoryFiles: { show: jest.fn() },
    Repositories: { allRepositoryTrees: mockRepositoriesAllTrees },
    Branches: { create: jest.fn() },
    Commits: { create: jest.fn() },
    MergeRequests: { create: jest.fn() },
  })),
}));

const gitlabConfig = new ConfigReader({
  integrations: {
    gitlab: [{ host: 'gitlab.com', token: 'glpat-test-token' }],
  },
});

describe('GitLabVcsProvider listFiles', () => {
  let provider: GitLabVcsProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GitLabVcsProvider(gitlabConfig);
  });

  it('returns blob paths stripped of the dirPath prefix', async () => {
    mockRepositoriesAllTrees.mockResolvedValue([
      { type: 'tree', path: 'docs/sub' },
      { type: 'blob', path: 'docs/index.md' },
    ]);

    const files = await provider.listFiles({
      repoUrl: 'https://gitlab.com/org/repo',
      dirPath: 'docs',
      ref: 'main',
    });

    expect(files).toEqual(['index.md']);
  });

  it('excludes node_modules even when it falls within the docs directory', async () => {
    mockRepositoriesAllTrees.mockResolvedValue([
      { type: 'blob', path: 'docs/index.md' },
      {
        type: 'blob',
        path: 'docs/node_modules/@apidevtools/json-schema-ref-parser/CHANGELOG.md',
      },
    ]);

    const files = await provider.listFiles({
      repoUrl: 'https://gitlab.com/org/repo',
      dirPath: 'docs',
      ref: 'main',
    });

    expect(files).toEqual(['index.md']);
  });
});
