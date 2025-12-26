/*
 * Copyright 2025 The Backstage Authors
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
import { Azure as AzureIcon } from '../../assets/providerIcons/Azure';
import { Bitbucket as BitbucketIcon } from '../../assets/providerIcons/Bitbucket';
import { Gitlab as GitlabIcon } from '../../assets/providerIcons/Gitlab';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { RepositoryType } from '../../queries';

export enum Provider {
  AzureDevops = 'AzureDevops',
  AzureDevopsServer = 'AzureDevopsServer',
  BitbucketServer = 'BitbucketServer',
  BitbucketCloud = 'BitbucketCloud',
  Bitbucket = 'Bitbucket',
  Github = 'Github',
  GithubEnterprise = 'GithubEnterprise',
  Gitlab = 'Gitlab',
  GitlabServer = 'GitlabServer',
}

export const scmProviderIcons: Record<string, any> = {
  [Provider.AzureDevops]: AzureIcon,
  [Provider.AzureDevopsServer]: AzureIcon,
  [Provider.BitbucketCloud]: BitbucketIcon,
  [Provider.BitbucketServer]: BitbucketIcon,
  [Provider.Bitbucket]: BitbucketIcon,
  [Provider.Github]: GitHubIcon,
  [Provider.GithubEnterprise]: GitHubIcon,
  [Provider.Gitlab]: GitlabIcon,
  [Provider.GitlabServer]: GitlabIcon,
};

export const generateRepoURL = (
  repository: RepositoryType,
): string | undefined => {
  const { provider, branchName, url } = repository;

  if (!url) return undefined;

  switch (provider) {
    case Provider.Github:
    case Provider.GithubEnterprise:
      return `${url}/tree/${branchName}`;

    case Provider.Gitlab:
    case Provider.GitlabServer:
      return `${url}/-/tree/${branchName}`;

    case Provider.AzureDevops:
    case Provider.AzureDevopsServer:
      return `${url}?version=GB${branchName}`;

    case Provider.BitbucketServer:
      return `${url}/browse?at=refs/heads/${branchName}`;

    case Provider.BitbucketCloud:
    case Provider.Bitbucket:
      return `${url}/branch/${branchName}`;

    default:
      // Return URL as is for unsupported providers
      return url;
  }
};

export const getRepositoryUrl = (url: string | null) => {
  if (!url) return null;

  // Extract repository URL for any Git provider (GitHub, GitLab, Bitbucket, Azure DevOps, etc.)
  // Matches: https://domain.com/user/repo (stops before /tree/, /blob/, /-/, etc.)
  const repoMatch = url.match(/url:https?:\/\/.*/);

  return repoMatch ? repoMatch[0].replace('url:', '') : null;
};
