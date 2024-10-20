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
import { run, useScope, type Operation, createQueue, spawn } from 'effection';
import {
  fetchGithubDiscussions,
  toAsyncIterable,
  type GithubDiscussionFetcherResult,
  createGithubGraphqlClient,
} from 'github-discussions-fetcher';
import { type GithubDiscussionsDocument } from '@backstage-community/plugin-github-discussions-common';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import assert from 'assert-ts';
import gh from 'parse-github-url';

type GithubDiscussionsCollatorFactoryConstructorOptions = {
  config: RootConfigService;
  logger: LoggerService;
};

export type GithubDiscussionsCollatorFactoryOptions = {
  logger: LoggerService;
  config: RootConfigService;
  credentialsProvider: DefaultGithubCredentialsProvider;
  integrations: ScmIntegrations;
};

export class GithubDiscussionsCollatorFactory
  implements DocumentCollatorFactory
{
  private readonly config: RootConfigService;
  private readonly integrations: ScmIntegrations;
  private readonly logger: LoggerService;
  private credentialsProvider: DefaultGithubCredentialsProvider;
  public readonly type: string = 'github-discussions';

  private constructor(options: GithubDiscussionsCollatorFactoryOptions) {
    this.logger = options.logger.child({ documentType: this.type });
    this.config = options.config;
    this.credentialsProvider = options.credentialsProvider;
    this.integrations = options.integrations;
  }

  static fromConfig({
    config,
    logger,
  }: GithubDiscussionsCollatorFactoryConstructorOptions) {
    const integrations = ScmIntegrations.fromConfig(config);
    const credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(integrations);
    return new GithubDiscussionsCollatorFactory({
      logger,
      credentialsProvider,
      config,
      integrations,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<GithubDiscussionsDocument> {
    const logger: typeof console = this.logger as unknown as typeof console;

    const url = gh(this.config.getString('githubDiscussions.url'));
    assert(url !== null, `Not parsable as a Github URL`);
    const { name: repo, owner: org } = url;
    assert(org !== null, `Discussions url is missing organization name`);
    assert(repo !== null, `Discussion url is missing repository`);

    const github = this.integrations.github;

    const integration = github.byUrl(url.href);

    assert(integration, `Could not retrieve a Github integration for ${url}`);

    const { token } = await this.credentialsProvider.getCredentials({
      url: url.href,
    });

    const client = createGithubGraphqlClient({
      token,
      endpoint: `${integration?.config.apiBaseUrl}/graphql`,
    });

    const documents = await run(function* injection(): Operation<
      AsyncIterable<GithubDiscussionFetcherResult>
    > {
      const scope = yield* useScope();
      const results = createQueue<GithubDiscussionFetcherResult, void>();

      yield* spawn(function* () {
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
        results.close();
      });

      return toAsyncIterable(results, scope);
    });

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
  }
}
