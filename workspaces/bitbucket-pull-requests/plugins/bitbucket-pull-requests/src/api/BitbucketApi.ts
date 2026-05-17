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

import {
  createApiRef,
  DiscoveryApi,
  IdentityApi,
  ConfigApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';

export const bitbucketApiRef = createApiRef<BitbucketApi>({
  id: 'plugin.bitbucket.service',
});

export type User = {
  displayName: string;
  slug: string;
};

export type BuildStatus = {
  cancelled: number;
  failed: number;
  inProgress: number;
  successful: number;
  unknown: number;
};

export type PullRequest = {
  id: number;
  title: string;
  author: User;
  createdDate: number;
  updatedDate: number;
  state: string;
  description: string;
  url: string;
  repoUrl: string;
  fromRepo: string;
  fromProject: string;
  sourceBranch: string;
  targetBranch: string;
  latestCommit?: string;
  buildStatus?: 'SUCCESSFUL' | 'FAILED' | 'INPROGRESS' | 'STOPPED' | 'UNKNOWN';
  reviewers: User[];
};
const DEFAULT_PROXY_PATH = '/bitbucket/api';
const DEFAULT_LIMIT = 50;
type Options = {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
  configApi?: ConfigApi;
  fetchApi: FetchApi;
};
type PullRequestRole = 'REVIEWER' | 'AUTHOR';
type PullRequestState = 'OPEN' | 'MERGED' | 'DECLINED' | 'ALL';
type PullRequestOptions = { includeBuildStatus?: boolean };

interface BitbucketClient {
  fetchPullRequestListForRepo(
    project: string,
    repo: string,
    state?: string,
    limit?: number,
  ): Promise<PullRequest[]>;

  fetchUserPullRequests(
    role: PullRequestRole,
    state: PullRequestState,
    limit: number,
    options: PullRequestOptions,
  ): Promise<PullRequest[]>;
}

function mapServerPullRequests(data: any): PullRequest[] {
  return (
    data.values?.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      author: {
        displayName: pr.author.user.displayName,
        slug: pr.author.user.slug,
      },
      createdDate: pr.createdDate,
      updatedDate: pr.updatedDate,
      state: pr.state,
      url: pr.links.self[0].href,
      repoUrl: pr.fromRef.repository.links.self[0].href,
      description: pr.description || '',
      fromRepo: pr.fromRef.repository.name,
      fromProject: pr.fromRef.repository.project.key,
      sourceBranch: pr.fromRef.displayId,
      targetBranch: pr.toRef.displayId,
      latestCommit: pr.fromRef.latestCommit,
      reviewers:
        pr.reviewers?.map((r: any) => ({
          displayName: r.user.displayName,
          slug: r.user.slug,
        })) || [],
    })) || []
  );
}

function mapCloudPullRequests(data: any): PullRequest[] {
  return (
    data.values?.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      author: {
        displayName: pr.author.display_name,
        slug: pr.author.nickname || pr.author.username,
      },
      createdDate: new Date(pr.created_on).getTime(),
      updatedDate: new Date(pr.updated_on).getTime(),
      state: pr.state,
      url: pr.links.html.href,
      repoUrl: pr.source.repository.links.html.href,
      description: pr.summary?.raw || '',
      fromRepo: pr.source.repository.name,
      fromProject: pr.source.repository.workspace?.slug || '',
      sourceBranch: pr.source.branch.name,
      targetBranch: pr.destination.branch.name,
      latestCommit: pr.source.commit?.hash,
      reviewers:
        pr.reviewers?.map((r: any) => ({
          displayName: r.display_name,
          slug: r.nickname || r.username,
        })) || [],
    })) || []
  );
}

function determineBuildState(
  status: BuildStatus,
): 'SUCCESSFUL' | 'FAILED' | 'INPROGRESS' | 'STOPPED' | undefined {
  if (status.failed > 0) return 'FAILED';
  if (status.inProgress > 0) return 'INPROGRESS';
  if (status.cancelled > 0) return 'STOPPED';
  if (status.successful > 0) return 'SUCCESSFUL';
  return undefined;
}

abstract class BaseBitbucketClient implements BitbucketClient {
  constructor(
    protected readonly discoveryApi: DiscoveryApi,
    protected readonly identityApi: IdentityApi,
    protected readonly fetchApi: FetchApi,
    protected readonly proxyPath: string,
  ) {}

  abstract fetchPullRequestListForRepo(
    project: string,
    repo: string,
    state?: string,
    limit?: number,
  ): Promise<PullRequest[]>;

