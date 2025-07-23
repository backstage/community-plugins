/*
 * Copyright 2021 The Backstage Authors
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

import { pushAzureRepoAction } from './devopsRepoPush';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';

jest.mock('./helpers', () => ({
  commitAndPushBranch: jest.fn(),
}));
jest.mock('./util', () => ({
  getRepoSourceDirectory: jest.fn((workspacePath, sourcePath) =>
    sourcePath ? `${workspacePath}/${sourcePath}` : workspacePath,
  ),
}));

const { commitAndPushBranch } = require('./helpers');
const { getRepoSourceDirectory } = require('./util');

describe('pushAzureRepoAction', () => {
  const config = new ConfigReader({
    scaffolder: {
      defaultAuthor: { name: 'Default Name', email: 'default@email.com' },
      defaultCommitMessage: 'Default commit',
    },
  });
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({ integrations: { azure: [] } }),
  );
  const action = pushAzureRepoAction({ integrations, config });
  const workspacePath = '/tmp/workspace';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls commitAndPushBranch with defaults', async () => {
    const ctx = createMockActionContext({
      workspacePath,
      input: {},
    });
    await action.handler(ctx);
    expect(getRepoSourceDirectory).toHaveBeenCalledWith(
      workspacePath,
      undefined,
    );
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: workspacePath,
        branch: 'scaffolder',
        commitMessage: 'Initial commit',
        gitAuthorInfo: { name: 'Default Name', email: 'default@email.com' },
        token: undefined,
      }),
    );
  });

  it('passes custom input values', async () => {
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        branch: 'feature',
        gitCommitMessage: 'My commit',
        gitAuthorName: 'Alice',
        gitAuthorEmail: 'alice@email.com',
      },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        branch: 'feature',
        commitMessage: 'My commit',
        gitAuthorInfo: { name: 'Alice', email: 'alice@email.com' },
      }),
    );
  });

  it('passes token if provided', async () => {
    const ctx = createMockActionContext({
      workspacePath,
      input: { token: 'tok' },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok' }),
    );
  });

  it('uses custom sourcePath if provided', async () => {
    const ctx = createMockActionContext({
      workspacePath,
      input: { sourcePath: 'subdir' },
    });
    await action.handler(ctx);
    expect(getRepoSourceDirectory).toHaveBeenCalledWith(
      workspacePath,
      'subdir',
    );
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({ dir: `${workspacePath}/subdir` }),
    );
  });

  it('uses config defaults if input values are missing', async () => {
    const ctx = createMockActionContext({
      workspacePath,
      input: {},
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        commitMessage: 'Initial commit',
        gitAuthorInfo: { name: 'Default Name', email: 'default@email.com' },
      }),
    );
  });
});
