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
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  createQueue,
  type Operation,
  run,
  spawn,
  suspend,
  useScope,
} from 'effection';
import {
  createGithubGraphqlClient,
  fetchGithubDiscussions,
  type GithubDiscussionFetcherResult,
  toAsyncIterable,
} from 'github-discussions-fetcher';
import { type GithubDiscussionsDocument } from '@backstage-community/plugin-github-discussions-common';
import {
  type DefaultGithubCredentialsProvider,
  type GithubIntegration,
  ScmIntegrationsGroup,
} from '@backstage/integration';
import assert from 'assert-ts';
import gh from 'parse-github-url';

interface GithubDiscussionsCollatorFactoryConstructorOptions {
  config: RootConfigService;
  logger: LoggerService;
  credentialsProvider: DefaultGithubCredentialsProvider;
  githubIntegration: ScmIntegrationsGroup<GithubIntegration>;
}

export interface GithubDiscussionsCollatorFactoryOptions {
  logger: LoggerService;
  config: RootConfigService;
  credentialsProvider: DefaultGithubCredentialsProvider;
  githubIntegration: ScmIntegrationsGroup<GithubIntegration>;
}

export class GithubDiscussionsCollatorFactory
  implements DocumentCollatorFactory
{
  private readonly config: RootConfigService;
  private readonly githubIntegration: ScmIntegrationsGroup<GithubIntegration>;
  private credentialsProvider: DefaultGithubCredentialsProvider;
  private readonly logger: LoggerService;
  public readonly type: string = 'github-discussions';

  private constructor(options: GithubDiscussionsCollatorFactoryOptions) {
    this.logger = options.logger.child({ documentType: this.type });
    this.config = options.config;
    this.credentialsProvider = options.credentialsProvider;
    this.githubIntegration = options.githubIntegration;
  }

  static fromConfig({
    config,
    logger,
    credentialsProvider,
    githubIntegration,
  }: GithubDiscussionsCollatorFactoryConstructorOptions) {
    return new GithubDiscussionsCollatorFactory({
      logger,
      credentialsProvider,
      config,
      githubIntegration,
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
    } as unknown as typeof console;

    const url = gh(this.config.getString('githubDiscussions.url'));
    assert(url !== null, `Not parsable as a Github URL`);
    const { name: repo, owner: org } = url;
    assert(org !== null, `Discussions url is missing organization name`);
    assert(repo !== null, `Discussion url is missing repository`);

    const integration = this.githubIntegration.byUrl(url.href);

    assert(integration, `Could not retrieve a Github integration for ${url}`);

    const { token } = await this.credentialsProvider.getCredentials({
      url: url.href,
    });

    const client = createGithubGraphqlClient({
      token,
      endpoint: `${integration?.config.apiBaseUrl}/graphql`,
    });

    let documents: AsyncIterable<GithubDiscussionFetcherResult> | undefined;

    const task = run(function* injection(): Operation<void> {
      const scope = yield* useScope();
      const results = createQueue<GithubDiscussionFetcherResult, void>();

      yield* spawn(function* () {
        try {
          yield* fetchGithubDiscussions({
            client,
            org,
            repo,
            discussionsBatchSize: 70,
            commentsBatchSize: 70,
            repliesBatchSize: 70,
            logger,
            results,
          });
        } catch (e) {
          logger.error(
            `Encountered an error while ingesting GitHub Discussions`,
            e,
          );
        }
        results.close();
      });

      documents = toAsyncIterable(results, scope);

      yield* suspend();
    });

    if (documents) {
      for await (const document of documents) {
        yield {
          title: document.title,
          text: document.bodyText,
          location: document.url,
          author: document.author,
          category: document.category,
          labels: document.labels,
          comments: document.comments,
        };
      }
      await task.halt();
    } else {
      logger.error(`Documents were not available when iteration started`);
    }
  }
}
