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
import { mockServices } from '@backstage/backend-test-utils';
import {
  ScmIntegrations,
  DefaultGithubCredentialsProvider,
} from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { GithubDiscussionsCollatorFactory } from './GithubDiscussionsCollatorFactory';

const logger = mockServices.logger.mock();
const timeout = 60_000;
const url = '';
const integrations = ScmIntegrations.fromConfig(
  new ConfigReader({
    integrations: {
      github: [
        {
          host: 'github.com',
          apps: [
            {
              appId: 1,
              privateKey: 'PRIVATE_KEY',
              webhookSecret: 'WEBHOOK_SECRET',
              clientId: 'CLIENT_ID',
              clientSecret: 'CLIENT_SECRET',
            },
          ],
        },
      ],
    },
  }),
);
const credentialsProvider =
  DefaultGithubCredentialsProvider.fromIntegrations(integrations);
const options = {
  logger,
  credentialsProvider,
  githubIntegration: integrations.github,
  timeout,
  url,
};

describe('GithubDiscussionsCollatorFactory', () => {
  it('has expected type', () => {
    const factory = GithubDiscussionsCollatorFactory.fromConfig(options);
    expect(factory.type).toBe('github-discussions');
  });
});