  abstract fetchUserPullRequests(
    role: PullRequestRole,
    state: PullRequestState,
    limit: number,
    options: PullRequestOptions,
  ): Promise<PullRequest[]>;

  protected async getProxyUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('proxy');
  }
}

class BitbucketServerClient extends BaseBitbucketClient {
  private async fetchBuildStatus(commitId: string): Promise<BuildStatus> {
    const proxyUrl = await this.getProxyUrl();
    const response = await this.fetchApi.fetch(
      `${proxyUrl}${this.proxyPath}/rest/build-status/latest/commits/stats/${commitId}`,
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch build status for commit ${commitId}`);
    }

    return response.json();
  }

  private async enhancePrWithBuildStatus(
    pr: PullRequest,
  ): Promise<PullRequest> {
    if (pr.latestCommit) {
      return this.fetchBuildStatus(pr.latestCommit)
        .then(buildStatus => ({
          ...pr,
          buildStatus: determineBuildState(buildStatus),
        }))
        .catch(() => ({
          ...pr,
          buildStatus: 'UNKNOWN' as const,
        }));
    }
    return pr;
  }

  async fetchPullRequestListForRepo(
    project: string,
    repo: string,
    state?: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<PullRequest[]> {
    const proxyUrl = await this.getProxyUrl();
    const url = new URL(
      `${proxyUrl}${this.proxyPath}/projects/${project}/repos/${repo}/pull-requests`,
    );

    const params = new URLSearchParams();
    if (state) {
      params.append('state', state);
    }
    params.append('limit', limit.toString());

    const response = await this.fetchApi.fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pull requests');
    }

    const data = await response.json();
    return mapServerPullRequests(data);
  }

  async fetchUserPullRequests(
    role: PullRequestRole,
    state: PullRequestState,
    limit: number,
    options: PullRequestOptions,
  ): Promise<PullRequest[]> {
    const { userEntityRef } = await this.identityApi.getBackstageIdentity();
    const { name } = parseEntityRef(userEntityRef);

    if (!name) {
      throw new Error('User not found');
    }

    const proxyUrl = await this.getProxyUrl();
    const url = new URL(`${proxyUrl}${this.proxyPath}/dashboard/pull-requests`);

    const params = new URLSearchParams({
      order: 'participant_status',
      limit: limit.toString(),
      state,
      role,
      user: name,
    });

    const response = await this.fetchApi.fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch pull requests from Bitbucket Server';

      try {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText);

        if (
          response.status === 404 &&
          errorJson.errors?.[0]?.message?.includes('does not exist')
        ) {
          errorMessage = `User '${name}' not found in Bitbucket Server. Please ensure your Bitbucket account exists.`;
        }
      } catch (e) {
        errorMessage = e instanceof Error ? e.message : String(e);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    const pullRequests = mapServerPullRequests(data);
    if (options.includeBuildStatus) {
      const enhancedPullRequests = await Promise.all(
        pullRequests.map(pr => this.enhancePrWithBuildStatus(pr)),
      );
      return enhancedPullRequests;
    }

    return pullRequests;
  }
}

class BitbucketCloudClient extends BaseBitbucketClient {
  constructor(
    discoveryApi: DiscoveryApi,
    identityApi: IdentityApi,
    fetchApi: FetchApi,
    proxyPath: string,
    private readonly cloudWorkspaces: string[],
  ) {
    super(discoveryApi, identityApi, fetchApi, proxyPath);
  }

  private async fetchWorkspaceRepositories(
    workspace: string,
  ): Promise<string[]> {
    const proxyUrl = await this.getProxyUrl();
    const repos: string[] = [];
    let nextUrl:
      | string
      | undefined = `${proxyUrl}${this.proxyPath}/2.0/repositories/${workspace}?pagelen=100`;

    while (nextUrl) {
      const response: Response = await this.fetchApi.fetch(nextUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch repositories for workspace '${workspace}'`,
        );
      }

