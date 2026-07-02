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
import { createSonarCloudSetDefaultBranchAction } from './setDefaultBranch';
import { SonarCloudApiError } from '../lib';

describe('sonarcloud:setDefaultBranch', () => {
  const action = createSonarCloudSetDefaultBranchAction();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  const mockContext = createMockActionContext();

  it('should use default branch name "main" when name not provided', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        projectKey: 'my-proj',
        token: 'tok',
      } as any,
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = new URLSearchParams(init.body as string);
    expect(body.get('name')).toBe('main');
    expect(body.get('project')).toBe('my-proj');
  });

  it('should use custom branch name when provided', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        projectKey: 'my-proj',
        name: 'develop',
        token: 'tok',
      },
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = new URLSearchParams(init.body as string);
    expect(body.get('name')).toBe('develop');
  });

  it('should succeed on 200 (idempotent)', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: {
          projectKey: 'my-proj',
          name: 'main',
          token: 'tok',
        },
      }),
    ).resolves.not.toThrow();
  });

  it('should throw SonarCloudApiError on 404', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ msg: 'Project not found' }] }), {
        status: 404,
      }),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: {
          projectKey: 'nonexistent',
          name: 'main',
          token: 'tok',
        },
      }),
    ).rejects.toThrow(SonarCloudApiError);
  });

  it('should output branchName', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await action.handler({
      ...mockContext,
      input: {
        projectKey: 'my-proj',
        name: 'release',
        token: 'tok',
      },
    });

    expect(mockContext.output).toHaveBeenCalledWith('branchName', 'release');
  });
});
