/*
 * Copyright 2024 The Backstage Authors
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
  getBearerHandler: jest.fn().mockReturnValue(() => {}),
}));

import { createAzureDevopsPermitPipelineAction } from './devopsPermitPipeline';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { WebApi } from 'azure-devops-node-api';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

describe('azure:pipeline:permit', () => {
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
  const action = createAzureDevopsPermitPipelineAction({ integrations });

  const mockRestClient = {
    client: {
      patch: jest.fn().mockResolvedValue({
        message: {
          statusCode: 200,
          statusMessage: 'OK',
        },
      }),
    },
  };

  const mockGetProject = jest.fn().mockResolvedValue({
    id: 'project-guid-123',
    name: 'testproject',
  });

  const mockWebApi = {
    rest: mockRestClient,
    getCoreApi: jest.fn().mockResolvedValue({
      getProject: mockGetProject,
    }),
  };

  (WebApi as unknown as jest.Mock).mockImplementation(() => mockWebApi);

  beforeEach(() => {
    jest.clearAllMocks();
    mockRestClient.client.patch.mockResolvedValue({
      message: {
        statusCode: 200,
        statusMessage: 'OK',
      },
    });
    mockGetProject.mockResolvedValue({
      id: 'project-guid-123',
      name: 'testproject',
    });
    mockWebApi.getCoreApi.mockResolvedValue({
      getProject: mockGetProject,
    });
  });

  it('should throw if there is no token or credentials provided', async () => {
    const mockContext = createMockActionContext({
      input: {
        host: 'azure.com',
        organization: 'org',
        project: 'project',
        pipelineId: '123',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '123',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      /No credentials provided/,
    );
  });

  it('should authorize pipeline with token from input', async () => {
    const mockContext = createMockActionContext({
      input: {
        host: 'dev.azure.com',
        organization: 'testorg',
        project: 'testproject',
        repository: 'testrepo',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '456',
      },
    });

    await action.handler(mockContext);

    expect(WebApi).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg',
      expect.any(Function),
    );

    expect(mockRestClient.client.patch).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg/testproject/_apis/pipelines/pipelinepermissions/endpoint/456?api-version=7.1-preview.1',
      JSON.stringify({
        pipelines: [
          {
            id: 123,
            authorized: true,
          },
        ],
      }),
      {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    );
  });

  it('should use custom authorized and resourceType values', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'testproject',
        repository: 'testrepo',
        pipelineId: '123',
        authorized: false,
        resourceType: 'repository',
        token: 'input-token',
        resourceId: '789',
      },
    });

    await action.handler(mockContext);

    expect(mockRestClient.client.patch).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg/testproject/_apis/pipelines/pipelinepermissions/repository/project-guid-123.789?api-version=7.1-preview.1',
      JSON.stringify({
        pipelines: [
          {
            id: 123,
            authorized: false,
          },
        ],
      }),
      {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    );
  });

  it('should throw if request fails', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'testproject',
        repository: 'testrepo',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '123',
      },
    });

    mockRestClient.client.patch.mockRejectedValue(new Error('Request failed'));

    await expect(action.handler(mockContext)).rejects.toThrow(/Request failed/);
  });

  it('should resolve compound resource ID for repository type', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'testproject',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'repository',
        resourceId: 'repo-guid-abc',
      },
    });

    await action.handler(mockContext);

    expect(mockWebApi.getCoreApi).toHaveBeenCalled();
    expect(mockGetProject).toHaveBeenCalledWith('testproject');
    expect(mockRestClient.client.patch).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg/testproject/_apis/pipelines/pipelinepermissions/repository/project-guid-123.repo-guid-abc?api-version=7.1-preview.1',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('should pass through repository resource ID that already contains a dot', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'testproject',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'repository',
        resourceId: 'existing-project-id.repo-guid',
      },
    });

    await action.handler(mockContext);

    expect(mockWebApi.getCoreApi).not.toHaveBeenCalled();
    expect(mockRestClient.client.patch).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg/testproject/_apis/pipelines/pipelinepermissions/repository/existing-project-id.repo-guid?api-version=7.1-preview.1',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('should not resolve compound ID for non-repository resource types', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'testproject',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: 'simple-guid',
      },
    });

    await action.handler(mockContext);

    expect(mockWebApi.getCoreApi).not.toHaveBeenCalled();
    expect(mockRestClient.client.patch).toHaveBeenCalledWith(
      'https://dev.azure.com/testorg/testproject/_apis/pipelines/pipelinepermissions/endpoint/simple-guid?api-version=7.1-preview.1',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('should throw if project lookup fails for repository type', async () => {
    mockWebApi.getCoreApi.mockResolvedValueOnce({
      getProject: jest.fn().mockResolvedValue(null),
    });

    const mockContext = createMockActionContext({
      input: {
        organization: 'testorg',
        project: 'nonexistent',
        pipelineId: '123',
        token: 'input-token',
        authorized: true,
        resourceType: 'repository',
        resourceId: 'repo-guid',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      /Could not retrieve project ID/,
    );
  });
});
