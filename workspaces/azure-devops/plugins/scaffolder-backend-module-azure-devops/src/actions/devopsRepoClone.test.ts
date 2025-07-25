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

import { cloneAzureRepoAction } from './devopsRepoClone';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';

jest.mock('./helpers', () => ({
  cloneRepo: jest.fn(),
}));
jest.mock('@backstage/backend-plugin-api', () => ({
  ...jest.requireActual('@backstage/backend-plugin-api'),
  resolveSafeChildPath: jest.fn(
    (workspacePath, targetPath) => `${workspacePath}/${targetPath}`,
  ),
}));

const { cloneRepo } = require('./helpers');
const { resolveSafeChildPath } = require('@backstage/backend-plugin-api');

describe('cloneAzureRepoAction', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({ integrations: { azure: [] } }),
  );
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

  it('clones with provided token', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl, token: 'tok' },
    });
    await cloneAzureRepoAction({ integrations }).handler(ctx);
    expect(cloneRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `${workspacePath}/./`,
        auth: { username: 'not-empty', password: 'tok' },
        remoteUrl,
        branch: 'main',
      }),
    );
    expect(ctx.output).toHaveBeenCalledWith(
      'cloneFullPath',
      `${workspacePath}/./`,
    );
  });

  it('clones with PAT from credentials', async () => {
    getCredentialsMock.mockResolvedValue({ type: 'pat', token: 'pat-token' });
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl },
    });
    await cloneAzureRepoAction({ integrations }).handler(ctx);
    expect(cloneRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: { username: 'not-empty', password: 'pat-token' },
      }),
    );
  });

  it('clones with bearer from credentials', async () => {
    getCredentialsMock.mockResolvedValue({
      type: 'bearer',
      token: 'bearer-token',
    });
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl },
    });
    await cloneAzureRepoAction({ integrations }).handler(ctx);
    expect(cloneRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: { token: 'bearer-token' },
      }),
    );
  });

  it('throws if no credentials or token', async () => {
    getCredentialsMock.mockResolvedValue(undefined);
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl },
    });
    await expect(
      cloneAzureRepoAction({ integrations }).handler(ctx),
    ).rejects.toThrow(/No token credentials provided/);
  });

  it('uses custom branch and targetPath', async () => {
    getCredentialsMock.mockResolvedValue({ type: 'pat', token: 'pat-token' });
    const ctx = createMockActionContext({
      workspacePath,
      input: { remoteUrl, branch: 'develop', targetPath: 'subdir' },
    });
    await cloneAzureRepoAction({ integrations }).handler(ctx);
    expect(resolveSafeChildPath).toHaveBeenCalledWith(workspacePath, 'subdir');
    expect(cloneRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `${workspacePath}/subdir`,
        branch: 'develop',
      }),
    );
    expect(ctx.output).toHaveBeenCalledWith(
      'cloneFullPath',
      `${workspacePath}/subdir`,
    );
  });
});
