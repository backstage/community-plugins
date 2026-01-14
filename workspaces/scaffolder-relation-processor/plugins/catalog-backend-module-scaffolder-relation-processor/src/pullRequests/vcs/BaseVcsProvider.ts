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

import type { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import {
  type Entity,
  parseLocationRef,
  ANNOTATION_LOCATION,
} from '@backstage/catalog-model';
import gitUrlParse from 'git-url-parse';
import type {
  VcsProvider,
  ParsedUrl,
  TemplateInfo,
  CreatedPullRequest,
} from './VcsProvider';

/**
 * Abstract base class for VCS providers with shared implementations
 *
 * Provides common functionality for extracting and parsing repository URLs.
 *
 * @internal
 */
export abstract class BaseVcsProvider implements VcsProvider {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly config: Config,
    protected readonly catalogClient: CatalogClient,
  ) {}

  /**
   * Gets the name of this VCS provider (e.g., 'github', 'gitlab')
   */
  abstract getName(): string;

  /**
   * Checks if this provider can handle the given URL
   *
   * @param url - Repository URL to check
   * @returns True if this provider can handle the URL
   */
  abstract canHandle(url: string): boolean;

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
  abstract createPullRequest(
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
  abstract getReviewerFromOwner(
    scaffoldedEntity: Entity,
    token: string,
  ): Promise<string | null>;

  /**
   * Extracts repository URL from entity's managed-by-location annotation
   *
   * @param entity - A backstage entity
   * @returns Repository URL (directory, with blob converted to tree), or null if not found
   */
  extractRepoUrl(entity: Entity): string | null {
    const managedByLocation =
      entity.metadata.annotations?.[ANNOTATION_LOCATION];

    if (!managedByLocation) {
      return null;
    }

    let parsed;
    try {
      parsed = parseLocationRef(managedByLocation);
    } catch {
      return null;
    }

    if (parsed.type !== 'url') {
      this.logger.info(
        `Skipping non-URL location type '${parsed.type}' for entity ${entity.metadata.name}`,
      );
      return null;
    }

    const fileUrl = parsed.target;

    if (!this.canHandle(fileUrl)) {
      return null;
    }

    // Remove the filename to get the parent directory
    const lastSlash = fileUrl.lastIndexOf('/');
    if (lastSlash === -1) {
      return null;
    }

    // Get parent directory with trailing slash for correct URL resolution
    let baseUrl = fileUrl.substring(0, lastSlash + 1);

    baseUrl = baseUrl
      .replace('/-/blob/', '/-/tree/') // GitLab format
      .replace('/blob/', '/tree/'); // GitHub format

    return baseUrl;
  }

  /**
   * Parses a repository URL to extract owner, repo, branch, and path
   *
   * @param url - Repository URL (e.g., https://github.com/owner/repo/tree/branch/path)
   * @returns Parsed URL information (owner, repo), or null if parsing fails
   */
  parseUrl(url: string): ParsedUrl | null {
    try {
      const parsed = gitUrlParse(url);

      if (!parsed.owner || !parsed.name) {
        return null;
      }

      return {
        owner: parsed.owner,
        repo: parsed.name,
      };
    } catch {
      return null;
    }
  }
}
