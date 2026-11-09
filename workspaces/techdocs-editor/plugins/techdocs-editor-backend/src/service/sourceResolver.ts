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

import { Entity, getEntitySourceLocation } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { parseReferenceAnnotation } from '@backstage/plugin-techdocs-node';
import { TECHDOCS_ANNOTATION } from '@backstage/plugin-techdocs-common';
import { ResolvedSource } from '@backstage-community/plugin-techdocs-editor-common';
import { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const GITHUB_SLUG_ANNOTATION = 'github.com/project-slug';
const GITLAB_SLUG_ANNOTATION = 'gitlab.com/project-slug';

/**
 * Validates that a `docs_dir` value parsed from mkdocs.yml or a URL hash is
 * safe to use as a path prefix when constructing file paths on the VCS provider.
 * Throws InputError if the value could allow path traversal.
 *
 * @internal
 */
function assertSafeDocsDir(docsDir: string): void {
  if (
    docsDir.startsWith('/') ||
    docsDir.startsWith('..') ||
    docsDir.includes('/../') ||
    docsDir.includes('/..') ||
    docsDir === '..' ||
    /\0/.test(docsDir)
  ) {
    throw new InputError(
      `Invalid docs_dir '${docsDir}': must be a relative path and must not escape the repository root.`,
    );
  }
  if (!/^[a-zA-Z0-9_\-./]+$/.test(docsDir)) {
    throw new InputError(
      `Invalid docs_dir '${docsDir}': only alphanumeric characters, hyphens, underscores, dots, and slashes are allowed.`,
    );
  }
}

/**
 * Validates that a candidate path does not escape the allowed root directory.
 * Throws InputError on any path traversal attempt.
 *
 * @internal
 */
function assertSafeLocalPath(candidatePath: string, allowedRoot: string): void {
  const normalizedCandidate = path.normalize(
    path.resolve(allowedRoot, candidatePath),
  );
  const normalizedRoot = path.normalize(allowedRoot);

  if (
    !normalizedCandidate.startsWith(normalizedRoot + path.sep) &&
    normalizedCandidate !== normalizedRoot
  ) {
    throw new InputError(
      `Path '${candidatePath}' resolves outside the allowed source directory. ` +
        `This may be a path traversal attempt.`,
    );
  }
}

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

  const githubSlug = annotations[GITHUB_SLUG_ANNOTATION];
  if (githubSlug) {
    const githubIntegrations = scmIntegrations.github.list();
    if (githubIntegrations.length > 0) {
      const host = githubIntegrations[0].config.host;
      return `https://${host}/${githubSlug}`;
    }
  }

  const gitlabSlug = annotations[GITLAB_SLUG_ANNOTATION];
  if (gitlabSlug) {
    const gitlabIntegrations = scmIntegrations.gitlab.list();
    if (gitlabIntegrations.length > 0) {
      const host = gitlabIntegrations[0].config.host;
      return `https://${host}/${gitlabSlug}`;
    }
  }

  return undefined;
}

const SOURCE_LOCATION_ANNOTATION = 'backstage.io/source-location';
const MANAGED_BY_LOCATION_ANNOTATION = 'backstage.io/managed-by-location';

/**
 * Resolve the base path for a local `dir:` annotation.
 * Priority:
 * 1. backstage.io/source-location annotation (strip file:// prefix)
 * 2. backstage.io/managed-by-location annotation (if file:// type)
 * 3. Backstage backend working directory from config
 *
 * @internal
 */
