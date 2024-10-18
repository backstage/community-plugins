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
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface GithubDiscussionsDocument extends IndexableDocument {
  author: string;
  category: string;
  labels: {
    name: string;
    color: string;
  }[];
  comments: {
    author: string;
    bodyText: string;
    replies: {
      author: string;
      bodyText: string;
    }[];
  }[];
}

export type GithubDiscussionsCollatorFactoryOptions = {
  logger: LoggerService;
};

export class GithubDiscussionsCollatorFactory
  implements DocumentCollatorFactory
{
  private readonly logger: LoggerService;
  public readonly type: string = 'github-discussions';

  private constructor(options: GithubDiscussionsCollatorFactoryOptions) {
    this.logger = options.logger.child({ documentType: this.type });
  }

  static fromConfig(
    config: Config,
    options: GithubDiscussionsCollatorFactoryOptions,
  ) {
    console.log(config);
    return new GithubDiscussionsCollatorFactory({
      ...options,
    });
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  async *execute(): AsyncGenerator<GithubDiscussionsDocument> {
    yield {
      title: 'announcement-example',
      text: 'this is an announcement',
      location: 'https://github.com/guidanti/github-discussions-fetcher',
      author: 'taras',
      category: 'announcements', // double check category string values
      labels: [
        {
          name: 'foo',
          color: 'red',
        },
      ],
      comments: [],
    };
    yield {
      title: 'poll-example',
      text: 'this is a poll',
      location: 'https://github.com/guidanti/community-plugins',
      author: 'minkimcello',
      category: 'poll', // double check category string values
      labels: [
        {
          name: 'bar',
          color: 'blue',
        },
      ],
      comments: [],
    };
  }
}
