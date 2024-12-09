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

import {
  createQuayRepositoryAction,
  ResponseBody,
  ResponseErrorBody,
} from './createQuayRepository';

describe('quay:create-repository', () => {
  const action = createQuayRepositoryAction();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockContext = createMockActionContext();

  it('should create a quay repository', async () => {
    const body: ResponseBody = {
      name: 'foo',
      kind: 'image',
      namespace: 'bar',
    };
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve(
        new Response(new Blob([JSON.stringify(body)]), {
          status: 200,
        }),
      ),
    );

    await action.handler({
      ...mockContext,
      input: {
        baseUrl: 'http://localhost:9090',
        token: 'TOKEN',
        name: 'foo',
        visibility: 'public',
        description: 'bar',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockContext.output).toHaveBeenCalledWith(
      'repositoryUrl',
      'http://localhost:9090/repository/bar/foo',
    );
  });

  it("should use the default url if it isn't provider", async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve(
        new Response(new Blob(['{}']), {
          status: 200,
        }),
      ),
    );

    await action.handler({
      ...mockContext,
      input: {
        token: 'TOKEN',
        name: 'foo',
        visibility: 'public',
        description: 'bar',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://quay.io/api/v1/repository',
      {
        body: '{"description":"bar","repository":"foo","visibility":"public"}',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer TOKEN',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
  });

  it('should handle and format errors correctly', async () => {
    const body: ResponseErrorBody = {
      detail: 'Repository already exists',
      error_message: 'Repository already exists',
      error_type: 'invalid_request',
      status: 400,
      title: 'invalid_request',
      type: 'https://quay.io/api/v1/error/invalid_request',
    };

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve(
        new Response(new Blob([JSON.stringify(body)]), {
          status: 400,
        }),
      ),
    );

    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: 'TOKEN',
          name: 'foo',
          visibility: 'public',
          description: 'bar',
        },
      });
    }).rejects.toThrow(
      'Failed to create Quay repository, 400 -- Repository already exists',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      input: {
        baseUrl: 'baz',
        token: 'TOKEN',
        name: 'foo',
        visibility: 'public',
        description: 'bar',
      },
      error: '"baseUrl" is invalid',
      name: 'url',
    },
    {
      input: {
        baseUrl: 'http://example.com',
        token: 'TOKEN',
        name: 'foo',
        visibility: 'baz',
        description: 'bar',
      },
      error:
        'For the "visibility" parameter "baz" is not a valid option, available options are: public, private',
      name: 'visibility',
    },
    {
      input: {
        baseUrl: 'http://example.com',
        token: 'TOKEN',
        name: 'foo',
        visibility: 'public',
        description: 'bar',
        repoKind: 'baz',
      },
      error:
        'For the "repository kind" parameter "baz" is not a valid option, available options are: application, image, none',
      name: 'repoKind',
    },
  ])(
    'should throw an error on invalid $name input',
    async ({ input, error }) => {
      await expect(async () => {
        await action.handler({
          ...mockContext,
          input,
        });
      }).rejects.toThrow(error);
    },
  );
});
