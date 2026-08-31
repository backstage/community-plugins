/*
 * Copyright 2025 The Backstage Authors
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

import { IdentityApi, FetchApi } from '@backstage/core-plugin-api';
import { BitbucketApi } from './BitbucketApi';
import {
  pullRequestsResponseStub,
  pullRequestsCloudResponseStub,
} from '../responseStubs';

const discoveryApi = {
  getBaseUrl: async () => 'http://exampleapi.com/bitbucket/api',
};

const identityApi: IdentityApi = {
  getBackstageIdentity: async () => ({
    type: 'user',
    userEntityRef: 'user:default/test-user',
    ownershipEntityRefs: [],
  }),
  getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
  getProfileInfo: jest.fn().mockResolvedValue({}),
  signOut: jest.fn(),
};

const fetchApi: FetchApi = { fetch };

describe('BitbucketApi', () => {
  const serverApi = new BitbucketApi({ discoveryApi, identityApi, fetchApi });

  const cloudApi = new BitbucketApi({
    discoveryApi,
    identityApi,
    fetchApi,
    configApi: {
      getOptionalString: (key: string) =>
        key === 'bitbucket.type' ? 'cloud' : '/bitbucket/api',
      getOptionalStringArray: () => undefined,
    } as any,
  });

  describe('mapServerPullRequests', () => {
    it('maps Server API pull requests to the internal shape', () => {
      const result = serverApi.mapServerPullRequests(
        pullRequestsResponseStub as any,
      );

      expect(result).toHaveLength(pullRequestsResponseStub.values.length);
      expect(result[0]).toMatchObject({
        id: 712,
        title: 'Feature implementation for homepage',
        state: 'OPEN',
        sourceBranch: 'feature-homepage',
      });
    });

    it('returns an empty array when there are no pull requests', () => {
      expect(serverApi.mapServerPullRequests({ values: [] } as any)).toEqual(
        [],
      );
    });
  });

  describe('mapCloudPullRequests', () => {
    it('maps Cloud API pull requests to the internal shape', () => {
      const result = cloudApi.mapCloudPullRequests(
        pullRequestsCloudResponseStub as any,
      );

      expect(result).toHaveLength(pullRequestsCloudResponseStub.values.length);
      expect(result[0]).toMatchObject({
        id: 1,
        title: 'Feature implementation for homepage',
        state: 'OPEN',
        sourceBranch: 'feature-homepage',
      });
    });

    it('falls back to an empty description when summary is missing', () => {
      const [firstPr, ...rest] = pullRequestsCloudResponseStub.values;
      const response = {
        values: [{ ...firstPr, summary: null }, ...rest],
      };

      const [result] = cloudApi.mapCloudPullRequests(response as any);
      expect(result.description).toBe('');
    });
  });

  describe('fetchPullRequestListForRepo', () => {
    it('caps pagelen at the API limit of 50 even if a higher limit is requested', async () => {
      const fetchSpy = jest
        .spyOn(fetchApi, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ values: [] })));

      await cloudApi.fetchPullRequestListForRepo(
        'myworkspace',
        'example-project',
        undefined,
        100,
      );

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain('pagelen=50');

      fetchSpy.mockRestore();
    });
  });
});
