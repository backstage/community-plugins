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

import {
  ConfigApi,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import { Edge, TagsResponse } from '../types';
import { JfrogArtifactoryApiClient } from './index';

const edge = (name: string) => ({ node: { name } } as Edge);

const page = (
  names: string[],
  hasNextPage: boolean,
  endCursor: string | null,
): TagsResponse => ({
  data: {
    versions: {
      edges: names.map(edge),
      pageInfo: { hasNextPage, endCursor },
    },
  },
});

describe('JfrogArtifactoryApiClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('paginates through the API up to the configured page limit', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            page(
              Array.from({ length: 200 }, (_, index) => `tag-${index}`),
              true,
              'cursor-1',
            ),
          ),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            page(
              Array.from({ length: 200 }, (_, index) => `tag-${index + 200}`),
              true,
              'cursor-2',
            ),
          ),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            page(
              Array.from({ length: 50 }, (_, index) => `tag-${index + 400}`),
              false,
              null,
            ),
          ),
        ),
      );
    const client = new JfrogArtifactoryApiClient({
      discoveryApi: {
        getBaseUrl: jest
          .fn()
          .mockResolvedValue('https://backstage.example/api/proxy'),
      } as unknown as DiscoveryApi,
      configApi: {
        getOptionalString: jest.fn(),
        getOptionalNumber: jest.fn().mockReturnValue(450),
      } as unknown as ConfigApi,
      identityApi: {
        getCredentials: jest.fn().mockResolvedValue({ token: 'token' }),
      } as unknown as IdentityApi,
    });

    const response = await client.getTags('example/image');

    expect(response.data.versions.edges).toHaveLength(450);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const variables = fetchMock.mock.calls.map(call =>
      JSON.parse(call[1]?.body as string),
    );
    expect(variables.map(body => body.variables.first)).toEqual([200, 200, 50]);
    expect(variables.map(body => body.variables.after)).toEqual([
      undefined,
      'cursor-1',
      'cursor-2',
    ]);
  });
});