function resolveLocalBasePath(entity: Entity, config: Config): string {
  const annotations = entity.metadata.annotations ?? {};

  // Try backstage.io/source-location first
  const sourceLocation = annotations[SOURCE_LOCATION_ANNOTATION];
  if (sourceLocation) {
    // Format: url:file:///path/to/entity or file:///path/to/entity
    let locationPath = sourceLocation;
    if (locationPath.startsWith('url:')) {
      locationPath = locationPath.slice(4);
    }
    if (locationPath.startsWith('file://')) {
      return decodeURIComponent(locationPath.slice(7));
    }
  }

  // Try backstage.io/managed-by-location
  const managedBy = annotations[MANAGED_BY_LOCATION_ANNOTATION];
  if (managedBy) {
    // Format: file:/path/to/entity/catalog-info.yaml or url:file:///path
    let locationPath = managedBy;
    if (locationPath.startsWith('url:')) {
      locationPath = locationPath.slice(4);
    }
    if (locationPath.startsWith('file://')) {
      const fullPath = decodeURIComponent(locationPath.slice(7));
      // Return directory containing the catalog file
      return path.dirname(fullPath);
    }
    if (locationPath.startsWith('file:')) {
      const fullPath = decodeURIComponent(locationPath.slice(5));
      return path.dirname(fullPath);
    }
  }

  // Fall back to Backstage working directory
  return config.getOptionalString('backend.workingDirectory') ?? process.cwd();
}

/**
 * Determine the documentation directory for a local `dir:` source.
 *
 * Resolution order:
 * 1. The `docs_dir` declared in an `mkdocs.yml` at the resolved base path.
 * 2. The conventional `docs` subdirectory, if it exists.
 * 3. The base path itself (`.`), so annotations that point directly at a docs
 *    folder (e.g. `dir:./docs`) are not double-nested into `.../docs/docs`.
 *
 * @internal
 */
async function resolveLocalDocsDir(basePath: string): Promise<string> {
  // 1. Prefer docs_dir from mkdocs.yml at the base path.
  try {
    const mkdocsContent = await fs.readFile(
      path.join(basePath, 'mkdocs.yml'),
      'utf-8',
    );
    const parsed = yaml.load(mkdocsContent) as
      | Record<string, unknown>
      | undefined;
    const docsDir = parsed?.docs_dir;
    if (typeof docsDir === 'string' && docsDir.length > 0) {
      assertSafeDocsDir(docsDir);
      return docsDir;
    }
  } catch {
    // No mkdocs.yml or unreadable/invalid — fall through to convention.
  }

  // 2. Fall back to the conventional `docs/` directory if it exists.
  try {
    const stat = await fs.stat(path.join(basePath, 'docs'));
    if (stat.isDirectory()) {
      return 'docs';
    }
  } catch {
    // `docs/` does not exist — treat the base path itself as the docs dir.
  }

  // 3. Otherwise the base path already points at the docs directory.
  return '.';
}

/**
 * Parse a resolved SCM URL into a {@link ResolvedSource} with a vcs entry.
 * Handles GitHub, GitLab, and generic SCM hosts.
 *
 * @internal
 */
function resolveVcsSourceFromUrl(
  target: string,
  scmIntegrations: ScmIntegrationRegistry,
): ResolvedSource {
  const integration = scmIntegrations.byUrl(target);
  if (!integration) {
    throw new InputError(
      `No SCM integration configured for URL: ${target}. ` +
        `Add an entry in integrations.github or integrations.gitlab in app-config.yaml.`,
    );
  }

  const url = new URL(target);
  const pathParts = url.pathname.split('/').filter(Boolean);

  let repoUrl: string;
  let defaultBranch: string | undefined;
  let docsDir: string | undefined;

  if (integration.type === 'github') {
    const owner = pathParts[0];
    const repo = pathParts[1];
    if (!owner || !repo) {
      throw new InputError(
        `Cannot parse owner/repo from GitHub URL: ${target}`,
      );
    }
    repoUrl = `https://github.com/${owner}/${repo}`;
    defaultBranch = pathParts[3]; // after 'tree'
    docsDir = url.hash ? url.hash.slice(1) : undefined;
  } else if (integration.type === 'gitlab') {
    // GitLab project paths can be nested arbitrarily deep
    // (group/sub1/sub2/project). Web URLs always separate the project path
    // from the ref with `/-/`, e.g. `.../project/-/tree/main/docs` or
    // `.../project/-/blob/main/catalog-info.yaml`.
    const separatorIdx = pathParts.indexOf('-');
    const projectParts =
      separatorIdx >= 0 ? pathParts.slice(0, separatorIdx) : pathParts;
    if (projectParts.length < 2) {
      throw new InputError(
        `Cannot parse project path from GitLab URL: ${target}`,
      );
    }
    const refKind = separatorIdx >= 0 ? pathParts[separatorIdx + 1] : undefined;
    repoUrl = `${url.protocol}//${url.host}/${projectParts.join('/')}`;
    defaultBranch =
      refKind === 'tree' || refKind === 'blob'
        ? pathParts[separatorIdx + 2]
        : undefined;
    docsDir = url.hash ? url.hash.slice(1) : undefined;
  } else {
    repoUrl = `${url.protocol}//${url.host}${url.pathname
      .split('/')
      .slice(0, 3)
      .join('/')}`;
    docsDir = undefined;
    defaultBranch = undefined;
  }

  if (docsDir) {
    assertSafeDocsDir(docsDir);
  }

  return { vcs: { repoUrl, docsDir, defaultBranch } };
}

