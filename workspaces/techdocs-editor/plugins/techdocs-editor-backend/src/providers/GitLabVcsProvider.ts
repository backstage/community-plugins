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

import { Config } from '@backstage/config';
import { NotFoundError, InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import {
  VcsProvider,
  OpenPrOptions,
  OpenPrResult,
} from '@backstage-community/plugin-techdocs-editor-node';
import { Gitlab } from '@gitbeaker/rest';

/** @public */
export class GitLabVcsProvider implements VcsProvider {
  readonly id = 'gitlab';

  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  canHandle(repoUrl: string): boolean {
    try {
      const url = new URL(repoUrl);
      const integrations = ScmIntegrations.fromConfig(this.config);
      return integrations.gitlab.byHost(url.host) !== undefined;
    } catch {
      return false;
    }
  }

  private getClient(repoUrl: string) {
    const url = new URL(repoUrl);
    const integrations = ScmIntegrations.fromConfig(this.config);
    const integration = integrations.gitlab.byHost(url.host);
    if (!integration) {
      throw new InputError(`No GitLab integration for host: ${url.host}`);
    }
    const token = integration.config.token;
    if (!token) {
      throw new InputError(
        `GitLab integration for ${url.host} has no token configured`,
      );
    }
    return new Gitlab({
      host: `${url.protocol}//${url.host}`,
      token,
    });
  }

  private getProjectPath(repoUrl: string): string {
    const url = new URL(repoUrl);
    return url.pathname.slice(1); // removes leading /
  }

  async getDefaultBranch(repoUrl: string): Promise<string> {
    const client = this.getClient(repoUrl);
    const projectPath = this.getProjectPath(repoUrl);
    const project = await client.Projects.show(projectPath);
    return project.default_branch ?? 'main';
  }

  async readFile(opts: {
    repoUrl: string;
    ref: string;
    filePath: string;
  }): Promise<{ content: string; etag: string }> {
    const client = this.getClient(opts.repoUrl);
    const projectPath = this.getProjectPath(opts.repoUrl);

    try {
      const file = await client.RepositoryFiles.show(
        projectPath,
        opts.filePath,
        opts.ref,
      );
      const content = Buffer.from(file.content, 'base64').toString('utf-8');
      return { content, etag: file.blob_id };
    } catch (err: any) {
      if (
        err.cause?.description?.includes('404') ||
        err.message?.includes('404')
      ) {
        throw new NotFoundError(
          `File not found: ${opts.filePath} at ref ${opts.ref} in ${opts.repoUrl}`,
        );
      }
      throw err;
    }
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    const client = this.getClient(opts.repoUrl);
    const projectPath = this.getProjectPath(opts.repoUrl);

    const items = await client.Repositories.allRepositoryTrees(projectPath, {
      path: opts.dirPath,
      ref: opts.ref,
      recursive: true,
    });

    return items
      .filter(item => item.type === 'blob')
      .map(item => {
        const prefix = opts.dirPath.endsWith('/')
          ? opts.dirPath
          : `${opts.dirPath}/`;
        return item.path.startsWith(prefix)
          ? item.path.slice(prefix.length)
          : item.path;
      });
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    const client = this.getClient(opts.repoUrl);
    const projectPath = this.getProjectPath(opts.repoUrl);

    // Create branch
    await client.Branches.create(projectPath, opts.headBranch, opts.baseBranch);

    // Commit all files in one batch
    const actions: any[] = [];
    for (const [filePath, content] of opts.files) {
      if (content === null) {
        actions.push({ action: 'delete', file_path: filePath });
      } else {
        // Try to detect if file exists to choose create vs update
        let fileExists = false;
        try {
          await client.RepositoryFiles.show(
            projectPath,
            filePath,
            opts.baseBranch,
          );
          fileExists = true;
        } catch {
          // New file
        }
        actions.push({
          action: fileExists ? 'update' : 'create',
          file_path: filePath,
          content,
          encoding: 'text',
        });
      }
    }

    await client.Commits.create(
      projectPath,
      opts.headBranch,
      opts.commitMessage,
      actions,
      {
        authorName: opts.authorName,
        authorEmail: opts.authorEmail,
      },
    );

    // Create merge request
    const mr = await client.MergeRequests.create(
      projectPath,
      opts.headBranch,
      opts.baseBranch,
      opts.title,
      {
        description: opts.description ?? '',
        ...(opts.draft ? { draft: true } : {}),
      } as any,
    );

    return {
      url: mr.web_url,
      number: mr.iid,
    };
  }
}
