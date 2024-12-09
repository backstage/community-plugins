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

export type GithubInfo = {
  credentials: GithubCredentials;
  apiBaseUrl: string;
  enterprise?: string;
  organization?: string;
};

export const getGithubInfo = async (config: Config): Promise<GithubInfo> => {
  const integrations = ScmIntegrations.fromConfig(config);

  const host = config.getString('copilot.host');
  const enterprise = config.getOptionalString('copilot.enterprise');
  const organization = config.getOptionalString('copilot.organization');

  if (!host) {
    throw new Error('The host configuration is missing from the config.');
  }

  const githubConfig = integrations.github.byHost(host)?.config;

  if (!githubConfig) {
    throw new Error(
      `GitHub configuration for host "${host}" is missing or incomplete.`,
    );
  }

  const apiBaseUrl = githubConfig.apiBaseUrl ?? 'https://api.github.com';

  const credentials: GithubCredentials = {
    type: 'token',
    headers: { Authorization: `Bearer ${githubConfig.token}` },
    token: githubConfig.token,
  };

  return {
    apiBaseUrl,
    credentials,
    enterprise,
    organization,
  };
};
