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
import { createSonarCloudBindProjectAction } from './bindProject';

describe('sonarcloud:bind-project', () => {
  const action = createSonarCloudBindProjectAction({ token: 'cfg-token' });
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  const mockContext = createMockActionContext();

  it('should bind project via v2 API with JSON body', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'binding-1' }), { status: 201 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        projectId: 'uuid-123',
        projectKey: 'my-proj',
        repositoryId: 'Cibahealth/my-service',
      },
    });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toBe(
      'https://api.sonarcloud.io/dop-translation/project-bindings',
    );

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body as string);
    expect(body.projectId).toBe('uuid-123');
    expect(body.repositoryId).toBe('Cibahealth/my-service');

    expect(mockContext.output).toHaveBeenCalledWith(
      'repositoryId',
      'Cibahealth/my-service',
    );
  });

  it('should use token from config defaults', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 201 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        projectId: 'uuid-123',
        projectKey: 'my-proj',
        repositoryId: 'Cibahealth/my-service',
      },
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer cfg-token');
  });

  it('should throw when no token available', async () => {
    const noTokenAction = createSonarCloudBindProjectAction();

    await expect(
      noTokenAction.handler({
        ...mockContext,
        input: {
          projectId: 'uuid-123',
          projectKey: 'my-proj',
          repositoryId: 'Cibahealth/my-service',
        },
      }),
    ).rejects.toThrow(/Missing SonarCloud token/);
  });
});
