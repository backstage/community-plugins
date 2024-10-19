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

import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  DefaultGithubCredentialsProvider,
  GithubCredentialsProvider,
  ScmIntegrationRegistry,
  ScmIntegrations,
} from '@backstage/integration';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { graphql } from '@octokit/graphql';
import { Discussion, Issue, Query } from '@octokit/graphql-schema';
import { Readable } from 'stream';

/**
 * Extended IndexableDocument with GitHub specific properties
 *
 * @public
 */
export interface GithubIssuesDocument extends IndexableDocument {
  title: string;
  createdAt: string;
  url: string;
  repository: {
    name: string;
  };
  author: string;
  labels: string[];
}

export type GithubIssuesCollatorFactoryOptions = {
  logger: LoggerService;
  config: RootConfigService;
  githubCredentialsProvider: GithubCredentialsProvider;
  integrations: ScmIntegrationRegistry;
};

type GraphQL = typeof graphql;

/**
 * Search collator responsible for collecting GitHub issues and discussions to index.
 *
 * @public
 */
export class GithubIssuesCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'github';

  private readonly logger: LoggerService;
  private readonly config: Config;

  private readonly integrations: ScmIntegrationRegistry;
  private readonly githubCredentialsProvider: GithubCredentialsProvider;

  constructor(options: GithubIssuesCollatorFactoryOptions) {
    this.integrations = options.integrations;
    this.githubCredentialsProvider = options.githubCredentialsProvider;
    this.logger = options.logger;
    this.config = options.config;
  }

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      githubCredentialsProvider?: GithubCredentialsProvider;
    },
  ) {
    const integrations = ScmIntegrations.fromConfig(config);

    return new GithubIssuesCollatorFactory({
      config: config,
      logger: options.logger,
      githubCredentialsProvider:
        options.githubCredentialsProvider ||
        DefaultGithubCredentialsProvider.fromIntegrations(integrations),
      integrations,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<GithubIssuesDocument> {
    this.logger.info('Stsarting collation of GitHub issues.');

    const { client } = await this.createClient();
    const { nodes: documents } = await this.fetchGithubIssuesDocuments(client);
    for (const document of documents) {
      if (!document.title || !document.url) {
        continue;
      }
      if (!document.author || !document.repository) {
        this.logger.warn('Document missing author or repository information');
        continue;
      }
      const labels =
        document.labels?.nodes
          ?.map(label => label?.name)
          .filter(
            (name): name is string => name !== undefined && name !== null,
          ) ?? [];

      yield {
        ...document,
        text: document.title,
        location: document.url,
        author: document.author.login,
        labels,
      };
    }

    this.logger.info('Finished collation of GitHub issues.');
  }

  private async fetchGithubIssuesDocuments(client: GraphQL): Promise<{
    nodes: Issue[] | Discussion[];
    hasNextPage: boolean;
    endCursor: string | null;
  }> {
    const queryString = `
  query ($first: Int!, $after: String, $q: String!) {
    search(first: $first, type: ISSUE, after: $after, query: $q) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ... on Issue {
            createdAt
            title
            url
            author {
              login
            }
            labels(first: 100) {
              nodes {
                name
              }
            }
            repository {
              name
            }
          }
        }
      }
    }
  }
        `;

    // todo: type the response
    let nodes: any[] = [];
    let endCursor: string | null = null;
    const searchQuery = this.config.getString('search.collators.github.query');

    const variables = {
      first: 100,
      after: endCursor,
      q: searchQuery,
    };

    const { search } = (await client(queryString, variables)) as Query;
    const { edges, pageInfo } = search;

    if (!edges || !pageInfo) {
      this.logger.warn(
        'No edges or pageInfo found in the GitHub search query response',
      );
      return { nodes, hasNextPage: false, endCursor: null };
    }

    nodes = nodes.concat(edges.map(edge => edge && edge.node));
    const hasNextPage = pageInfo.hasNextPage ?? false;
    endCursor = pageInfo.endCursor ?? null;

    return { nodes, hasNextPage, endCursor };
  }

  private async createClient(): Promise<{ client: GraphQL }> {
    const host = this.config.getString('search.collators.github.host');
    const org = this.config.getString('search.collators.github.org');

    if (!host) {
      throw new Error('The host configuration is missing from the config.');
    }

    const githubConfig = this.integrations.github.byHost(host)?.config;

    if (!githubConfig) {
      throw new Error(
        `GitHub configuration for host "${host}" is missing or incomplete.`,
      );
    }

    const apiBaseUrl = githubConfig.apiBaseUrl ?? 'https://api.github.com';

    const credentials = await this.githubCredentialsProvider.getCredentials({
      url: `https://github.com/${encodeURIComponent(org)}/`,
    });

    if (!credentials.headers) {
      throw new Error('Failed to retrieve credentials headers.');
    }

    const client = graphql.defaults({
      baseUrl: apiBaseUrl,
      headers: credentials.headers,
    });

    return { client };
  }
}