/**
 * Resolve the source location from an entity's techdocs annotation.
 * Returns additive local and/or VCS source information.
 *
 * @internal
 */
export async function resolveSource(
  entity: Entity,
  scmIntegrations: ScmIntegrationRegistry,
  _reader: UrlReaderService,
  config: Config,
): Promise<ResolvedSource> {
  let annotation: ReturnType<typeof parseReferenceAnnotation> | undefined;
  try {
    annotation = parseReferenceAnnotation(TECHDOCS_ANNOTATION, entity);
  } catch {
    // Missing annotation — try slug fallback below
  }

  // Handle dir: annotations — may be local (file://) or remote (url:)
  if (annotation && annotation.type === 'dir') {
    // Detect entity's source location type using the same approach as
    // techdocs-node's transformDirLocation / getEntitySourceLocation.
    // When an entity is loaded from GitHub (catalog provider or url: location),
    // its source-location annotation is a url: type, not file://.  In that
    // case, resolve the dir: target against the remote URL (e.g. "." →
    // repo root) and treat it as a VCS source — matching the behaviour of the
    // official TechDocs DirectoryPreparer.
    let sourceLocation: { type: string; target: string } | undefined;
    try {
      sourceLocation = getEntitySourceLocation(entity);
    } catch {
      // Entity has no source location annotation — fall through to local logic.
    }

    if (
      sourceLocation &&
      sourceLocation.type === 'url' &&
      !sourceLocation.target.startsWith('file://')
    ) {
      // Remote entity (GitHub/GitLab catalog provider): resolve dir: target
      // against the source URL (e.g. "." → repo root) and treat as VCS source,
      // matching the behaviour of the official TechDocs DirectoryPreparer.
      const resolvedUrl = scmIntegrations.resolveUrl({
        url: annotation.target,
        base: sourceLocation.target,
      });
      return resolveVcsSourceFromUrl(resolvedUrl, scmIntegrations);
    }

    // Local entity (file:// source-location or no source-location).
    const dirRelativePath = annotation.target; // e.g., ".", "./docs", "custom-docs"
    const basePath = resolveLocalBasePath(entity, config);

    // Resolve absolute path
    const absolutePath = path.resolve(basePath, dirRelativePath);

    // Security: the dir: target must stay within the entity's source-location
    // root (the folder its catalog-info.yaml was loaded from). Filesystem
    // operations are additionally sandboxed by LocalFsVcsProvider.
    assertSafeLocalPath(absolutePath, basePath);

    const local = {
      basePath: absolutePath,
      docsDir: await resolveLocalDocsDir(absolutePath),
    };

    let vcs: ResolvedSource['vcs'];
    try {
      const slugUrl = resolveFromSlug(entity, scmIntegrations);
      if (slugUrl) {
        vcs = {
          repoUrl: slugUrl,
          docsDir: undefined,
          defaultBranch: undefined,
        };
      }
    } catch {
      vcs = undefined;
    }

    return vcs ? { local, vcs } : { local };
  }

  // Handle url: annotations or missing annotations (try slug fallback)
  if (!annotation || annotation.type !== 'url') {
    const slugUrl = resolveFromSlug(entity, scmIntegrations);
    if (slugUrl) {
      return {
        vcs: {
          repoUrl: slugUrl,
          docsDir: undefined,
          defaultBranch: undefined,
        },
      };
    }
    if (!annotation) {
      throw new InputError(
        `Entity ${entity.metadata.name} is missing the '${TECHDOCS_ANNOTATION}' annotation ` +
          `and has no 'github.com/project-slug' or 'gitlab.com/project-slug' annotation to fall back to.`,
      );
    }
    throw new InputError(
      `TechDocs editor only supports 'url:' or 'dir:' type annotations. Got '${annotation.type}:'. ` +
        `Add a 'github.com/project-slug' or 'gitlab.com/project-slug' annotation, ` +
        `or change the techdocs-ref to 'url:https://github.com/org/repo' or 'dir:.'.`,
    );
  }

  return resolveVcsSourceFromUrl(annotation.target, scmIntegrations);
}

