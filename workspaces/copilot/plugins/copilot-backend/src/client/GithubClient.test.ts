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

import { GithubClient } from './GithubClient';
import { mockServices } from '@backstage/backend-test-utils';
import { Octokit } from '@octokit/rest';

// Mock Octokit
jest.mock('@octokit/rest');

const MockedOctokit = Octokit as jest.MockedClass<typeof Octokit>;

describe('GithubClient', () => {
  let githubClient: GithubClient;
  let mockOctokit: jest.Mocked<Octokit>;
  let mockConfig: any;

  const mockCopilotConfig = {
    host: 'github.com',
    apiBaseUrl: 'https://api.github.com',
    organization: 'test-org',
    enterprise: 'test-enterprise',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = mockServices.rootConfig({
      data: {
        copilot: mockCopilotConfig,
        integrations: {
          github: [
            {
              host: 'github.com',
              token: 'test-token',
            },
          ],
        },
      },
    });

    mockOctokit = {
      graphql: jest.fn(),
      request: jest.fn(),
      paginate: jest.fn(),
      copilot: {
        listCopilotSeats: jest.fn(),
      },
    } as any;

    MockedOctokit.mockImplementation(() => mockOctokit);

    githubClient = new GithubClient(mockCopilotConfig, mockConfig);
  });

  describe('fetchOrganizationTeams', () => {
    it('should filter out teams with less than 5 members', async () => {
      const mockGraphQLResponse = {
        organization: {
          teams: {
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
            nodes: [
              {
                id: 'team1-graphql-id',
                databaseId: 1,
                slug: 'team-1',
                name: 'Team 1',
                members: {
                  totalCount: 1,
                },
              },
              {
                id: 'team2-graphql-id',
                databaseId: 2,
                slug: 'team-2',
                name: 'Team 2',
                members: {
                  totalCount: 4,
                },
              },
            ],
          },
        },
      };

      mockOctokit.graphql.mockResolvedValueOnce(mockGraphQLResponse);

      const result = await githubClient.fetchOrganizationTeams();

      expect(result).toEqual([]);
    });
  });

  describe('fetchEnterpriseTeams', () => {
    it('should fetch enterprise teams with 5 or more members using GraphQL', async () => {
      const mockGraphQLResponse = {
        enterprise: {
          organizations: {
            nodes: [
              {
                teams: {
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: null,
                  },
                  nodes: [
                    {
                      id: 'team1-graphql-id',
                      databaseId: 1,
                      slug: 'enterprise-team-1',
                      name: 'Enterprise Team 1',
                      members: {
                        totalCount: 7,
                      },
                    },
                    {
                      id: 'team2-graphql-id',
                      databaseId: 2,
                      slug: 'enterprise-team-2',
                      name: 'Enterprise Team 2',
                      members: {
                        totalCount: 2, // Should be filtered out
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      };

      mockOctokit.graphql.mockResolvedValueOnce(mockGraphQLResponse);

      const result = await githubClient.fetchEnterpriseTeams();

      expect(result).toEqual([
        {
          id: 1,
          slug: 'enterprise-team-1',
          name: 'Enterprise Team 1',
        },
      ]);
    });
  });
});
