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

import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';

jest.mock('@backstage/plugin-scaffolder-node', () => ({
  ...jest.requireActual('@backstage/plugin-scaffolder-node'),
  commitAndPushBranch: jest.fn(),
  addFiles: jest.fn(),
}));

import { createAzureDevOpsPushRepoAction } from './devopsRepoPush';

const { commitAndPushBranch } = require('@backstage/plugin-scaffolder-node');

describe('createAzureDevOpsPushRepoAction', () => {
  const config = new ConfigReader({
    scaffolder: {
      defaultAuthor: { name: 'Default Name', email: 'default@email.com' },
      defaultCommitMessage: 'Default commit',
    },
  });
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({ integrations: { azure: [] } }),
  );
  const action = createAzureDevOpsPushRepoAction({ integrations, config });
  const workspacePath = '/tmp/workspace';
  const remoteUrl = 'https://dev.azure.com/org/project/_git/repo';
  let getCredentialsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getCredentialsMock = jest.fn();
    jest
      .spyOn(
        require('@backstage/integration').DefaultAzureDevOpsCredentialsProvider,
        'fromIntegrations',
      )
      .mockReturnValue({ getCredentials: getCredentialsMock });
  });

  it('calls commitAndPushBranch with defaults', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl, token: 'tok' },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: workspacePath,
        branch: 'scaffolder',
        commitMessage: 'Initial commit',
        gitAuthorInfo: { name: 'Default Name', email: 'default@email.com' },
        // token: undefined,
      }),
    );
  });

  it('passes custom input values', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        remoteUrl,
        branch: 'feature',
        gitCommitMessage: 'My commit',
        gitAuthorName: 'Alice',
        gitAuthorEmail: 'alice@email.com',
        token: 'tok',
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
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { token: 'tok', remoteUrl },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: expect.objectContaining({ password: 'tok' }),
      }),
    );
  });

  it('uses custom sourcePath if provided', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { sourcePath: 'subdir', remoteUrl, token: 'tok' },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({ dir: `${workspacePath}/subdir` }),
    );
  });

  it('uses config defaults if input values are missing', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl, token: 'tok' },
    });
    await action.handler(ctx);
    expect(commitAndPushBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        commitMessage: 'Initial commit',
        gitAuthorInfo: { name: 'Default Name', email: 'default@email.com' },
      }),
    );
  });

  it('fails validation when branch contains a space', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        remoteUrl,
        branch: 'feature branch with space',
        token: 'tok',
      },
    });

    await expect(action.handler(ctx)).rejects.toThrow(
      'Branch name must not contain spaces.',
    );
  });
});
