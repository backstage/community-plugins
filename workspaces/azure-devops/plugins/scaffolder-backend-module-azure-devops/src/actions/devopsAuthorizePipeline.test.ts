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

import { createAzureDevopsAuthorizePipelineAction } from './devopsAuthorizePipeline';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { WebApi } from 'azure-devops-node-api';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

describe('azure:pipeline:authorize', () => {
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
  const action = createAzureDevopsAuthorizePipelineAction({ integrations });

  const mockRestClient = {
    client: {
      request: jest.fn().mockResolvedValue({
        message: JSON.stringify({ success: true, pipelines: [] }),
        statusCode: 200,
      }),
    },
  };

  const mockWebApi = {
    rest: mockRestClient,
  };

  (WebApi as unknown as jest.Mock).mockImplementation(() => mockWebApi);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if there is no token or credentials provided', async () => {
    const mockContext = createMockActionContext({
      input: {
        host: 'azure.com',
        organization: 'org',
        project: 'project',
        repository: 'repo',
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

  it('should throw if organization is missing', async () => {
    const mockContext = createMockActionContext({
      input: {
        project: 'project',
        repository: 'repo',
        pipelineId: '123',
        token: 'test-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '123',
        organization: '',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      /organization is required/,
    );
  });

  it('should throw if project is missing', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'org',
        repository: 'repo',
        pipelineId: '123',
        token: 'test-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '123',
        project: '',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      /project is required/,
    );
  });

  it('should throw if repository is missing', async () => {
    const mockContext = createMockActionContext({
      input: {
        organization: 'org',
        project: 'project',
        pipelineId: '123',
        token: 'test-token',
        authorized: true,
        resourceType: 'endpoint',
        resourceId: '123',
        repository: '',
      },
    });

    await expect(action.handler(mockContext)).rejects.toThrow(
      /repository is required/,
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

    expect(mockRestClient.client.request).toHaveBeenCalledWith(
      'PATCH',
      'testproject/_apis/pipelines/pipelinepermissions/endpoint/456?api-version=7.1-preview.1',
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

    expect(mockRestClient.client.request).toHaveBeenCalledWith(
      'PATCH',
      'testproject/_apis/pipelines/pipelinepermissions/repository/789?api-version=7.1-preview.1',
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

    mockRestClient.client.request.mockRejectedValue(
      new Error('Request failed'),
    );

    await expect(action.handler(mockContext)).rejects.toThrow(/Request failed/);
  });
});
