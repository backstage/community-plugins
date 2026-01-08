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

import { ScmIntegrations } from '@backstage/integration';
import { Gitlab } from '@gitbeaker/rest';
import {
  createTemplateUpgradeBranchName,
  createTemplateUpgradeCommitMessage,
  createTemplateUpgradePrBody,
  createTemplateUpgradePrTitle,
} from '../../utils/prFormatting';
import type { Entity } from '@backstage/catalog-model';
import type { TemplateInfo, CreatedPullRequest } from '../../VcsProvider';
import { BaseVcsProvider } from '../../BaseVcsProvider';
import { GitbeakerClient, PrepareCommitActions } from './types';

/**
 * GitLab implementation of VCS provider
 *
 * @internal
 */
export class GitLabProvider extends BaseVcsProvider {
  getName(): string {
    return 'gitlab';
  }

  canHandle(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const integrations = ScmIntegrations.fromConfig(this.config);
      const gitlabIntegration = integrations.gitlab.byHost(urlObj.hostname);
      return gitlabIntegration !== undefined;
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
    const client = await this.getClient(repoUrl);
    if (!client) {
      throw new Error('GitLab authentication failed');
    }

    const projectPath = this.getProjectPath(repoUrl);
    if (!projectPath) {
      throw new Error('Invalid repository URL');
    }

    const branchName = await this.createBranchWithCommit(
      client,
      projectPath,
      filesToUpdate,
      templateInfo,
    );

    const mrResult = await this.createMergeRequest(
      client,
      projectPath,
      branchName,
      templateInfo,
      filesToUpdate.size,
    );

    if (reviewer && mrResult.iid) {
      await this.assignReviewer(client, projectPath, mrResult.iid, reviewer);
    }

    return { url: mrResult.webUrl };
  }

  /**
   * Gets the reviewer username from the scaffolded entity's owner
   *
   * @param scaffoldedEntity - The scaffolded entity
   * @param token - Auth token for catalog API
   * @returns Username if owner is a User, null otherwise
   */
  async getReviewerFromOwner(
    scaffoldedEntity: Entity,
    token: string,
  ): Promise<string | null> {
    const ownerRef = scaffoldedEntity.spec?.owner?.toString();
    if (!ownerRef) {
      return null;
    }

    return this.getOwnerGitLabUsername(ownerRef, token);
  }

  /**
   * Extracts project path (owner/repo) from repository URL
   *
   * @param repoUrl - Repository URL
   * @returns Project path or null if parsing fails
   *
   * @internal
   */
  private getProjectPath(repoUrl: string): string | null {
    const parsedUrl = this.parseUrl(repoUrl);
    if (!parsedUrl) {
      return null;
    }
    return `${parsedUrl.owner}/${parsedUrl.repo}`;
  }

  /**
   * Creates a new branch with the template update commit
   *
   * @param client - Gitbeaker client
   * @param projectPath - Project path (owner/repo)
   * @param filesToUpdate - Map of file paths to content
   * @param templateInfo - Template information
   * @returns The created branch name
   *
   * @internal
   */
  private async createBranchWithCommit(
    client: GitbeakerClient,
    projectPath: string,
    filesToUpdate: Map<string, string | null>,
    templateInfo: TemplateInfo,
  ): Promise<string> {
    const project = await client.Projects.show(projectPath);
    const defaultBranch = project.default_branch;

    const branchName = createTemplateUpgradeBranchName(templateInfo);
    const commitMessage = createTemplateUpgradeCommitMessage(
      templateInfo,
      filesToUpdate.size,
    );

    const actions = await this.prepareCommitActions(
      client,
      projectPath,
      defaultBranch,
      filesToUpdate,
    );

    await client.Commits.create(
      projectPath,
      branchName,
      commitMessage,
      actions,
      {
        startBranch: defaultBranch,
      },
    );

    return branchName;
  }

