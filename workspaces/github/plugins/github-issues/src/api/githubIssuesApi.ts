/*
 * Copyright 2022 The Backstage Authors
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

import { Octokit } from 'octokit';
import { ConfigApi, ErrorApi } from '@backstage/core-plugin-api';
import { createApiRef } from '@backstage/frontend-plugin-api';
import { readGithubIntegrationConfigs } from '@backstage/integration';
import { ForwardedError } from '@backstage/errors';
import { ScmAuthApi } from '@backstage/integration-react';

/** @internal */
export type Repository = {
  name: string;
  locationHostname?: string;
};
/** @internal */
export type Assignee = {
  avatarUrl: string;
  login: string;
};

/** @internal */
export type EdgesWithNodes<T> = {
  edges: Array<{
    node: T;
  }>;
};

/** @internal */
export type IssueAuthor = {
  login: string;
};

/** @internal */
export type Issue = {
  assignees: EdgesWithNodes<Assignee>;
  author: IssueAuthor;
  repository: {
    nameWithOwner: string;
  };
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: {
    totalCount: number;
  };
};

/** @internal */
export type RepoIssues = {
  issues: {
    totalCount: number;
  } & EdgesWithNodes<Issue>;
};

/** @internal */
export type IssuesByRepo = Record<string, RepoIssues>;

/** @internal */
export type GithubIssuesApi = ReturnType<typeof githubIssuesApi>;

/**
 * @public
 */
export interface GithubIssuesFilters {
  assignee?: string;
  createdBy?: string;
  labels?: string[];
  mentioned?: string;
  milestone?: string;
  states?: ('OPEN' | 'CLOSED')[];
}

/**
 * @public
 */
export interface GithubIssuesOrdering {
  field: 'CREATED_AT' | 'UPDATED_AT' | 'COMMENTS';
  direction?: 'ASC' | 'DESC';
}

/**
 * @public
 */
export interface GithubIssuesByRepoOptions {
  filterBy?: GithubIssuesFilters;
  orderBy?: GithubIssuesOrdering;
}

/** @internal */
export const githubIssuesApiRef = createApiRef<GithubIssuesApi>().with({
  id: 'plugin.githubissues.service',
});

// Maximum number of repositories requested in a single GraphQL query. Keeping
// this small avoids GitHub's per-request resource limit (`RESOURCE_LIMITS_EXCEEDED`)
// when an entity owns many repositories.
const REPOS_PER_QUERY = 5;

