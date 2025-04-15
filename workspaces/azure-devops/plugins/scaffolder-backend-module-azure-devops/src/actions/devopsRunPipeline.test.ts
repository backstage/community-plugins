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

jest.mock('azure-devops-node-api', () => ({
  WebApi: jest.fn(),
  getPersonalAccessTokenHandler: jest.fn().mockReturnValue(() => {}),
}));

jest.mock('@backstage/plugin-scaffolder-node', () => {
  return {
    ...jest.requireActual('@backstage/plugin-scaffolder-node'),
    initRepoAndPush: jest.fn().mockResolvedValue({
      commitHash: '220f19cc36b551763d157f1b5e4a4b446165dbd6',
    }),
    commitAndPushRepo: jest.fn().mockResolvedValue({
      commitHash: '220f19cc36b551763d157f1b5e4a4b446165dbd6',
    }),
  };
});

import { createAzureDevopsRunPipelineAction } from './devopsRunPipeline';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { WebApi } from 'azure-devops-node-api';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import {
  Run,
  RunResult,
  RunState,
} from 'azure-devops-node-api/interfaces/PipelinesInterfaces';

describe('publish:azure', () => {
  const config = new ConfigReader({
    integrations: {
      azure: [
        {
          host: 'dev.azure.com',
          credentials: [{ personalAccessToken: 'tokenlols' }],
        },
        { host: 'myazurehostnotoken.com' },
      ],
    },
  });

  const integrations = ScmIntegrations.fromConfig(config);
  const action = createAzureDevopsRunPipelineAction({ integrations });

  const mockContext = createMockActionContext({
    input: {
      repoUrl: 'dev.azure.com?repo=repo&project=project&organization=org',
    },
  });

  const mockGitClient = {
    createRepository: jest.fn(),
  };

  const mockPipelineClient = {
    runPipeline: jest.fn(),
    getRun: jest.fn(),
  };

  const mockGitApi = {
    getGitApi: jest.fn().mockReturnValue(mockGitClient),
    getPipelinesApi: jest.fn().mockReturnValue(mockPipelineClient),
  };

  (WebApi as unknown as jest.Mock).mockImplementation(() => mockGitApi);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if there is no token or credentials provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          host: 'azure.com',
          organization: 'org',
          pipelineId: '1',
          project: 'project',
        },
      }),
    ).rejects.toThrow(/No credentials provided/);
  });

  it('should use token from input if provided', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));
    mockPipelineClient.getRun.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
        token: 'input-token',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineRunUrl',
      'http://pipeline-run-url.com',
    );
  });

  it('should use template parameters from input if provided', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));
    mockPipelineClient.getRun.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));

    const templateParameters = {
      templateParameterKey: 'templateParameterValue',
    };

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
        token: 'input-token',
        templateParameters,
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineRunUrl',
      'http://pipeline-run-url.com',
    );

    expect(mockPipelineClient.runPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.objectContaining({
          repositories: expect.objectContaining({
            self: expect.objectContaining({
              refName: 'refs/heads/main',
            }),
          }),
        }),
        templateParameters, // Ensure template parameters were passed correctly
      }),
      'project',
      1,
    );
  });

  it('should use branch branch if provided', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
        token: 'input-token',
        branch: 'master',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineRunUrl',
      'http://pipeline-run-url.com',
    );

    expect(mockPipelineClient.runPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.objectContaining({
          repositories: expect.objectContaining({
            self: expect.objectContaining({
              refName: 'refs/heads/master',
            }),
          }),
        }),
      }),
      'project',
      1,
    );
  });

  it('should throw if runPipeline fails', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => {
      throw new Error('Pipeline run failed');
    });

    await expect(
      action.handler({
        ...mockContext,
        input: {
          host: 'dev.azure.com',
          organization: 'org',
          pipelineId: '1',
          project: 'project',
        },
      }),
    ).rejects.toThrow(/Pipeline run failed/);
  });

  it('should output pipelineRunStatus if available', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
      result: 'InProgress',
    }));
    mockPipelineClient.getRun.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
      result: 'InProgress',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineRunUrl',
      'http://pipeline-run-url.com',
    );
    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineRunStatus',
      'InProgress',
    );
  });

  it('should wait when polling is specified', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));

    let runCount = 0;
    mockPipelineClient.getRun.mockImplementation(() => {
      runCount++;
      if (runCount === 3)
        return {
          _links: { web: { href: 'http://pipeline-run-url.com' } },
          result: RunResult.Succeeded,
          state: RunState.Completed,
        } as Run;

      return {
        _links: { web: { href: 'http://pipeline-run-url.com' } },
        state: RunState.InProgress,
      } as Run;
    });

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
        token: 'input-token',
        branch: 'master',
        pollingInterval: 1,
      },
    });

    expect(mockPipelineClient.runPipeline).toHaveBeenCalledTimes(1);
    expect(mockPipelineClient.getRun).toHaveBeenCalledTimes(4);
    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineTimeoutExceeded',
      false,
    );
  });

  it('should timeout when when pipeline timout is reached', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
    }));

    mockPipelineClient.getRun.mockImplementation(() => {
      return {
        _links: { web: { href: 'http://pipeline-run-url.com' } },
        state: RunState.InProgress,
      } as Run;
    });

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
        token: 'input-token',
        branch: 'master',
        pollingInterval: 1,
        pipelineTimeout: 2,
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineTimeoutExceeded',
      true,
    );
    expect(mockPipelineClient.runPipeline).toHaveBeenCalledTimes(1);
    expect(mockPipelineClient.getRun).toHaveBeenCalledTimes(4);
  });

  it('should output variables from pipeline if available', async () => {
    mockPipelineClient.runPipeline.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
      result: 'InProgress',
    }));
    mockPipelineClient.getRun.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-run-url.com' } },
      result: 'InProgress',
      variables: {
        var1: { isSecret: false, value: 'foo' },
        var2: { isSecret: true, value: 'bar' },
      },
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        pipelineId: '1',
        project: 'project',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineOutput',
      expect.objectContaining({ var1: { isSecret: false, value: 'foo' } }),
    );
    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineOutput',
      expect.objectContaining({ var2: { isSecret: true, value: 'bar' } }),
    );
  });
});