  /**
   * Creates a merge request for the template update
   *
   * @param client - Gitbeaker client
   * @param projectPath - Project path (owner/repo)
   * @param branchName - Source branch name
   * @param templateInfo - Template information
   * @param fileCount - Number of files being updated
   * @returns The merge request IID and web URL
   *
   * @internal
   */
  private async createMergeRequest(
    client: GitbeakerClient,
    projectPath: string,
    branchName: string,
    templateInfo: TemplateInfo,
    fileCount: number,
  ): Promise<{ iid: number; webUrl: string }> {
    const project = await client.Projects.show(projectPath);
    const defaultBranch = project.default_branch;

    const mrTitle = createTemplateUpgradePrTitle(templateInfo);
    const mrBody = createTemplateUpgradePrBody(templateInfo, fileCount);

    const mr = await client.MergeRequests.create(
      projectPath,
      branchName,
      defaultBranch,
      mrTitle,
      {
        description: mrBody,
        removeSourceBranch: true,
      },
    );

    this.logger.info(
      `Created template update merge request !${mr.iid} for ${projectPath}: ${mr.web_url}`,
    );

    return { iid: mr.iid, webUrl: mr.web_url };
  }

  /**
   * Gets GitLab client using gitbeaker
   *
   * @param repoUrl - GitLab repository URL
   * @returns Gitbeaker client instance, or null if not found
   *
   * @internal
   */
  private async getClient(repoUrl: string): Promise<GitbeakerClient | null> {
    try {
      const integrations = ScmIntegrations.fromConfig(this.config);
      const urlObj = new URL(repoUrl);
      const host = urlObj.hostname;

      const gitlabIntegration = integrations.gitlab.byHost(host);
      if (!gitlabIntegration) {
        return null;
      }

      const token = gitlabIntegration.config.token;
      if (!token) {
        return null;
      }

      return new Gitlab({
        token,
        host: urlObj.origin,
      });
    } catch {
      return null;
    }
  }

  /**
   * Prepares commit actions for file changes
   *
   * @param client - Gitbeaker client
   * @param projectPath - Project path
   * @param branch - Branch name
   * @param filesToUpdate - Map of file paths to content
   * @returns Array of commit actions
   *
   * @internal
   */
  private async prepareCommitActions(
    client: GitbeakerClient,
    projectPath: string,
    branch: string,
    filesToUpdate: Map<string, string | null>,
  ): PrepareCommitActions {
    const entries = Array.from(filesToUpdate.entries());

    const existenceChecks = await Promise.all(
      entries.map(([filePath]) =>
        this.fileExists(client, projectPath, filePath, branch),
      ),
    );

    return entries.map(([filePath, content], index) => {
      if (content === null) {
        return { action: 'delete' as const, filePath };
      }

      return {
        action: existenceChecks[index]
          ? ('update' as const)
          : ('create' as const),
        filePath,
        content,
        encoding: 'text' as const,
      };
    });
  }

  /**
   * Checks if a file exists in the repository
   *
   * @param client - Gitbeaker client
   * @param projectPath - Project path
   * @param filePath - Path to the file
   * @param branch - Branch name
   * @returns True if file exists
   *
   * @internal
   */
  private async fileExists(
    client: GitbeakerClient,
    projectPath: string,
    filePath: string,
    branch: string,
  ): Promise<boolean> {
    try {
      await client.RepositoryFiles.show(projectPath, filePath, branch);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Assigns a reviewer to a merge request
   *
   * @param client - Gitbeaker client
   * @param projectPath - Project path
   * @param mrIid - Merge request IID
   * @param username - GitLab username to assign as reviewer
   *
   * @internal
   */
  private async assignReviewer(
    client: GitbeakerClient,
    projectPath: string,
    mrIid: number,
    username: string,
  ): Promise<void> {
    try {
      const users = await client.Users.all({ username });

      if (users.length === 0) {
        this.logger.warn(`GitLab user not found: ${username}`);
        return;
      }

      const userId = users[0].id;

      await client.MergeRequests.edit(projectPath, mrIid, {
        reviewerIds: [userId],
      });

      this.logger.info(
        `Assigned reviewer ${username} to merge request !${mrIid}`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to assign reviewer ${username} to merge request !${mrIid}: ${error}`,
      );
    }
  }

  /**
   * Extracts the GitLab username from the owner entity if it's a User
   *
   * @param ownerRef - Owner entity reference
   * @param token - Auth token for catalog API
   * @returns GitLab username if owner is a User with the annotation, null otherwise
   *
   * @internal
   */
  private async getOwnerGitLabUsername(
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

      const gitlabUsername =
        ownerEntity.metadata.annotations?.['gitlab.com/user-login'];
      return gitlabUsername || null;
    } catch {
      return null;
    }
  }
}
