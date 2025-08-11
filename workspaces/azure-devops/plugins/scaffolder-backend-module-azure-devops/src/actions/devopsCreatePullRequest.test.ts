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

import { createAzureDevopsCreatePullRequestAction } from './devopsCreatePullRequest';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers'),
  createADOPullRequest: jest.fn(),
  updateADOPullRequest: jest.fn(),
  linkWorkItemToADOPullRequest: jest.fn(),
}));

const {
  createADOPullRequest,
  updateADOPullRequest,
  linkWorkItemToADOPullRequest,
} = require('./helpers');

describe('createAzureDevopsCreatePullRequestAction', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({ integrations: { azure: [] } }),
  );
  const action = createAzureDevopsCreatePullRequestAction({ integrations });
  let getCredentialsMock: jest.Mock;
  const workspacePath = '/tmp/workspace';

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

  it('throws if no token is provided', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
      },
    });
    await expect(action.handler(ctx)).rejects.toThrow(
      /No credentials provided/,
    );
  });

  it('creates a PR with provided token', async () => {
    getCredentialsMock.mockResolvedValue({ token: 'tok' });
    createADOPullRequest.mockResolvedValue({ pullRequestId: 42 });
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
        token: 'tok',
      },
    });
    await action.handler(ctx);
    expect(createADOPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        authHandler: expect.objectContaining({ token: 'tok' }),
      }),
    );
    expect(ctx.output).toHaveBeenCalledWith('pullRequestId', 42);
  });

  it('sets autoComplete if requested', async () => {
    getCredentialsMock.mockResolvedValue({ token: 'tok' });
    createADOPullRequest.mockResolvedValue({
      pullRequestId: 7,
      createdBy: { id: 'user1' },
    });
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
        token: 'tok',
        autoComplete: true,
      },
    });
    await action.handler(ctx);
    expect(updateADOPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        gitPullRequestToUpdate: expect.objectContaining({
          autoCompleteSetBy: { id: 'user1' },
        }),
        pullRequestId: 7,
      }),
    );
  });

  it('links work item if workItemId is provided', async () => {
    getCredentialsMock.mockResolvedValue({ token: 'tok' });
    createADOPullRequest.mockResolvedValue({ pullRequestId: 8 });
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
        token: 'tok',
        workItemId: '123',
      },
    });
    await action.handler(ctx);
    expect(linkWorkItemToADOPullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        pullRequestId: 8,
        workItemId: 123,
      }),
    );
  });

  it('throws if workItemId is not a number', async () => {
    getCredentialsMock.mockResolvedValue({ token: 'tok' });
    createADOPullRequest.mockResolvedValue({ pullRequestId: 9 });
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
        token: 'tok',
        workItemId: 'notanumber',
      },
    });
    await expect(action.handler(ctx)).rejects.toThrow(
      /Work Item ID must be a number/,
    );
  });

  it('throws if no pullRequestId is returned', async () => {
    getCredentialsMock.mockResolvedValue({ token: 'tok' });
    createADOPullRequest.mockResolvedValue({});
    const ctx = createMockActionContext({
      workspacePath,
      input: {
        title: 'PR',
        repoName: 'repo',
        project: 'proj',
        token: 'tok',
      },
    });
    await expect(action.handler(ctx)).rejects.toThrow(
      /No pull request ID returned/,
    );
  });
});
