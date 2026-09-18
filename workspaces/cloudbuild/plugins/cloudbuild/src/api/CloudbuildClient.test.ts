/*
 * Copyright 2026 The Backstage Authors
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

import { OAuthApi } from '@backstage/core-plugin-api';
import { CloudbuildClient } from './CloudbuildClient';

const googleAuthApi = {
  getAccessToken: jest.fn().mockResolvedValue('access-token'),
} as unknown as OAuthApi;

describe('CloudbuildClient', () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty build list when Google omits the builds field', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await expect(
      new CloudbuildClient(googleAuthApi).listWorkflowRuns({
        projectId: 'example-project',
        location: 'global',
        cloudBuildFilter: 'substitutions.REPO_NAME=example',
      }),
    ).resolves.toEqual({ builds: [] });
  });

  it('throws a response error for unsuccessful Google API responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            name: 'Error',
            message: 'Cloud Build API is disabled',
          },
        }),
        {
          status: 403,
          statusText: 'Forbidden',
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    await expect(
      new CloudbuildClient(googleAuthApi).listWorkflowRuns({
        projectId: 'example-project',
        location: 'global',
        cloudBuildFilter: 'substitutions.REPO_NAME=example',
      }),
    ).rejects.toMatchObject({
      name: 'ResponseError',
      statusCode: 403,
    });
  });
});