      const data: any = await response.json();
      const pageRepos = (data.values || [])
        .map((repo: any) => repo.slug)
        .filter((slug: any) => typeof slug === 'string');
      repos.push(...pageRepos);
      nextUrl = data.next;
    }

    return repos;
  }

  private async fetchRepoPullRequests(
    workspace: string,
    repo: string,
    states: string[],
    pageLen: number,
  ): Promise<PullRequest[]> {
    const proxyUrl = await this.getProxyUrl();
    const url = new URL(
      `${proxyUrl}${this.proxyPath}/2.0/repositories/${workspace}/${repo}/pullrequests`,
    );

    const params = new URLSearchParams();
    states.forEach(s => params.append('state', s));
    params.append('pagelen', pageLen.toString());

    const response = await this.fetchApi.fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pull requests from Bitbucket Cloud repo '${workspace}/${repo}'`,
      );
    }

    const data = await response.json();
    return mapCloudPullRequests(data);
  }

  async fetchPullRequestListForRepo(
    workspace: string,
    repo: string,
    state?: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<PullRequest[]> {
    const proxyUrl = await this.getProxyUrl();
    const url = new URL(
      `${proxyUrl}${this.proxyPath}/2.0/repositories/${workspace}/${repo}/pullrequests`,
    );

    const params = new URLSearchParams();
    if (state) {
      // Cloud uses different state values: OPEN, MERGED, DECLINED, SUPERSEDED
      params.append('state', state);
    }
    params.append('pagelen', limit.toString());

    const response = await this.fetchApi.fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pull requests from Bitbucket Cloud');
    }

    const data = await response.json();
    return mapCloudPullRequests(data);
  }

  async fetchUserPullRequests(
    role: PullRequestRole,
    state: PullRequestState,
    limit: number,
    _options: PullRequestOptions,
  ): Promise<PullRequest[]> {
    if (this.cloudWorkspaces.length === 0) {
      throw new Error(
        "Bitbucket Cloud user pull requests require configured workspaces. Set 'bitbucket.cloudWorkspaces' in app-config.",
      );
    }

    const { userEntityRef } = await this.identityApi.getBackstageIdentity();
    const { name } = parseEntityRef(userEntityRef);

    if (!name) {
      throw new Error('User not found');
    }

    const states =
      state === 'ALL' ? ['OPEN', 'MERGED', 'DECLINED', 'SUPERSEDED'] : [state];

    const allPullRequests: PullRequest[] = [];
    for (const workspace of this.cloudWorkspaces) {
      const repos = await this.fetchWorkspaceRepositories(workspace);
      for (const repo of repos) {
        const repoPullRequests = await this.fetchRepoPullRequests(
          workspace,
          repo,
          states,
          Math.min(limit, DEFAULT_LIMIT),
        );
        allPullRequests.push(...repoPullRequests);
      }
    }

    let pullRequests = allPullRequests;

    // Cloud API returns all PRs for the user, so we filter by role client-side.
    if (role === 'AUTHOR') {
      pullRequests = pullRequests.filter(pr => pr.author.slug === name);
    } else if (role === 'REVIEWER') {
      pullRequests = pullRequests.filter(pr =>
        pr.reviewers.some(reviewer => reviewer.slug === name),
      );
    }

    return pullRequests.slice(0, limit);
  }
}

export class BitbucketApi {
  private readonly client: BitbucketClient;

  constructor(options: Options) {
    const isCloud =
      options.configApi?.getOptionalString('bitbucket.type') === 'cloud';
    const proxyPath =
      options.configApi?.getOptionalString('bitbucket.proxyPath') ||
      DEFAULT_PROXY_PATH;
    const cloudWorkspaces =
      options.configApi?.getOptionalStringArray('bitbucket.cloudWorkspaces') ||
      [];

    this.client = isCloud
      ? new BitbucketCloudClient(
          options.discoveryApi,
          options.identityApi,
          options.fetchApi,
          proxyPath,
          cloudWorkspaces,
        )
      : new BitbucketServerClient(
          options.discoveryApi,
          options.identityApi,
          options.fetchApi,
          proxyPath,
        );
  }

  async fetchPullRequestListForRepo(
    project: string,
    repo: string,
    state?: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<PullRequest[]> {
    return this.client.fetchPullRequestListForRepo(project, repo, state, limit);
  }

  async fetchUserPullRequests(
    role: PullRequestRole = 'REVIEWER',
    state: PullRequestState = 'OPEN',
    limit: number = DEFAULT_LIMIT,
    options: PullRequestOptions = { includeBuildStatus: true },
  ): Promise<PullRequest[]> {
    return this.client.fetchUserPullRequests(role, state, limit, options);
  }

  public mapServerPullRequests(data: any): PullRequest[] {
    return mapServerPullRequests(data);
  }

  public mapCloudPullRequests(data: any): PullRequest[] {
    return mapCloudPullRequests(data);
  }
}
