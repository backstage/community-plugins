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

import type { Entity } from '@backstage/catalog-model';

/**
 * Generic parsed URL information for version control systems
 *
 * @public
 */
export type ParsedUrl = {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
};

/**
 * Template information for pull/merge request creation
 *
 * @public
 */
export type TemplateInfo = {
  owner: string;
  repo: string;
  name: string;
  previousVersion: string;
  currentVersion: string;
  componentName: string;
};

/**
 * Result of a successful pull request creation
 *
 * @internal
 */
export interface PullRequestSuccess {
  success: true;
  url: string;
}

/**
 * Result of a failed pull request creation
 *
 * @internal
 */
export interface PullRequestFailure {
  success: false;
  error: string;
}

/**
 * Result of a pull request creation attempt (used for aggregating results)
 *
 * @internal
 */
export type PullRequestResult = PullRequestSuccess | PullRequestFailure;

/**
 * Successful pull request creation result returned by VCS providers
 *
 * @internal
 */
export interface CreatedPullRequest {
  url: string;
}

/**
 * Interface for Version Control System providers
 *
 * @public
 */
export interface VcsProvider {
  /**
   * Gets the name of this VCS provider (e.g., 'github', 'gitlab')
   */
  getName(): string;

  /**
   * Checks if this provider can handle the given URL
   *
   * @param url - Repository URL to check
   * @returns True if this provider can handle the URL
   */
  canHandle(url: string): boolean;

  /**
   * Extracts repository URL from entity annotations
   *
   * @param entity - A backstage entity
   * @returns Repository URL, or null if not found
   */
  extractRepoUrl(entity: Entity): string | null;

  /**
   * Parses a repository URL to extract owner, repo, branch, and path
   *
   * @param url - Repository URL (e.g., https://github.com/owner/repo/tree/branch/path)
   * @returns Parsed URL information, or null if parsing fails
   */
  parseUrl(url: string): ParsedUrl | null;

  /**
   * Creates a pull/merge request with updated template files
   *
   * @param repoUrl - Full repository URL
   * @param filesToUpdate - Map of file paths to updated content or null for deletions
   * @param templateInfo - Template information including versions and component name
   * @param reviewer - Optional username to request review from
   * @returns CreatedPullRequest containing the PR URL
   * @throws Error if PR creation fails
   */
  createPullRequest(
    repoUrl: string,
    filesToUpdate: Map<string, string | null>,
    templateInfo: TemplateInfo,
    reviewer: string | null,
  ): Promise<CreatedPullRequest>;

  /**
   * Gets the reviewer username from the scaffolded entity's owner
   *
   * @param scaffoldedEntity - The scaffolded entity
   * @param token - Auth token for catalog API
   * @returns Username if owner is a User, null otherwise
   */
  getReviewerFromOwner(
    scaffoldedEntity: Entity,
    token: string,
  ): Promise<string | null>;
}
