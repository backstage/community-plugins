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

import { createAzureDevopsCreatePipelineAction } from './devopsCreatePipeline';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { WebApi } from 'azure-devops-node-api';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

describe('azure:pipeline:create', () => {
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
  const action = createAzureDevopsCreatePipelineAction({ integrations });

  const mockContext = createMockActionContext({
    input: {
      repoUrl: 'dev.azure.com?repo=repo&project=project&organization=org',
    },
  });

  const mockGitClient = {
    createRepository: jest.fn(),
  };

  const mockBuildClient = {
    createDefinition: jest.fn(),
  };

  const mockGitApi = {
    getGitApi: jest.fn().mockReturnValue(mockGitClient),
    getBuildApi: jest.fn().mockReturnValue(mockBuildClient),
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
          repository: 'repo',
          pipelineName: 'pipeline',
          pipelineYamlFile: 'pipeline.yaml',
          project: 'project',
        },
      }),
    ).rejects.toThrow(/No credentials provided/);
  });

  it('should use token from input if provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
        token: 'input-token',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should use branch if provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
        token: 'input-token',
        branch: 'master',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        repository: expect.objectContaining({
          defaultBranch: 'master',
        }),
      }),
      'project',
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should use pipelineFolder if provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
        token: 'input-token',
        pipelineFolder: 'folder',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );

    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'folder',
      }),
      'project',
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should use pipelineAgentPoolName if provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
        pipelineAgentPoolName: 'agent-pool',
      },
    });

    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: { name: 'agent-pool', pool: { name: 'agent-pool' } },
      }),
      'project',
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should set branch to main if not provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
      },
    });
    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        repository: {
          name: 'repo',
          type: 'TfsGit',
          defaultBranch: 'main',
        },
      }),
      'project',
    );
  });

  it('should set host to azure.devops.com if not provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
      },
    });

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/org',
      expect.any(Function),
    );
    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should set pipelineFolder to root folder (/) if not provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
      },
    });

    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/',
      }),
      'project',
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should set pipelineAgentPoolName to Azure Pipelines if not provided', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => ({
      _links: { web: { href: 'http://pipeline-definition-url.com' } },
      id: '1',
    }));

    await action.handler({
      ...mockContext,
      input: {
        host: 'dev.azure.com',
        organization: 'org',
        repository: 'repo',
        pipelineName: 'pipeline',
        pipelineYamlFile: 'pipeline.yaml',
        project: 'project',
      },
    });

    expect(mockBuildClient.createDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: { name: 'Azure Pipelines', pool: { name: 'Azure Pipelines' } },
      }),
      'project',
    );

    expect(mockContext.output).toHaveBeenCalledWith(
      'pipelineUrl',
      'http://pipeline-definition-url.com',
    );

    expect(mockContext.output).toHaveBeenCalledWith('pipelineId', '1');
  });

  it('should throw if createDefinition fails', async () => {
    mockBuildClient.createDefinition.mockImplementation(() => {
      throw new Error('Pipeline creation failed');
    });
    await expect(
      action.handler({
        ...mockContext,
        input: {
          host: 'dev.azure.com',
          organization: 'org',
          repository: 'repo',
          pipelineName: 'pipeline',
          pipelineYamlFile: 'pipeline.yaml',
          project: 'project',
        },
      }),
    ).rejects.toThrow(/Pipeline creation failed/);
  });
});
