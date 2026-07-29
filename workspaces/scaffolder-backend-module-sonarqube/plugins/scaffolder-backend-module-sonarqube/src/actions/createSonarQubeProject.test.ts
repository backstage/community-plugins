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
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import { createSonarQubeProjectAction } from './createSonarQubeProject';

describe('sonarqube:create-project', () => {
  const action = createSonarQubeProjectAction();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockContext = createMockActionContext();

  it('should throw unauthorized error', async () => {
    const response = new Response(new Blob(), { status: 401, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9000',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        'Failed to create SonarQube project, status 401 - Unauthorized, please use a valid token or username and password',
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw invalid project key error', async () => {
    const projectKey = '+projekt';

    const response = new Response(new Blob(), {
      status: 400,
      statusText: `Malformed key for Project: "${projectKey}". Allowed characters are alphanumeric, '-', '_', '.' and ':', with at least one non-digit.`,
    });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9000',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: projectKey,
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        `Failed to create SonarQube project, status 400 - Malformed key for Project: "${projectKey}". Allowed characters are alphanumeric, '-', '_', '.' and ':', with at least one non-digit.`,
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should create a sonarqube project', async () => {
    const response = new Response(new Blob(), { status: 200, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    const baseUrl = 'http://localhost:9090';
    const name = 'test-project';
    const key = 'test-project';
    const token = 'test-token';

    await action.handler({
      ...mockContext,
      input: {
        baseUrl,
        token,
        username: '',
        password: '',
        name,
        key,
        branch: '',
        visibility: '',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/api/projects/create?name=${name}&project=${key}`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
        },
      }),
    );
    expect(mockContext.output).toHaveBeenCalledWith(
      'projectUrl',
      `${baseUrl}/dashboard?id=${key}`,
    );
  });

  it('should create a sonarqube project with branch, visibility, and username/password auth', async () => {
    const response = new Response(new Blob(), { status: 200, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    const baseUrl = 'http://localhost:9090';
    const name = 'test-project';
    const key = 'test-project';
    const branch = 'main';
    const visibility = 'private';
    const username = 'superuser';
    const password = 'super-sEkRiT'; // gitleaks:allow NOSONAR

    await action.handler({
      ...mockContext,
      input: {
        baseUrl,
        token: '',
        username,
        password,
        name,
        key,
        branch,
        visibility,
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/api/projects/create?name=${name}&project=${key}&mainBranch=${branch}&visibility=${visibility}`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      }),
    );
    expect(mockContext.output).toHaveBeenCalledWith(
      'projectUrl',
      `${baseUrl}/dashboard?id=${key}`,
    );
  });

  it('should prefer token auth when username and password are also provided', async () => {
    const response = new Response(new Blob(), { status: 200, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    const token = 'preferred-token';

    await action.handler({
      ...mockContext,
      input: {
        baseUrl: 'http://localhost:9090',
        token,
        username: 'superuser',
        password: 'super-sEkRiT', // gitleaks:allow NOSONAR
        name: 'test-project',
        key: 'test-project',
        branch: '',
        visibility: '',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
        }),
      }),
    );
  });

  it('should throw error from SonarQube response body when statusText is empty', async () => {
    const errorMessage = 'Could not create project';
    const response = new Response(
      JSON.stringify({ errors: [{ msg: errorMessage }] }),
      { status: 400, statusText: '' },
    );
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9000',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(`Failed to create SonarQube project, status 400 - ${errorMessage}`),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('should throw a required input validation error (baseUrl)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: '',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"baseUrl" is a required input parameter'));
  });

  it('should throw a required input validation error (name)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: 'abcdef',
          username: '',
          password: '',
          name: '',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"name" is a required input parameter'));
  });

  it('should throw a required input validation error (key)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: '',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"key" is a required input parameter'));
  });

  it('should throw a required input validation error on missing token or username and password', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });

  it('should throw a required input validation error on missing password', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: 'superuser',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });

  it('should throw a required input validation error on missing username', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: '',
          password: 'super-sEkRiT', // gitleaks:allow NOSONAR
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });
});
