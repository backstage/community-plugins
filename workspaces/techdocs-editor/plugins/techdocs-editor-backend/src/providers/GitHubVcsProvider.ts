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
import {
  DefaultGithubCredentialsProvider,
  GithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import {
  VcsProvider,
  OpenPrOptions,
  OpenPrResult,
} from '@backstage-community/plugin-techdocs-editor-node';
import { Octokit } from 'octokit';
import { createPullRequest } from 'octokit-plugin-create-pull-request';

const OctokitWithPR = Octokit.plugin(createPullRequest as any);

/** @public */
export class GitHubVcsProvider implements VcsProvider {
  readonly id = 'github';

  private readonly credentialsProvider: GithubCredentialsProvider;
  private readonly baseApiUrl: string;

  constructor(config: Config) {
    const integrations = ScmIntegrations.fromConfig(config);
    this.credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(integrations);
    // Support GitHub Enterprise Server
    const ghIntegration = integrations.github.list()[0];
    this.baseApiUrl =
      ghIntegration?.config.apiBaseUrl ?? 'https://api.github.com';
  }

  canHandle(repoUrl: string): boolean {
    try {
      const url = new URL(repoUrl);
      // github.com or GHE host
      return (
        url.host === 'github.com' ||
        url.host.startsWith('github.') ||
        this.baseApiUrl.includes(url.host)
      );
    } catch {
      return false;
    }
  }

  private async getOctokit(
    repoUrl: string,
  ): Promise<InstanceType<typeof OctokitWithPR>> {
    const credentials = await this.credentialsProvider.getCredentials({
      url: repoUrl,
    });
    // `token` is the direct accessor; fall back to parsing the Authorization
    // header, which is optional and may be undefined when no credentials are
    // configured for this host.
    const auth =
      credentials.token ??
      credentials.headers?.Authorization?.replace(/^token /i, '');
    return new OctokitWithPR({
      auth,
      baseUrl: this.baseApiUrl,
    });
  }

  private parseRepo(repoUrl: string): { owner: string; repo: string } {
    const url = new URL(repoUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      throw new InputError(`Cannot parse owner/repo from URL: ${repoUrl}`);
    }
    return { owner: parts[0], repo: parts[1] };
  }

  async getDefaultBranch(repoUrl: string): Promise<string> {
    const octokit = await this.getOctokit(repoUrl);
    const { owner, repo } = this.parseRepo(repoUrl);
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return data.default_branch;
  }

  async readFile(opts: {
    repoUrl: string;
    ref: string;
    filePath: string;
  }): Promise<{ content: string; etag: string }> {
    const octokit = await this.getOctokit(opts.repoUrl);
    const { owner, repo } = this.parseRepo(opts.repoUrl);

    let data: any;
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: opts.filePath,
        ref: opts.ref,
      });
      data = response.data;
    } catch (err: any) {
      if (err.status === 404) {
        throw new NotFoundError(
          `File not found: ${opts.filePath} at ref ${opts.ref} in ${opts.repoUrl}`,
        );
      }
      throw err;
    }

    if (Array.isArray(data)) {
      throw new InputError(`${opts.filePath} is a directory, not a file`);
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    // Use the file's SHA as the etag for conflict detection
    const etag = data.sha as string;
    return { content, etag };
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    const octokit = await this.getOctokit(opts.repoUrl);
    const { owner, repo } = this.parseRepo(opts.repoUrl);

    // Use the git tree API with recursive=1 for efficiency
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${opts.ref}`,
    });

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: refData.object.sha,
      recursive: '1',
    });

    const prefix = opts.dirPath.endsWith('/')
      ? opts.dirPath
      : `${opts.dirPath}/`;
    type TreeItem = { type?: string; path?: string };
    return ((treeData.tree ?? []) as TreeItem[])
      .filter(
        (item): item is { type: string; path: string } =>
          item.type === 'blob' &&
          typeof item.path === 'string' &&
          item.path.startsWith(prefix),
      )
      .map(item => item.path.slice(prefix.length));
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    const octokit = await this.getOctokit(opts.repoUrl);
    const { owner, repo } = this.parseRepo(opts.repoUrl);

    // Convert Map to plain object for octokit-plugin-create-pull-request
    const changes: Record<string, { content: string } | null> = {};
    for (const [path, content] of opts.files) {
      changes[path] = content !== null ? { content } : null;
    }

    const pr = await (octokit as any).createPullRequest({
      owner,
      repo,
      title: opts.title,
      body: opts.description ?? '',
      base: opts.baseBranch,
      head: opts.headBranch,
      draft: opts.draft ?? false,
      changes: [
        {
          files: changes,
          commit: opts.commitMessage,
        },
      ],
    });

    if (!pr?.data) {
      throw new Error('Failed to create GitHub pull request');
    }

    return {
      url: pr.data.html_url,
      number: pr.data.number,
    };
  }
}
