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
  GithubCredentials,
  ScmIntegrations,
} from '@backstage/integration';

export type CopilotCredentials = {
  enterprise?: GithubCredentials;
  organization?: GithubCredentials;
};

export type CopilotConfig = {
  host: string;
  enterprise?: string;
  organization?: string;
  apiBaseUrl: string;
};

export const getCopilotConfig = (config: Config): CopilotConfig => {
  const host = config.getString('copilot.host');
  const enterprise = config.getOptionalString('copilot.enterprise');
  const organization = config.getOptionalString('copilot.organization');

  const integrations = ScmIntegrations.fromConfig(config);

  const githubConfig = integrations.github.byHost(host)?.config;

  if (!githubConfig) {
    throw new Error(
      `GitHub configuration for host "${host}" is missing or incomplete. Please check the integretions configuration section.`,
    );
  }

  if (enterprise && !githubConfig.token) {
    throw new Error(
      `Enterprise API for copilot only works with "classic PAT" tokens. No token is configured for "${host}" in the config.`,
    );
  }

  if (organization && !(githubConfig.token || githubConfig.apps)) {
    throw new Error(
      `Organization API for copilot works with both classic and fine grained PAT tokens or GitHub apps. No token or app is configured for "${host}" in the config.`,
    );
  }

  return {
    host,
    enterprise,
    organization,
    apiBaseUrl: githubConfig.apiBaseUrl ?? 'https://api.github.com',
  };
};

export const getGithubCredentials = async (
  config: Config,
  copilotConfig: CopilotConfig,
): Promise<CopilotCredentials> => {
  const integrations = ScmIntegrations.fromConfig(config);
  const { host, enterprise, organization } = copilotConfig;

  const githubConfig = integrations.github.byHost(host)?.config;

  if (!githubConfig) {
    throw new Error(
      `GitHub configuration for host "${host}" is missing or incomplete.`,
    );
  }

  const credentials: CopilotCredentials = {
    enterprise: undefined,
    organization: undefined,
  };

  if (enterprise) {
    if (!githubConfig.token) {
      throw new Error(
        `Enterprise API for copilot only works with "classic PAT" tokens. No token is configured for "${host}" in the config.`,
      );
    } else {
      credentials.enterprise = {
        type: 'token',
        headers: { Authorization: `Bearer ${githubConfig.token}` },
        token: githubConfig.token,
      };
    }
  }

  if (organization) {
    if (githubConfig.apps) {
      const githubCredentialsProvider =
        DefaultGithubCredentialsProvider.fromIntegrations(integrations);

      credentials.organization = await githubCredentialsProvider.getCredentials(
        {
          url: `https://${host}/${organization}`,
        },
      );
    } else if (githubConfig.token) {
      credentials.organization = {
        type: 'token',
        headers: { Authorization: `Bearer ${githubConfig.token}` },
        token: githubConfig.token,
      };
    } else {
      throw new Error(
        `Organization API for copilot works with both classic and fine grained PAT tokens or GitHub apps. No token or app is configured for "${host}" in the config.`,
      );
    }
  }

  return credentials;
};