function chunk<T>(items: Array<T>, size: number): Array<Array<T>> {
  const chunks: Array<Array<T>> = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** @internal */
export const githubIssuesApi = (
  scmAuthApi: ScmAuthApi,
  configApi: ConfigApi,
  errorApi: ErrorApi,
) => {
  const getOctokit = async (hostname?: string) => {
    const configs = readGithubIntegrationConfigs(
      configApi.getOptionalConfigArray('integrations.github') ?? [],
    );

    const githubIntegrationConfig =
      configs.find(v => v.host === hostname) ?? configs[0];

    const host = githubIntegrationConfig?.host;
    const { token } = await scmAuthApi.getCredentials({
      url: `https://${host}/`,
      additionalScope: {
        customScopes: {
          github: ['repo'],
        },
      },
    });

    const baseUrl = githubIntegrationConfig?.apiBaseUrl;
    return { octokit: new Octokit({ auth: token, baseUrl }), host };
  };

  const fetchIssuesByRepoFromGithub = async (
    repos: Array<Repository>,
    itemsPerRepo: number,
    hostname?: string,
    {
      filterBy,
      orderBy = {
        field: 'UPDATED_AT',
        direction: 'DESC',
      },
    }: GithubIssuesByRepoOptions = {},
  ): Promise<IssuesByRepo> => {
    const { octokit, host } = await getOctokit(hostname);
    const safeNames: Array<string> = [];
    const repositories = repos
      // Only fetch issues from repositories hosted on the same GitHub instance
      // as the octokit. Repositories whose host could not be determined (no
      // usable location annotation) are assumed to live on the resolved host,
      // so they are kept rather than silently dropped.
      .filter(repo => !repo.locationHostname || repo.locationHostname === host)
      .map(repo => {
        const [owner, name] = repo.name.split('/');

        const safeNameRegex = /-|\./gi;
        let safeName = name.replace(safeNameRegex, '');

        while (safeNames.includes(safeName)) {
          safeName += 'x';
        }

        safeNames.push(safeName);

        return {
          safeName,
          name,
          owner,
        };
      });

    let issuesByRepo: IssuesByRepo = {};
    if (repositories.length === 0) {
      errorApi.post(
        new ForwardedError(
          'GitHub Issues Plugin failure',
          new Error(`No repositories found for ${host}`),
        ),
      );
    } else {
      // GitHub's GraphQL API enforces a per-request resource/complexity limit.
      // Requesting many repositories (each with nested issue and assignee
      // connections) in a single query can exceed it, in which case GitHub
      // responds with `RESOURCE_LIMITS_EXCEEDED` errors and `null` nodes for
      // every issue. Split the repositories into smaller batches so each
      // request stays within the limit, then merge the results.
      const batches = chunk(repositories, REPOS_PER_QUERY);

      const batchResults = await Promise.all(
        batches.map(async batch => {
          try {
            return (await octokit.graphql(
              createIssueByRepoQuery(batch, itemsPerRepo, {
                filterBy,
                orderBy,
              }),
            )) as IssuesByRepo;
          } catch (e) {
            errorApi.post(
              new ForwardedError('GitHub Issues Plugin failure', e),
            );
            // GitHub may still return partial data for the batch alongside the
            // errors; keep whatever resolved successfully.
            return (e.data ?? {}) as IssuesByRepo;
          }
        }),
      );

      issuesByRepo = Object.assign({}, ...batchResults);
    }

    return repositories.reduce((acc, { safeName, name, owner }) => {
      const repoIssues = issuesByRepo[safeName];
      if (repoIssues) {
        acc[`${owner}/${name}`] = {
          ...repoIssues,
          issues: {
            ...repoIssues.issues,
            totalCount: repoIssues.issues?.totalCount ?? 0,
            // When GitHub responds with partial data alongside errors (e.g.
            // "Resource limits for this query exceeded"), some edges can come
            // back with a `null` node. Drop those here so downstream consumers
            // never read properties off a null node.
            edges: (repoIssues.issues?.edges ?? []).filter(edge => edge?.node),
          },
        };
      }

      return acc;
    }, {} as IssuesByRepo);
  };

  return { fetchIssuesByRepoFromGithub };
};

function formatFilterValue(
  value: GithubIssuesFilters[keyof GithubIssuesFilters],
): string {
  if (Array.isArray(value)) {
    return `[ ${value.map(formatFilterValue).join(', ')}]`;
  }

  return typeof value === 'string' ? `\"${value}\"` : `${value}`;
}

/** @internal */
export function createFilterByClause(filterBy?: GithubIssuesFilters): string {
  if (!filterBy) {
    return '';
  }

  return Object.entries(filterBy)
    .filter(value => value)
    .map(([field, value]) => {
      if (field === 'states') {
        return `${field}: ${value.join(', ')}`;
      }

      return `${field}: ${formatFilterValue(value)}`;
    })
    .join(', ');
}

function createIssueByRepoQuery(
  repositories: Array<{
    safeName: string;
    name: string;
    owner: string;
  }>,
  itemsPerRepo: number,
  { filterBy, orderBy }: GithubIssuesByRepoOptions,
): string {
  const fragment = `
    fragment issues on Repository {
      issues(
        states: OPEN
        first: ${itemsPerRepo}
        filterBy: { ${createFilterByClause(filterBy)} }
        orderBy: { field: ${orderBy?.field}, direction: ${orderBy?.direction} }
      ) {
        totalCount
        edges {
          node {
            assignees(first: 1) {
              edges {
                node {
                  avatarUrl
                  login
                }
              }
            }
            author {
              login
            }
            repository {
              nameWithOwner
            }
            title
            url
            updatedAt
            createdAt
            comments(last: 1) {
              totalCount
            }
          }
        }
      }
    }
  `;

  const query = `
    ${fragment}

    query {
      ${repositories.map(
        ({ safeName, name, owner }) => `
        ${safeName}: repository(name: "${name}", owner: "${owner}") {
          ...issues
        }
      `,
      )}
    }
  `;

  return query;
}
