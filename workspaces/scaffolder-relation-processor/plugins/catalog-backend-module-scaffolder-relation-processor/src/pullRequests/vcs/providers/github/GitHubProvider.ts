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

import { Octokit } from '@octokit/core';
import {
  createPullRequest,
  DELETE_FILE,
} from 'octokit-plugin-create-pull-request';
import {
  ScmIntegrations,
  DefaultGithubCredentialsProvider,
} from '@backstage/integration';
import { OctokitWithCreatePullRequest } from './types';
import {
  createTemplateUpgradeBranchName,
  createTemplateUpgradeCommitMessage,
  createTemplateUpgradePrBody,
  createTemplateUpgradePrTitle,
} from '../../utils/prFormatting';
import type { Entity } from '@backstage/catalog-model';
import type { TemplateInfo, CreatedPullRequest } from '../../VcsProvider';
import { BaseVcsProvider } from '../../BaseVcsProvider';

/**
 * GitHub implementation of VCS provider
 *
 * @internal
 */
export class GitHubProvider extends BaseVcsProvider {
  getName(): string {
    return 'github';
  }

  canHandle(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const integrations = ScmIntegrations.fromConfig(this.config);
      const githubIntegration = integrations.github.byHost(urlObj.hostname);
      return githubIntegration !== undefined;
    } catch {
      return false;
    }
  }

  async createPullRequest(
    repoUrl: string,
    filesToUpdate: Map<string, string | null>,
    templateInfo: TemplateInfo,
    reviewer: string | null,
  ): Promise<CreatedPullRequest> {
    const octokit = await this.getClient(repoUrl);

    if (!octokit) {
      throw new Error('GitHub authentication failed');
    }

    // Extract owner and repo from URL
    const parsedUrl = this.parseUrl(repoUrl);
    if (!parsedUrl) {
      throw new Error('Invalid repository URL');
    }
    const { owner, repo } = parsedUrl;

    // Prepare files object for the plugin
    const files: Record<string, string | typeof DELETE_FILE> = {};
    for (const [filePath, content] of filesToUpdate.entries()) {
      files[filePath] = content === null ? DELETE_FILE : content;
    }

    const branchName = createTemplateUpgradeBranchName(templateInfo);
    const commitMessage = createTemplateUpgradeCommitMessage(
      templateInfo,
      filesToUpdate.size,
    );
    const prBody = createTemplateUpgradePrBody(
      templateInfo,
      filesToUpdate.size,
    );
    const prTitle = createTemplateUpgradePrTitle(templateInfo);

    const prOptions = {
      owner,
      repo,
      title: prTitle,
      body: prBody,
      head: branchName,
      changes: [
        {
          files,
          commit: commitMessage,
        },
      ],
    };

    const pr = await octokit.createPullRequest(prOptions);

    if (!pr) {
      throw new Error('PR creation returned empty result');
    }

    this.logger.info(
      `Created template update pull request #${pr.data.number} for ${owner}/${repo}: ${pr.data.html_url}`,
    );

    // Request review from reviewer if provided
    if (reviewer) {
      await this.requestReview(octokit, owner, repo, pr.data.number, reviewer);
    }

    return { url: pr.data.html_url };
  }

  async getReviewerFromOwner(
    scaffoldedEntity: Entity,
    token: string,
  ): Promise<string | null> {
    const ownerRef = scaffoldedEntity.spec?.owner?.toString();
    if (!ownerRef) {
      return null;
    }

    return this.getOwnerGitHubLogin(ownerRef, token);
  }

  /**
   * Gets GitHub credentials and creates an Octokit instance with pull request plugin
   *
   * @param repoUrl - GitHub repository URL
   * @returns Octokit instance with createPullRequest plugin
   *
   * @internal
   */
  private async getClient(
    repoUrl: string,
  ): Promise<OctokitWithCreatePullRequest | null> {
    try {
      const integrations = ScmIntegrations.fromConfig(this.config);
      const urlObj = new URL(repoUrl);
      const host = urlObj.hostname;

      const githubIntegration = integrations.github.byHost(host);
      if (!githubIntegration) {
        return null;
      }

      const baseUrl = githubIntegration.config.apiBaseUrl;

      // Use DefaultGithubCredentialsProvider which supports GitHub Apps
      const credentialsProvider =
        DefaultGithubCredentialsProvider.fromIntegrations(integrations);

      const credentials = await credentialsProvider.getCredentials({
        url: repoUrl,
      });

      const token =
        credentials?.token || githubIntegration.config.token || null;

      if (!token) {
        return null;
      }

      // Create Octokit instance with the createPullRequest plugin
      const OctokitWithPlugin = Octokit.plugin(createPullRequest);
      const octokit = new OctokitWithPlugin({
        auth: token,
        ...(baseUrl && { baseUrl }),
      });
      return octokit;
    } catch {
      return null;
    }
  }

  /**
   * Requests a review from a reviewer for a pull request
   *
   * @param octokit - Octokit instance
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param pullNumber - Pull request number
   * @param reviewer - GitHub username to request review from
   *
   * @internal
   */
  private async requestReview(
    octokit: OctokitWithCreatePullRequest,
    owner: string,
    repo: string,
    pullNumber: number,
    reviewer: string,
  ): Promise<void> {
    try {
      await octokit.request(
        'POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers',
        {
          owner,
          repo,
          pull_number: pullNumber,
          reviewers: [reviewer],
        },
      );
      this.logger.info(
        `Requested review from ${reviewer} for pull request #${pullNumber}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to request review from ${reviewer} for pull request #${pullNumber}: ${error}`,
      );
    }
  }

  /**
   * Extracts the GitHub login from the owner entity if it's a User
   *
   * @param ownerRef - Owner entity reference
   * @param token - Auth token for catalog API
   * @returns GitHub login if owner is a User with the annotation, null otherwise
   *
   * @internal
   */
  private async getOwnerGitHubLogin(
    ownerRef: string,
    token: string,
  ): Promise<string | null> {
    try {
      const ownerEntity = await this.catalogClient.getEntityByRef(ownerRef, {
        token,
      });

      if (!ownerEntity) {
        return null;
      }

      // Only assign to Users, not Groups
      if (ownerEntity.kind !== 'User') {
        return null;
      }

      const githubLogin =
        ownerEntity.metadata.annotations?.['github.com/user-login'];
      return githubLogin || null;
    } catch {
      return null;
    }
  }
}
