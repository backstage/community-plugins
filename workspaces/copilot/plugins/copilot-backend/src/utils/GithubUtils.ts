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
import { ScmIntegrations } from '@backstage/integration';
import { type StrategyOptions } from '@octokit/auth-app';

export type OctokitAuthStrategy = StrategyOptions | string;

export type CopilotCredentials = {
  enterprise?: OctokitAuthStrategy;
  organization?: OctokitAuthStrategy;
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
      `GitHub configuration for host "${host}" is missing or incomplete. Please check the integrations configuration section.`,
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
      // Use token string for enterprise (PAT tokens) - Octokit will handle it
      credentials.enterprise = githubConfig.token;
    }
  }

  if (organization) {
    if (githubConfig.apps && githubConfig.apps.length > 0) {
      // Filter apps that explicitly allow this organization (case-insensitive comparison)
      // Only select apps that have allowedInstallationOwners configured with the target org
      const orgLowerCase = organization.toLowerCase();
      const allowedApp = githubConfig.apps.find(
        app =>
          app.allowedInstallationOwners &&
          app.allowedInstallationOwners.length > 0 &&
          app.allowedInstallationOwners.some(
            owner => owner.toLowerCase() === orgLowerCase,
          ),
      );

      if (!allowedApp) {
        throw new Error(
          `No GitHub App configured for organization "${organization}". Check allowedInstallationOwners in your GitHub integration config.`,
        );
      }

      // Use app auth strategy for GitHub Apps - handles automatic token refresh
      credentials.organization = {
        appId: allowedApp.appId,
        privateKey: allowedApp.privateKey,
      };
    } else if (githubConfig.token) {
      // Use token string for organization (PAT tokens) - Octokit will handle it
      credentials.organization = githubConfig.token;
    } else {
      throw new Error(
        `Organization API for copilot works with both classic and fine grained PAT tokens or GitHub apps. No token or app is configured for "${host}" in the config.`,
      );
    }
  }

  return credentials;
};
