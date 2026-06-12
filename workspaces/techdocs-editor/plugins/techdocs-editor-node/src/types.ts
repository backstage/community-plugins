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

/**
 * Options passed to VcsProvider.openPullRequest.
 * @public
 */
export type OpenPrOptions = {
  /** Full repository URL, e.g. https://github.com/org/repo */
  repoUrl: string;
  /** Branch to open the PR from (created by the backend) */
  headBranch: string;
  /** Branch to merge into */
  baseBranch: string;
  /** PR / MR title */
  title: string;
  /** PR / MR description body (markdown) */
  description?: string;
  /** Map of file path → new content (null = delete file) */
  files: Map<string, string | null>;
  commitMessage: string;
  /** Git author display name */
  authorName: string;
  /** Git author email */
  authorEmail: string;
  /** Open as draft PR/MR */
  draft?: boolean;
  /** GitHub usernames or GitLab usernames to request review from */
  reviewers?: string[];
};

/**
 * Result from VcsProvider.openPullRequest.
 * @public
 */
export type OpenPrResult = {
  /** Direct URL to the opened PR / MR */
  url: string;
  /** Provider-specific PR/MR number */
  number: number;
};

/**
 * Result from VcsProvider.readFile.
 * @public
 */
export type VcsFileResult = {
  /** Raw file content */
  content: string;
  /** Commit SHA or HTTP ETag for conflict detection */
  etag: string;
};

/**
 * Abstraction over a version-control system for opening pull/merge requests.
 * Implement this interface in a backend module to add support for a new SCM provider.
 * @public
 */
export interface VcsProvider {
  /** Unique identifier, e.g. 'github' or 'gitlab' */
  readonly id: string;

  /** Returns true if this provider can handle the given repository URL */
  canHandle(repoUrl: string): boolean;

  /** Opens a pull or merge request with the given file changes */
  openPullRequest(opts: OpenPrOptions): Promise<OpenPrResult>;

  /**
   * Reads the raw content of a single file at the given ref.
   * Returns the content and an etag (commit SHA or HTTP ETag) for conflict detection.
   */
  readFile(opts: {
    repoUrl: string;
    ref: string;
    filePath: string;
  }): Promise<VcsFileResult>;

  /**
   * Lists all files recursively under the given directory path at the given ref.
   * Returns relative paths from the root of the repo.
   */
  listFiles(opts: {
    repoUrl: string;
    ref: string;
    dirPath: string;
  }): Promise<string[]>;

  /**
   * Returns the default branch name (e.g. 'main' or 'master').
   */
  getDefaultBranch(repoUrl: string): Promise<string>;
}

/**
 * Extension point for registering VcsProvider implementations.
 * @public
 */
export interface VcsProviderExtensionPoint {
  addProvider(provider: VcsProvider): void;
}
