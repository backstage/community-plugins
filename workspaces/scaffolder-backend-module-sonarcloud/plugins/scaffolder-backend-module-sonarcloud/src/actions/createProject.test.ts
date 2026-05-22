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
import { createSonarCloudCreateProjectAction } from './createProject';
import { SonarCloudApiError } from '../lib';

describe('sonarcloud:create-project', () => {
  const action = createSonarCloudCreateProjectAction();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  let mockContext: ReturnType<typeof createMockActionContext>;

  beforeEach(() => {
    mockContext = createMockActionContext();
  });

  const defaultInput = {
    organization: 'my-org',
    name: 'My Project',
    key: 'my-proj',
    token: 'secret-token',
  };

  it('should create a project and output projectKey and projectUrl', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ project: { key: 'smoke-test', uuid: 'uuid-abc' } }),
        { status: 200 },
      ),
    );

    await action.handler({
      ...mockContext,
      input: defaultInput,
    });

    expect(mockContext.output).toHaveBeenCalledWith('projectKey', 'smoke-test');
    expect(mockContext.output).toHaveBeenCalledWith(
      'projectUrl',
      'https://sonarcloud.io/project/overview?id=smoke-test',
    );
  });

  it('should handle idempotent creation when project already exists (400)', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            errors: [
              {
                msg: 'Could not create project, key already exists: my-proj',
              },
            ],
          }),
          { status: 400 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            projects: [{ id: 'existing-uuid' }],
          }),
          { status: 200 },
        ),
      );

    const ctx = createMockActionContext();
    const loggerWarnSpy = jest.spyOn(ctx.logger, 'warn');

    await action.handler({
      ...ctx,
      input: defaultInput,
    });

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('already exists'),
    );
    expect(ctx.output).toHaveBeenCalledWith('projectKey', 'my-proj');
    expect(ctx.output).toHaveBeenCalledWith('projectId', 'existing-uuid');
    expect(ctx.output).toHaveBeenCalledWith(
      'projectUrl',
      expect.stringContaining('my-proj'),
    );
  });

  it('should throw when 400 error does not contain "already exists"', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: [{ msg: 'Invalid project key format' }],
        }),
        { status: 400 },
      ),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(SonarCloudApiError);
  });

  it('should throw SonarCloudApiError on 401', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ errors: [{ msg: 'Insufficient privileges' }] }),
        { status: 401 },
      ),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(SonarCloudApiError);
  });

  it('should throw SonarCloudApiError on 404', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ errors: [{ msg: 'Organization not found' }] }),
        { status: 404 },
      ),
    );

    await expect(
      action.handler({
        ...mockContext,
        input: defaultInput,
      }),
    ).rejects.toThrow(SonarCloudApiError);
  });

  it('should omit visibility from body when not provided', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ project: { key: 'smoke-test', uuid: 'uuid-abc' } }),
        { status: 200 },
      ),
    );

    await action.handler({
      ...mockContext,
      input: defaultInput,
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = new URLSearchParams(init.body as string);
    expect(body.has('visibility')).toBe(false);
  });

  it('should include visibility in body when provided', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ project: { key: 'smoke-test', uuid: 'uuid-abc' } }),
        { status: 200 },
      ),
    );

    await action.handler({
      ...mockContext,
      input: { ...defaultInput, visibility: 'private' as const },
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = new URLSearchParams(init.body as string);
    expect(body.get('visibility')).toBe('private');
  });

  it('should send correct form body params', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ project: { key: 'smoke-test', uuid: 'uuid-abc' } }),
        { status: 200 },
      ),
    );

    await action.handler({
      ...mockContext,
      input: defaultInput,
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = new URLSearchParams(init.body as string);
    expect(body.get('name')).toBe('My Project');
    expect(body.get('organization')).toBe('my-org');
    expect(body.get('project')).toBe('my-proj');
  });
});
