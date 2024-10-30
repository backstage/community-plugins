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
import { GithubCredentials, ScmIntegrations } from '@backstage/integration';
import { CopilotCredentialsProvider, GithubInfo } from './credentialsProvider';

/**
 * A credentials provider that retrieves GitHub credentials from the copilot config.
 *
 * @public
 */
export class DefaultCopilotCredentialsProvider
  implements CopilotCredentialsProvider
{
  private readonly host: string;
  private readonly token: string;
  private readonly enterprise: string;
  private readonly integrations: ScmIntegrations;

  constructor(options: { config: Config }) {
    const { config } = options;

    this.integrations = ScmIntegrations.fromConfig(config);

    this.host = config.getString('copilot.host');
    this.enterprise = config.getString('copilot.enterprise');
    this.token = config.getString('copilot.token');

    if (!this.host) {
      throw new Error('The host configuration is missing from the config.');
    }

    if (!this.token) {
      throw new Error('The token configuration is missing from the config.');
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

    const credentials: GithubCredentials = {
      token: this.token,
      type: 'token',
    };

    return {
      apiBaseUrl,
      credentials,
      enterprise: this.enterprise,
    };
  }
}
