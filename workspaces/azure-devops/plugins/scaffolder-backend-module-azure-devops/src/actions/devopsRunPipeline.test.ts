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
});
