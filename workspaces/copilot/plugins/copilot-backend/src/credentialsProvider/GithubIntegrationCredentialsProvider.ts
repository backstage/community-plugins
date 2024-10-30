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

import { Config } from '@backstage/config';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import { CopilotCredentialsProvider, GithubInfo } from './credentialsProvider';

/**
 * A credentials provider that retrieves GitHub credentials from the backstage integrations.
 *
 * @public
 */
export class GithubIntegrationCredentialsProvider
  implements CopilotCredentialsProvider
{
  private readonly host: string;
  private readonly enterprise: string;
  private readonly integrations: ScmIntegrations;
  private readonly credentialsProvider: DefaultGithubCredentialsProvider;

  constructor(options: { config: Config }) {
    const { config } = options;

    this.integrations = ScmIntegrations.fromConfig(config);
    this.credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(this.integrations);

    this.host = config.getString('copilot.host');
    this.enterprise = config.getString('copilot.enterprise');

    if (!this.host) {
      throw new Error('The host configuration is missing from the config.');
    }

    if (!this.enterprise) {
      throw new Error(
        'The enterprise configuration is missing from the config.',
      );
    }
  }

  async getCredentials(): Promise<GithubInfo> {
    const githubConfig = this.integrations.github.byHost(this.host)?.config;

    if (!githubConfig) {
      throw new Error(
        `GitHub configuration for host "${this.host}" is missing or incomplete.`,
      );
    }

    const apiBaseUrl = githubConfig.apiBaseUrl ?? 'https://api.github.com';

    const credentials = await this.credentialsProvider.getCredentials({
      url: apiBaseUrl,
    });

    if (!credentials.headers) {
      throw new Error('Failed to retrieve credentials headers.');
    }

    return {
      apiBaseUrl,
      credentials,
      enterprise: this.enterprise,
    };
  }
}