/**
 * Fetch the raw `mkdocs.yml` content for a resolved source, using the local
 * filesystem for `local` sources and the VCS provider's `readFile` for `vcs`
 * sources. Returns `undefined` when no `mkdocs.yml` exists.
 *
 * This is the single place that knows how to read `mkdocs.yml` regardless of
 * source type — every route handler (`/mkdocs`, `/tree`, `/file`,
 * `/submissions`) must go through this (and {@link resolveDocsDirFromMkdocs})
 * so the effective docs directory can never drift between endpoints or
 * between local and remote sources.
 *
 * @internal
 */
export async function fetchMkdocsContent(
  source: ResolvedSource,
  remoteProvider: VcsProvider | undefined,
  branch: string,
): Promise<string | undefined> {
  if (source.local) {
    try {
      return await fs.readFile(
        path.join(source.local.basePath, 'mkdocs.yml'),
        'utf-8',
      );
    } catch {
      return undefined;
    }
  }

  if (!remoteProvider) {
    return undefined;
  }

  try {
    const result = await remoteProvider.readFile({
      repoUrl: source.vcs!.repoUrl,
      ref: branch,
      filePath: 'mkdocs.yml',
    });
    return result.content;
  } catch (err: unknown) {
    // Only ignore a missing mkdocs.yml — rethrow network, auth, or other errors.
    if (
      !err ||
      typeof err !== 'object' ||
      (err as { name?: string }).name !== 'NotFoundError'
    ) {
      throw err;
    }
    return undefined;
  }
}

/**
 * Parse `mkdocs.yml` content into a plain object. Returns `{}` when there is
 * no content (missing file) or the content fails to parse as a mapping.
 *
 * @internal
 */
export function parseMkdocsContent(
  mkdocsContent: string | undefined,
): Record<string, unknown> {
  if (!mkdocsContent) {
    return {};
  }
  return (yaml.load(mkdocsContent) as Record<string, unknown>) ?? {};
}

/**
 * Resolve the effective docs directory from parsed `mkdocs.yml` content,
 * falling back to `fallback` (the source's pre-resolved `docsDir`) when
 * `mkdocs.yml` has no `docs_dir` key. Validates any `docs_dir` override via
 * {@link assertSafeDocsDir} before it is used to build file paths.
 *
 * @internal
 */
export function resolveDocsDirFromMkdocs(
  parsedMkdocs: Record<string, unknown>,
  fallback: string,
): string {
  const docsDir = parsedMkdocs.docs_dir;
  if (typeof docsDir === 'string' && docsDir.length > 0) {
    assertSafeDocsDir(docsDir);
    return docsDir;
  }
  return fallback;
}
