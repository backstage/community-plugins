/*
 * Copyright 2021 The Backstage Authors
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

import { Entity, ANNOTATION_SOURCE_LOCATION } from '@backstage/catalog-model';
import {
  AZURE_DEVOPS_PROJECT_ANNOTATION,
  AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
  AZURE_DEVOPS_README_ANNOTATION,
  AZURE_DEVOPS_REPO_ANNOTATION,
  AZURE_DEVOPS_HOST_ORG_ANNOTATION,
} from '@backstage-community/plugin-azure-devops-common';

/** @public **/
export function getAnnotationValuesFromEntity(entity: Entity): {
  project: string;
  repo?: string;
  definition?: string;
  host?: string;
  org?: string;
  readmePath?: string;
} {
  const hostOrg = getHostOrg(entity.metadata.annotations);
  const projectRepo = getProjectRepo(entity.metadata.annotations);
  const project =
    entity.metadata.annotations?.[AZURE_DEVOPS_PROJECT_ANNOTATION];
  const definition =
    entity.metadata.annotations?.[AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION];
  const readmePath = (() => {
    const explicit =
      entity.metadata.annotations?.[AZURE_DEVOPS_README_ANNOTATION];
    if (explicit) return explicit;

    // Auto-detect README.md from backstage.io/source-location (#9188)
    const sourceLocation =
      entity.metadata.annotations?.[ANNOTATION_SOURCE_LOCATION];
    if (!sourceLocation) return undefined;

    try {
      // source-location values are prefixed with "url:" per Backstage convention
      const rawUrl = sourceLocation.startsWith('url:')
        ? sourceLocation.slice(4)
        : sourceLocation;

      const parsed = new URL(rawUrl);

      // Only derive paths for Azure DevOps URLs
      if (!parsed.hostname.includes('dev.azure.com')) return undefined;

      // "path" query param holds the repo-relative path (URL-decoded by the URL API)
      const pathParam = parsed.searchParams.get('path');
      if (!pathParam) return undefined;

      // Strip trailing slash, then get the directory of the catalog file
      const cleanPath = pathParam.replace(/\/$/, '');
      const lastSlash = cleanPath.lastIndexOf('/');
      const lastSegment = cleanPath.slice(lastSlash + 1);

      // If the last segment looks like a file (has a dot), use its parent dir
      const dir = lastSegment.includes('.')
        ? cleanPath.slice(0, lastSlash)
        : cleanPath;

      return `${dir}/README.md`;
    } catch {
      // Malformed URL — fail gracefully
      return undefined;
    }
  })();

  if (definition) {
    if (project) {
      return {
        project,
        definition,
        readmePath: readmePath,
        ...hostOrg,
      };
    }
    if (projectRepo.project) {
      return {
        project: projectRepo.project,
        repo: projectRepo.repo,
        definition,
        readmePath: readmePath,
        ...hostOrg,
      };
    }
    throw new Error(
      `Value for annotation "${AZURE_DEVOPS_PROJECT_ANNOTATION}" was not found`,
    );
  } else {
    if (projectRepo.project) {
      return {
        project: projectRepo.project,
        repo: projectRepo.repo,
        readmePath: readmePath,
        ...hostOrg,
      };
    }

    if (project) {
      throw new Error(
        `Value for annotation "${AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION}" was not found`,
      );
    }
  }

  throw new Error('Expected "dev.azure.com" annotations were not found');
}

function getProjectRepo(annotations?: Record<string, string>): {
  project?: string;
  repo?: string;
} {
  const annotation = annotations?.[AZURE_DEVOPS_REPO_ANNOTATION];
  if (!annotation) {
    return { project: undefined, repo: undefined };
  }

  if (annotation.split('/').length === 2) {
    const [project, repo] = annotation.split('/');
    if (project && repo) {
      return { project, repo };
    }
  }

  throw new Error(
    `Invalid value for annotation "${AZURE_DEVOPS_REPO_ANNOTATION}"; expected format is: <project-name>/<repo-name>, found: "${annotation}"`,
  );
}

function getHostOrg(annotations?: Record<string, string>): {
  host?: string;
  org?: string;
} {
  const annotation = annotations?.[AZURE_DEVOPS_HOST_ORG_ANNOTATION];
  if (!annotation) {
    return { host: undefined, org: undefined };
  }

  const segments = annotation.split('/');
  if (segments.length === 2) {
    const [host, org] = segments;
    if (host && org) {
      return { host, org };
    }
  } else if (segments.length === 3) {
    const [host, subpath, org] = segments;
    return { host: `${host}/${subpath}`, org };
  }

  throw new Error(
    `Invalid value for annotation "${AZURE_DEVOPS_HOST_ORG_ANNOTATION}"; expected format is: <host-name>/<organization-name>, found: "${annotation}"`,
  );
}
