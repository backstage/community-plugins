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
import { Entity } from '@backstage/catalog-model';
import { RepositoryItem } from './data.service.types';
import { APIIRO_PROJECT_ANNOTATION } from '@backstage-community/plugin-apiiro-common';

/**
 * Parses a Backstage entity URL to extract organization and repository information
 * @param entityUrl - The source location URL from Backstage entity annotations
 * @returns Object with host, org, and repo information, or null if parsing fails
 */
export const parseEntityURL = (entityUrl?: string) => {
  try {
    if (!entityUrl) {
      return null;
    }

    // Extract URL from the entity annotation (format: "url:https://github.com/org/repo/tree/main/")
    const matches = entityUrl.match(
      /https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]{1,5})?(\/.*)?/g,
    );

    if (!matches) {
      return null;
    }

    const url = new URL(matches[0]);
    const hostname = url.host.toLowerCase();

    // Handle different SCM providers
    let pathMatch;
    if (hostname === 'dev.azure.com') {
      // Azure DevOps format: /org/project/_git/repo
      pathMatch = url.pathname.match(
        /^\/([^\/]+)\/([^\/]+)\/_git\/([^\/]+)(?:\/.*)?$/,
      );
      if (pathMatch) {
        return {
          host: hostname,
          org: pathMatch[1],
          project: pathMatch[2], // Azure DevOps has projects
          repo: pathMatch[3],
          path: `/${pathMatch[1]}/${pathMatch[2]}/_git/${pathMatch[3]}`,
        };
      }
    } else {
      // GitHub/GitLab format: /org/repo
      pathMatch = url.pathname.match(/^\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
      if (pathMatch) {
        return {
          host: hostname,
          org: pathMatch[1],
          repo: pathMatch[2],
          path: `/${pathMatch[1]}/${pathMatch[2]}`,
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Extracts organization and repository name from a repository URL (supports GitHub, GitLab, Azure DevOps)
 * @param repositoryUrl - The repository URL from Apiiro
 * @returns Object with host, org, and repo information, or null if parsing fails
 */
export const parseRepositoryURL = (repositoryUrl?: string) => {
  try {
    if (!repositoryUrl) {
      return null;
    }

    const url = new URL(repositoryUrl);
    const hostname = url.host.toLowerCase();

    // Handle different SCM providers
    let pathMatch;
    if (hostname === 'dev.azure.com') {
      // Azure DevOps format: /org/project/_git/repo
      pathMatch = url.pathname.match(
        /^\/([^\/]+)\/([^\/]+)\/_git\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
      );
      if (pathMatch) {
        return {
          host: hostname,
          org: pathMatch[1],
          project: pathMatch[2], // Azure DevOps has projects
          repo: pathMatch[3],
          path: `/${pathMatch[1]}/${pathMatch[2]}/_git/${pathMatch[3]}`,
        };
      }
    } else {
      // GitHub/GitLab format: /org/repo or /org/repo.git
      pathMatch = url.pathname.match(
        /^\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
      );
      if (pathMatch) {
        return {
          host: hostname,
          org: pathMatch[1],
          repo: pathMatch[2],
          path: `/${pathMatch[1]}/${pathMatch[2]}`,
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Selects the appropriate branch for each repository based on isDefaultBranch flag.
 * @param repositories - Array of apiiro entities
 * @returns Array of repositories with with respective default branches only
 * Rules:
 *  - If any branch of a repository has isDefaultBranch === true, select that branch.
 *  - If all branches have isDefaultBranch === false or undefined, select the first branch.
 *  - Repositories are grouped by their URL (unique per logical repository across branches).
 */
export const RepositoryKeyMap = (
  repositories: RepositoryItem[],
): Map<string, RepositoryItem> => {
  const grouped = new Map<string, RepositoryItem>();

  repositories.forEach(repo => {
    if (!repo.key) return; // skip items without Key (can't group reliably)
    grouped.set(repo.key, repo);
  });

  return grouped;
};

/**
 * Generates entity URL for Backstage navigation
 * @param entity - Backstage entity
 * @returns Entity URL string or null if unable to generate
 */
export const generateEntityUrl = (entity: Entity): string | null => {
  try {
    const source = 'catalog';
    const namespace = entity?.metadata?.namespace;
    const kind = entity?.kind?.toLowerCase();
    const entityName = entity?.metadata?.name;

    // Extract repo name from source-location annotation
    const sourceLocation =
      entity?.metadata?.annotations?.['backstage.io/source-location'];
    if (!sourceLocation) {
      return null;
    }

    const entityURL = parseEntityURL(sourceLocation);
    if (!entityURL) {
      return null;
    }

    if (!namespace || !kind || !entityName) {
      return null;
    }

    return `/${source}/${namespace}/${kind}/${entityName}`;
  } catch (error) {
    return null;
  }
};

/**
 * Extracts the repository name from a repository URL
 * @param repositoryUrl - The repository URL (e.g., "https://github.com/barchart/common-node-js")
 * @returns The repository name (e.g., "common-node-js") or null if parsing fails
 */
export const extractRepositoryNameFromUrl = (
  repositoryUrl?: string,
): string | null => {
  if (!repositoryUrl) {
    return null;
  }

  const parsed = parseRepositoryURL(repositoryUrl);
  return parsed?.repo || null;
};

/**
 * Filters repositories by a specific repository URL (exact match)
 * @param repositories - Array of repositories to filter
 * @param repositoryUrl - The specific repository URL to filter by
 * @returns Array containing only the repository that matches the URL, or empty array if no match
 */
export const filterRepositoriesByUrl = (
  repositories: RepositoryItem[],
  repositoryUrl: string,
): RepositoryItem[] => {
  return repositories.filter(repository => repository.url === repositoryUrl);
};

/**
 * Filters repositories by a specific repository URL (exact match)
 * @param repositories - Array of repositories to filter
 * @param repositoryUrl - The specific repository URL to filter by
 * @returns Array containing only the repository that matches the URL, or empty array if no match
 */
export const filterRepositoriesByKey = (
  repositories: RepositoryItem[],
  repositoryKey: string,
): RepositoryItem[] => {
  return repositories.filter(repository => repository.key === repositoryKey);
};

/**
 * Matches Backstage entities with Apiiro repositories and adds entityUrl to each repository
 * @param entities - Array of Backstage entities
 * @param repositories - Array of Apiiro repositories
 * @returns Array of repositories that match with Backstage entities, with entityUrl added
 */
export const matchRepositoriesWithEntitiesAndAddUrl = (
  entities: Entity[],
  repositories: RepositoryItem[],
): (RepositoryItem & { entityUrl?: string })[] => {
  // First reduce to one branch per repository
  const RepositoryListWithKey = RepositoryKeyMap(repositories);

  return entities.reduce(
    (prev: Array<RepositoryItem & { entityUrl?: string }>, next: Entity) => {
      const annotationId =
        next?.metadata?.annotations?.[APIIRO_PROJECT_ANNOTATION];

      if (!annotationId) {
        return prev;
      }

      // NOTE: Find project based on Github URL
      const relatedProject = RepositoryListWithKey.get(annotationId);

      if (!relatedProject) {
        return prev;
      }

      const entityUrl = generateEntityUrl(next);

      prev.push({ ...relatedProject, entityUrl: entityUrl || undefined });

      return prev;
    },
    [],
  );
};
