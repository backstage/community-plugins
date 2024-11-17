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
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
import { Readable } from 'stream';
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  createGithubGraphqlClient,
  fetchDiscussionDocuments,
} from '@guidanti/backstage-github-discussions-fetcher';
import { type GithubDiscussionsDocument } from '@backstage-community/plugin-github-discussions-common';
import {
  DefaultGithubCredentialsProvider,
  type GithubIntegration,
  ScmIntegrations,
} from '@backstage/integration';
import gh from 'parse-github-url';
import { Duration } from 'luxon';

export const DEFAULT_SCHEDULE = {
  frequency: { minutes: 45 },
  timeout: { minutes: 30 },
  initialDelay: { seconds: 10 },
} as const;

/**
 * Options for {@link GithubDiscussionsCollatorFactory}
 *
 * @public
 */
export interface GithubDiscussionsCollatorFactoryConstructorOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export interface GithubDiscussionsCollatorFactoryOptions {
  logger: LoggerService;
  credentialsProvider: DefaultGithubCredentialsProvider;
  integration: GithubIntegration;
  timeout: number;
  url: string;
  cacheBase?: string;
  clearCacheOnSuccess?: boolean;
  discussionsBatchSize?: number;
  commentsBatchSize?: number;
  repliesBatchSize?: number;
  repo: string;
  org: string;
}

/**
 * Search collator responsible for fetching GitHub discussions to index.
 * @public
 */
export class GithubDiscussionsCollatorFactory
  implements DocumentCollatorFactory
{
  private readonly integration: GithubIntegration;
  private credentialsProvider: DefaultGithubCredentialsProvider;
  private readonly logger: LoggerService;
  public readonly type: string = 'github-discussions';
  private readonly timeout: number;
  private readonly url: string;
  private readonly org: string;
  private readonly repo: string;
  private readonly cacheBase?: string;
  private readonly clearCacheOnSuccess?: boolean;
  private readonly discussionsBatchSize?: number;
  private readonly commentsBatchSize?: number;
  private readonly repliesBatchSize?: number;

  private constructor(options: GithubDiscussionsCollatorFactoryOptions) {
    this.logger = options.logger.child({ documentType: this.type });
    this.credentialsProvider = options.credentialsProvider;
    this.integration = options.integration;
    this.timeout = options.timeout;
    this.url = options.url;
    this.cacheBase = options.cacheBase;
    this.clearCacheOnSuccess = options.clearCacheOnSuccess;
    this.discussionsBatchSize = options.discussionsBatchSize;
    this.commentsBatchSize = options.commentsBatchSize;
    this.repliesBatchSize = options.repliesBatchSize;
    this.org = options.org;
    this.repo = options.repo;
  }

  static async fromConfig({
    logger,
    config,
  }: GithubDiscussionsCollatorFactoryConstructorOptions) {
    const _config = config.getConfig('search.collators.githubDiscussions');
    const schedule = _config.has('schedule')
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          _config.getConfig('schedule'),
        )
      : DEFAULT_SCHEDULE;

    const timeout = Duration.fromObject(schedule.timeout).as('milliseconds');
    const integrations = ScmIntegrations.fromConfig(config);

    const { github: githubIntegration } = integrations;
    const credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(integrations);

    const url = _config.getString('url');

    const ghUrl = gh(url);
    if (!ghUrl) throw new Error(`${url} is not parsable as a Github URL`);
    const { name: repo, owner: org } = ghUrl;

    if (!org) throw new Error(`Missing organization name in ${url}`);
    if (!repo) throw new Error(`Missing repository name in ${url}`);

    const integration = githubIntegration.byUrl(url);
    if (!integration) {
      throw new Error(`Could not retrieve a Github integration for ${url}`);
    }

    const cacheBase = _config.getOptionalString('cacheBase');
    const clearCacheOnSuccess = _config.getOptionalBoolean(
      'clearCacheOnSuccess',
    );
    const discussionsBatchSize = _config.getOptionalNumber(
      'discussionsBatchSize',
    );
    const commentsBatchSize = _config.getOptionalNumber('commentsBatchSize');
    const repliesBatchSize = _config.getOptionalNumber('repliesBatchSize');

    return new GithubDiscussionsCollatorFactory({
      logger,
      credentialsProvider,
      integration: integration,
      timeout,
      repo,
      org,
      url,
      cacheBase,
      clearCacheOnSuccess,
      discussionsBatchSize,
      commentsBatchSize,
      repliesBatchSize,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<GithubDiscussionsDocument> {
    const logger: typeof console = {
      log: this.logger.info.bind(this.logger),
      info: this.logger.info.bind(this.logger),
      error: this.logger.error.bind(this.logger),
      warn: this.logger.warn.bind(this.logger),
      dir: this.logger.info.bind(this.logger),
      debug: this.logger.debug.bind(this.logger),
    } as unknown as typeof console;

    const { token } = await this.credentialsProvider.getCredentials({
      url: this.url,
    });

    const client = createGithubGraphqlClient({
      token,
      endpoint: `${this.integration.config.apiBaseUrl}/graphql`,
    });

    const discussionDocuments = fetchDiscussionDocuments({
      client,
      org: this.org,
      repo: this.repo,
      discussionsBatchSize: this.discussionsBatchSize ?? 100,
      commentsBatchSize: this.commentsBatchSize ?? 100,
      repliesBatchSize: this.repliesBatchSize ?? 100,
      timeout: this.timeout,
      clearCacheOnSuccess: this.clearCacheOnSuccess,
      logger,
      cache: this.cacheBase ? new URL(this.cacheBase) : undefined,
    });

    let count = 0;
    for await (const document of discussionDocuments) {
      yield {
        title: document.title,
        text: document.bodyText,
        location: document.url,
        author: document.author,
        category: document.category,
        labels: document.labels,
        comments: document.comments,
      };
      count++;
    }

    this.logger.info(`Collator indexed ${count} documents`);
  }
}
