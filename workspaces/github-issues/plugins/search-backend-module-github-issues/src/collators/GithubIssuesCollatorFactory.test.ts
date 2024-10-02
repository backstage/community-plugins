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
import {
  mockServices,
  registerMswTestHooks,
} from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import fetchMock from 'fetch-mock';
import { setupServer } from 'msw/node';
import { Readable } from 'stream';
import { GithubIssuesCollatorFactory } from './GithubIssuesCollatorFactory';
import { Discussion, Issue } from '@octokit/graphql-schema';

const logger = mockServices.logger.mock();

describe('GithubIssuesCollatorFactory', () => {
  const config = new ConfigReader({
    integrations: {
      github: [
        {
          host: 'github.com',
          enabled: true,
          apps: [
            {
              appId: '1234',
              allowedInstallationOwners: ['my-org'],
              clientId: 'clientid',
              clientSecret: 'clientsecret',
              webhookSecret: 'webhooksecret',
              privateKey: '-----BEGIN-----\n...',
            },
          ],
        },
      ],
    },
    search: {
      collators: {
        github: {
          org: 'my-org',
          host: 'github.com',
          query: 'is:issue is:open org:my-org',
        },
      },
    },
  });

  const mockGetCredentials = jest.fn().mockReturnValue({
    headers: { token: 'blah' },
    type: 'app',
  });

  const githubCredentialsProvider = {
    getCredentials: mockGetCredentials,
  };

  const options = {
    logger,
    githubCredentialsProvider,
  };

  it('has expected type', () => {
    const factory = GithubIssuesCollatorFactory.fromConfig(config, options);
    expect(factory.type).toBe('github');
  });

  describe('getCollator', () => {
    let factory: GithubIssuesCollatorFactory;
    let collator: Readable;

    const worker = setupServer();
    registerMswTestHooks(worker);

    beforeEach(async () => {
      factory = GithubIssuesCollatorFactory.fromConfig(config, options);
      collator = await factory.getCollator();
    });

    it('returns a readable stream', () => {
      expect(collator).toBeInstanceOf(Readable);
    });

    it('indexes issues', async () => {
      fetchMock.post('https://api.github.com/graphql', () => {
        return {
          data: {
            search: {
              pageInfo: {
                hasNextPage: false,
                endCursor: 'dummy',
              },
              edges: [
                {
                  node: {
                    createdAt: '2024-10-02T18:25:06Z',
                    title: 'Issue Title',
                    url: 'https://github.com/my-org/repo/issues/1',
                    author: {
                      login: 'author',
                    },
                    labels: {
                      nodes: [
                        {
                          name: 'bug',
                        },
                      ],
                    },
                    repository: {
                      name: 'repo',
                    },
                  },
                },
              ],
            },
          },
        };
      });

      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = (await pipeline.execute()) as unknown as {
        documents: Issue[] | Discussion[];
      };
      expect(documents).toHaveLength(1);
      expect(documents[0].title).toBe('Issue Title');
      expect(documents[0].url).toBe('https://github.com/my-org/repo/issues/1');
      expect(documents[0].author).toBe('author');
      expect(documents[0].labels).toEqual(['bug']);
      expect(documents[0].repository).toBe('repo');
    });
  });
});
