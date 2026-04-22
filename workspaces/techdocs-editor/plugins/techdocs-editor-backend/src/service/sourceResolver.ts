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
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { parseReferenceAnnotation } from '@backstage/plugin-techdocs-node';
import { TECHDOCS_ANNOTATION } from '@backstage/plugin-techdocs-common';

const GITHUB_SLUG_ANNOTATION = 'github.com/project-slug';
const GITLAB_SLUG_ANNOTATION = 'gitlab.com/project-slug';

/**
 * Attempt to derive a repo URL from the entity's SCM project-slug annotations
 * (github.com/project-slug or gitlab.com/project-slug) when techdocs-ref is
 * not a remote `url:` annotation. Returns undefined if no usable slug is found.
 */
function resolveFromSlug(
  entity: Entity,
  scmIntegrations: ScmIntegrationRegistry,
): string | undefined {
  const annotations = entity.metadata.annotations ?? {};

  // GitHub slug — match against every configured GitHub integration host
  const githubSlug = annotations[GITHUB_SLUG_ANNOTATION];
  if (githubSlug) {
    const githubIntegrations = scmIntegrations.github.list();
    if (githubIntegrations.length > 0) {
      const host = githubIntegrations[0].config.host; // e.g. 'github.com' or 'ghe.corp.com'
      return `https://${host}/${githubSlug}`;
    }
  }

  // GitLab slug — match against every configured GitLab integration host
  const gitlabSlug = annotations[GITLAB_SLUG_ANNOTATION];
  if (gitlabSlug) {
    const gitlabIntegrations = scmIntegrations.gitlab.list();
    if (gitlabIntegrations.length > 0) {
      const host = gitlabIntegrations[0].config.host; // e.g. 'gitlab.com' or 'gitlab.corp.com'
      return `https://${host}/${gitlabSlug}`;
    }
  }

  return undefined;
}

/**
 * Resolve the source repository URL, docs directory, and default branch
 * from an entity's techdocs annotation.
 *
 * Prefers `url:` type annotations. When the annotation is `dir:` (local dev)
 * or missing, falls back to the `github.com/project-slug` or
 * `gitlab.com/project-slug` annotations that Backstage auto-populates for most
 * catalog entities — so no annotation changes are needed in those repos.
 *
 * @internal
 */
export async function resolveSourceUrl(
  entity: Entity,
  scmIntegrations: ScmIntegrationRegistry,
  _reader: UrlReaderService,
): Promise<{
  repoUrl: string;
  docsDir: string | undefined;
  defaultBranch: string | undefined;
}> {
  let annotation: ReturnType<typeof parseReferenceAnnotation> | undefined;
  try {
    annotation = parseReferenceAnnotation(TECHDOCS_ANNOTATION, entity);
  } catch {
    // Missing annotation — try slug fallback below
  }

  // If annotation is not a remote URL, attempt to resolve from project-slug
  if (!annotation || annotation.type !== 'url') {
    const slugUrl = resolveFromSlug(entity, scmIntegrations);
    if (slugUrl) {
      return { repoUrl: slugUrl, docsDir: undefined, defaultBranch: undefined };
    }
    if (!annotation) {
      throw new InputError(
        `Entity ${entity.metadata.name} is missing the '${TECHDOCS_ANNOTATION}' annotation ` +
          `and has no 'github.com/project-slug' or 'gitlab.com/project-slug' annotation to fall back to.`,
      );
    }
    throw new InputError(
      `TechDocs editor only supports 'url:' type annotations. Got '${annotation.type}:'. ` +
        `Add a 'github.com/project-slug' or 'gitlab.com/project-slug' annotation, ` +
        `or change the techdocs-ref to 'url:https://github.com/org/repo'.`,
    );
  }

  const target = annotation.target;
  const integration = scmIntegrations.byUrl(target);
  if (!integration) {
    throw new InputError(
      `No SCM integration configured for URL: ${target}. ` +
        `Add an entry in integrations.github or integrations.gitlab in app-config.yaml.`,
    );
  }

  // Parse owner/repo from the tree URL
  // GitHub format: https://github.com/org/repo/tree/branch
  // GitLab format: https://gitlab.com/org/repo/-/tree/branch
  const url = new URL(target);
  const pathParts = url.pathname.split('/').filter(Boolean);

  let repoUrl: string;
  let defaultBranch: string | undefined;
  let docsDir: string | undefined;

  if (integration.type === 'github') {
    // pathParts: ['org', 'repo', 'tree', 'branch'] or ['org', 'repo']
    const owner = pathParts[0];
    const repo = pathParts[1];
    if (!owner || !repo) {
      throw new InputError(
        `Cannot parse owner/repo from GitHub URL: ${target}`,
      );
    }
    repoUrl = `https://github.com/${owner}/${repo}`;
    defaultBranch = pathParts[3]; // after 'tree'
    // Docs may be in a subdirectory if there's a path fragment (#)
    // e.g. url:https://github.com/org/repo/tree/main#docs
    docsDir = url.hash ? url.hash.slice(1) : undefined;
  } else if (integration.type === 'gitlab') {
    // pathParts: ['org', 'repo', '-', 'tree', 'branch'] or ['org/sub', 'repo']
    const treeIdx = pathParts.indexOf('tree');
    const repo =
      treeIdx > 1
        ? pathParts.slice(0, treeIdx - 1).join('/')
        : pathParts.slice(0, 2).join('/');
    repoUrl = `${url.protocol}//${url.host}/${repo}`;
    defaultBranch = treeIdx >= 0 ? pathParts[treeIdx + 1] : undefined;
    docsDir = url.hash ? url.hash.slice(1) : undefined;
  } else {
    // Generic fallback — strip to repo root
    repoUrl = `${url.protocol}//${url.host}${url.pathname
      .split('/')
      .slice(0, 3)
      .join('/')}`;
    docsDir = undefined;
    defaultBranch = undefined;
  }

  return { repoUrl, docsDir, defaultBranch };
}
