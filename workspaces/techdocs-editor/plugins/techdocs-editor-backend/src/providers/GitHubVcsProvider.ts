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
  VcsWriteFile,
} from '@backstage-community/plugin-techdocs-editor-node';
import { Octokit } from 'octokit';

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function getImageMimeType(filePath: string): string | undefined {
  const dot = filePath.lastIndexOf('.');
  const ext = dot >= 0 ? filePath.slice(dot).toLocaleLowerCase('en-US') : '';
  return IMAGE_MIME_TYPES[ext];
}

/**
 * Directory-tree paths that should never be surfaced as documentation files,
 * even if they fall within the resolved docs directory (e.g. `docs_dir: .`
 * pointing at a repo root that also contains dependency trees).
 */
function isExcludedPath(treePath: string): boolean {
  return /(^|\/)node_modules\//.test(treePath);
}

/** @public */
export class GitHubVcsProvider implements VcsProvider {
  readonly id = 'github';

  private readonly credentialsProvider: GithubCredentialsProvider;
  private readonly baseApiUrl: string;

  constructor(config: Config) {
    const integrations = ScmIntegrations.fromConfig(config);
    this.credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(integrations);
    const ghIntegration = integrations.github.list()[0];
    this.baseApiUrl =
      ghIntegration?.config.apiBaseUrl ?? 'https://api.github.com';
  }

  canHandle(repoUrl: string): boolean {
    try {
      const url = new URL(repoUrl);
      return (
        url.host === 'github.com' ||
        url.host.startsWith('github.') ||
        this.baseApiUrl.includes(url.host)
      );
    } catch {
      return false;
    }
  }

  private async getOctokit(repoUrl: string): Promise<Octokit> {
    const credentials = await this.credentialsProvider.getCredentials({
      url: repoUrl,
    });
    const auth =
      credentials.token ??
      credentials.headers?.Authorization?.replace(/^token /i, '');
    if (!auth) {
      throw new InputError(
        `No GitHub credentials found for ${repoUrl}. ` +
          `Ensure a GitHub integration with a token is configured in app-config.yaml.`,
      );
    }
    return new Octokit({
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
  }): Promise<{
    content: string;
    encoding?: 'utf8' | 'base64';
    mimeType?: string;
    etag: string;
  }> {
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

    if (!data.sha) {
      throw new InputError(
        `GitHub API returned no SHA for ${opts.filePath} — cannot determine ETag for conflict detection.`,
      );
    }

    const mimeType = getImageMimeType(opts.filePath);
    if (mimeType) {
      return {
        content: data.content,
        encoding: 'base64',
        mimeType,
        etag: data.sha,
      };
    }
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const etag = data.sha;
    return { content, encoding: 'utf8', etag };
  }

  async listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]> {
    const octokit = await this.getOctokit(opts.repoUrl);
    const { owner, repo } = this.parseRepo(opts.repoUrl);

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
          item.path.startsWith(prefix) &&
          !isExcludedPath(item.path),
      )
      .map(item => item.path.slice(prefix.length));
  }

  async openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult> {
    const octokit = await this.getOctokit(opts.repoUrl);
    const { owner, repo } = this.parseRepo(opts.repoUrl);

    const { data: baseRef } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${opts.baseBranch}`,
    });

    try {
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${opts.headBranch}`,
        sha: baseRef.object.sha,
      });
    } catch (err: any) {
      const message = String(err?.message ?? '');
      const alreadyExists =
        err?.status === 422 &&
        message.toLocaleLowerCase('en-US').includes('reference already exists');
      if (!alreadyExists) {
        throw err;
      }
    }

    for (const [filePath, file] of opts.files) {
      if (file === null) {
        await this.deleteFileIfExists({
          octokit,
          owner,
          repo,
          branch: opts.headBranch,
          filePath,
          message: opts.commitMessage,
          authorName: opts.authorName,
          authorEmail: opts.authorEmail,
        });
        continue;
      }

      await this.createOrUpdateFile({
        octokit,
        owner,
        repo,
        branch: opts.headBranch,
        filePath,
        file,
        message: opts.commitMessage,
        authorName: opts.authorName,
        authorEmail: opts.authorEmail,
      });
    }

    const pr = await octokit.rest.pulls.create({
      owner,
      repo,
      title: opts.title,
      body: opts.description ?? '',
      base: opts.baseBranch,
      head: opts.headBranch,
      draft: opts.draft ?? false,
    });

    if (!pr.data) {
      throw new Error('Failed to create GitHub pull request');
    }

    return {
      url: pr.data.html_url,
      number: pr.data.number,
    };
  }

  private encodeFileContent(file: VcsWriteFile): string {
    const encoding = file.encoding ?? 'utf8';
    if (encoding === 'base64') {
      return file.content;
    }
    return Buffer.from(file.content, 'utf-8').toString('base64');
  }

  private async readFileSha(opts: {
    octokit: Octokit;
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
  }): Promise<string | undefined> {
    try {
      const response = await opts.octokit.rest.repos.getContent({
        owner: opts.owner,
        repo: opts.repo,
        path: opts.filePath,
        ref: opts.branch,
      });
      const data: any = response.data;
      if (Array.isArray(data)) {
        return undefined;
      }
      return data.sha;
    } catch (err: any) {
      if (err?.status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  private async createOrUpdateFile(opts: {
    octokit: Octokit;
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
    file: VcsWriteFile;
    message: string;
    authorName: string;
    authorEmail: string;
  }): Promise<void> {
    const sha = await this.readFileSha({
      octokit: opts.octokit,
      owner: opts.owner,
      repo: opts.repo,
      branch: opts.branch,
      filePath: opts.filePath,
    });

    await opts.octokit.rest.repos.createOrUpdateFileContents({
      owner: opts.owner,
      repo: opts.repo,
      path: opts.filePath,
      branch: opts.branch,
      message: opts.message,
      content: this.encodeFileContent(opts.file),
      ...(sha ? { sha } : {}),
      committer: {
        name: opts.authorName,
        email: opts.authorEmail,
      },
      author: {
        name: opts.authorName,
        email: opts.authorEmail,
      },
    });
  }

  private async deleteFileIfExists(opts: {
    octokit: Octokit;
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
    message: string;
    authorName: string;
    authorEmail: string;
  }): Promise<void> {
    const sha = await this.readFileSha({
      octokit: opts.octokit,
      owner: opts.owner,
      repo: opts.repo,
      branch: opts.branch,
      filePath: opts.filePath,
    });

    if (!sha) {
      return;
    }

    await opts.octokit.rest.repos.deleteFile({
      owner: opts.owner,
      repo: opts.repo,
      path: opts.filePath,
      branch: opts.branch,
      message: opts.message,
      sha,
      committer: {
        name: opts.authorName,
        email: opts.authorEmail,
      },
      author: {
        name: opts.authorName,
        email: opts.authorEmail,
      },
    });
  }
}
