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

    await action.handler({
      ...mockContext,
      input: {
        baseUrl: 'http://localhost:9090',
        token: 'abcdef',
        username: '',
        password: '',
        name: 'test-project',
        key: 'test-project',
        branch: '',
        visibility: '',
      },
    });

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
