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

import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  AuthService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  UrlReaderService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { InputError, NotFoundError, NotAllowedError } from '@backstage/errors';
import { posix as posixPath } from 'node:path';
import path from 'node:path';
import { ScmIntegrations } from '@backstage/integration';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import {
  techdocsEditorReadPermission,
  techdocsEditorWritePermission,
  SubmitEditsRequest,
  FileConflict,
} from '@backstage-community/plugin-techdocs-editor-common';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import { VcsProviderRegistry } from './VcsProviderRegistry';
import { LocalFsVcsProvider } from './LocalFsVcsProvider';
import {
  resolveSource,
  fetchMkdocsContent,
  parseMkdocsContent,
  resolveDocsDirFromMkdocs,
} from './sourceResolver';
import { VcsProvider } from '@backstage-community/plugin-techdocs-editor-node';

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const DEFAULT_SUBMISSION_BODY_LIMIT = '25mb';

/**
 * Validates that a file path supplied by the client is relative, contains only
 * safe characters, and cannot escape the docs directory via path traversal.
 * Throws InputError on any violation.
 */
function assertSafeDocPath(filePath: string): void {
  // Block null bytes
  if (/\0/.test(filePath)) {
    throw new InputError('Invalid file path: null bytes are not allowed.');
  }
  // Whitelist: only alphanumeric, hyphens, underscores, dots, slashes, and @ (for scoped npm packages)
  if (!/^[a-zA-Z0-9_\-@./]+$/.test(filePath)) {
    throw new InputError(
      'Invalid file path: only alphanumeric characters, hyphens, underscores, dots, slashes, and @ are allowed.',
    );
  }
  const normalized = posixPath.normalize(filePath);
  if (normalized.startsWith('..') || posixPath.isAbsolute(normalized)) {
    throw new InputError(
      'Invalid file path: must be relative and must not escape the docs directory.',
    );
  }
}

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  reader: UrlReaderService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  auth: AuthService;
  catalog: CatalogApi;
  providerRegistry: VcsProviderRegistry;
  permissions: PermissionsService;
};

export async function createRouter(
  opts: RouterOptions,
): Promise<express.RequestHandler> {
  const {
    logger,
    config,
    reader,
    httpAuth,
    userInfo,
    auth,
    catalog,
    providerRegistry,
    permissions,
  } = opts;

  const scmIntegrations = ScmIntegrations.fromConfig(config);
  // eslint-disable-next-line new-cap
  const router = Router();
  router.use(
    express.json({
      limit:
        config.getOptionalString('techdocsEditor.requestBodyLimit') ??
        DEFAULT_SUBMISSION_BODY_LIMIT,
    }),
  );

  // ─── Health ──────────────────────────────────────────────────────────────
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ─── Helper: load entity with auth ───────────────────────────────────────
  async function loadEntity(
    req: Request,
    namespace: string,
    kind: string,
    name: string,
  ) {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'catalog',
    });
    const entity = await catalog.getEntityByRef(
      { namespace, kind, name },
      { token },
    );
    if (!entity) {
      throw new NotFoundError(`Entity ${kind}:${namespace}/${name} not found`);
    }

    // Follow backstage.io/techdocs-entity indirection so the editor can resolve
    // the source from the referenced entity rather than from this entity.
    const techdocsEntityRef =
      entity.metadata.annotations?.['backstage.io/techdocs-entity'];
    let docEntity = entity;
    if (techdocsEntityRef) {
      const refParsed = parseEntityRef(techdocsEntityRef, {
        defaultNamespace: entity.metadata.namespace ?? 'default',
        defaultKind: 'Component',
      });
      const referenced = await catalog.getEntityByRef(refParsed, { token });
      if (!referenced) {
        throw new NotFoundError(
          `Entity referenced by 'backstage.io/techdocs-entity' annotation not found: ${techdocsEntityRef}`,
        );
      }
      docEntity = referenced;
    }

    return { entity, docEntity, credentials };
  }

  // ─── Helper: authorize ───────────────────────────────────────────────────
  async function authorize(
    req: Request,
    permission: typeof techdocsEditorReadPermission,
  ) {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const decision = (
      await permissions.authorize([{ permission }], { credentials })
    )[0];
    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError('Permission denied');
    }
  }

  function getVcsProviderOrThrow(repoUrl: string): VcsProvider {
    const provider = providerRegistry.getForUrl(repoUrl);
    if (provider) {
      return provider;
    }

    const registeredProviders = providerRegistry.all().map(p => p.id);
    throw new InputError(
      `No VcsProvider for ${repoUrl}. ` +
        `Registered providers: ${
          registeredProviders.length > 0
            ? registeredProviders.join(', ')
            : 'none'
        }. ` +
        `If you use built-in providers, add backend.add(import('@backstage-community/plugin-techdocs-editor-backend/alpha')) to your backend startup.`,
    );
  }

  // ─── GET /sources/:namespace/:kind/:name/mkdocs ───────────────────────────
  router.get(
    '/sources/:namespace/:kind/:name/mkdocs',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorReadPermission);
      const { namespace, kind, name } = req.params;
      const { docEntity } = await loadEntity(req, namespace, kind, name);

      const source = await resolveSource(
        docEntity,
        scmIntegrations,
        reader,
        config,
      );

      let repoUrl: string;
      let branch: string;
      let resolvedDocsDir: string;
      let vcsProvider: VcsProvider | undefined;

      if (source.local) {
        // Local filesystem source
        repoUrl = `file://${source.local.basePath}`;
        branch = 'local';
        resolvedDocsDir = source.local.docsDir;
      } else {
        // VCS source
        repoUrl = source.vcs!.repoUrl;
        vcsProvider = getVcsProviderOrThrow(repoUrl);

        branch =
          source.vcs!.defaultBranch ??
          (await vcsProvider.getDefaultBranch(repoUrl));
        resolvedDocsDir = source.vcs!.docsDir ?? 'docs';
      }

      const rawMkdocsContent = await fetchMkdocsContent(
        source,
        vcsProvider,
        branch,
      );
      const parsed = parseMkdocsContent(rawMkdocsContent);
      resolvedDocsDir = resolveDocsDirFromMkdocs(parsed, resolvedDocsDir);

      res.json({
        site_name: parsed.site_name ?? name,
        docs_dir: resolvedDocsDir,
        repo_url: parsed.repo_url ?? repoUrl,
        edit_uri: parsed.edit_uri ?? `edit/${branch}/`,
        nav: parsed.nav ?? null,
        canSaveLocally: !!source.local,
        canCreatePullRequest: !!source.vcs,
      });
    },
  );

  // ─── GET /sources/:namespace/:kind/:name/tree ────────────────────────────
  router.get(
    '/sources/:namespace/:kind/:name/tree',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorReadPermission);
      const { namespace, kind, name } = req.params;
      const { docEntity } = await loadEntity(req, namespace, kind, name);

      const source = await resolveSource(
        docEntity,
        scmIntegrations,
        reader,
        config,
      );

      let repoUrl: string;
      let branch: string;
      let resolvedDocsDir: string;
      let vcsProvider: VcsProvider | undefined;

      if (source.local) {
        repoUrl = `file://${source.local.basePath}`;
        branch = 'local';
        resolvedDocsDir = source.local.docsDir;
      } else {
        repoUrl = source.vcs!.repoUrl;
        vcsProvider = getVcsProviderOrThrow(repoUrl);

        branch =
          source.vcs!.defaultBranch ??
          (await vcsProvider.getDefaultBranch(repoUrl));
        resolvedDocsDir = source.vcs!.docsDir ?? 'docs';
      }

      // Resolve the effective docs directory from mkdocs.yml the same way for
      // every source type, so `/tree` never drifts from what `/mkdocs` reports.
      const mkdocsContent = await fetchMkdocsContent(
        source,
        vcsProvider,
        branch,
      );
      resolvedDocsDir = resolveDocsDirFromMkdocs(
        parseMkdocsContent(mkdocsContent),
        resolvedDocsDir,
      );

      const provider: VcsProvider = source.local
        ? new LocalFsVcsProvider()
        : vcsProvider!;
      const files = await provider.listFiles({
        repoUrl,
        ref: branch,
        dirPath: resolvedDocsDir,
      });

      if (files.length === 0) {
        logger.warn(
          `No documentation files found for ${kind}:${namespace}/${name} ` +
            `(source=${
              source.local ? 'local' : 'vcs'
            }, branch=${branch}, docsDir='${resolvedDocsDir}', repo=${repoUrl}). ` +
            `Verify the entity's 'backstage.io/techdocs-ref' annotation and that the docs directory exists.`,
        );
      }

      res.json({
        files,
        docsDir: resolvedDocsDir,
        branch,
        canSaveLocally: !!source.local,
        canCreatePullRequest: !!source.vcs,
      });
    },
  );

  // ─── GET /sources/:namespace/:kind/:name/file ────────────────────────────
  router.get(
    '/sources/:namespace/:kind/:name/file',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorReadPermission);
      const { namespace, kind, name } = req.params;
      const filePath = req.query.path as string | undefined;
      if (!filePath) {
        throw new InputError('Query parameter "path" is required');
      }
      assertSafeDocPath(filePath);

      const { docEntity } = await loadEntity(req, namespace, kind, name);

      const source = await resolveSource(
        docEntity,
        scmIntegrations,
        reader,
        config,
      );

      let repoUrl: string;
      let branch: string;
      let resolvedDocsDir: string;
      let provider: VcsProvider;
      let vcsProvider: VcsProvider | undefined;

      if (source.local) {
        repoUrl = `file://${source.local.basePath}`;
        branch = 'local';
        resolvedDocsDir = source.local.docsDir;

        provider = new LocalFsVcsProvider();
      } else {
        repoUrl = source.vcs!.repoUrl;
        resolvedDocsDir = source.vcs!.docsDir ?? 'docs';

        vcsProvider = getVcsProviderOrThrow(repoUrl);

        branch =
          (req.query.branch as string | undefined) ??
          source.vcs!.defaultBranch ??
          (await vcsProvider.getDefaultBranch(repoUrl));

        provider = vcsProvider;
      }

      // Resolve the effective docs directory from mkdocs.yml the same way for
      // every source type and every route, so `/file` never drifts from
      // what `/tree` and `/mkdocs` report.
      const mkdocsContent = await fetchMkdocsContent(
        source,
        vcsProvider,
        branch,
      );
      resolvedDocsDir = resolveDocsDirFromMkdocs(
        parseMkdocsContent(mkdocsContent),
        resolvedDocsDir,
      );

      const fullPath = `${resolvedDocsDir}/${filePath}`;

      const result = await provider.readFile({
        repoUrl,
        ref: branch,
        filePath: fullPath,
      });

      res.json({
        content: result.content,
        encoding: result.encoding,
        mimeType: result.mimeType,
        etag: result.etag,
        path: filePath,
        branch,
      });
    },
  );

  // ─── POST /submissions/:namespace/:kind/:name ─────────────────────────────
  router.post(
    '/submissions/:namespace/:kind/:name',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorWritePermission);
      const { namespace, kind, name } = req.params;

      const body = req.body as SubmitEditsRequest;
      if (!body.files?.length) {
        throw new InputError('No files provided');
      }
      if (!body.commitMessage) {
        throw new InputError('commitMessage is required');
      }
      if (
        body.action !== 'save-locally' &&
        body.action !== 'create-pull-request'
      ) {
        throw new InputError(
          'action must be either "save-locally" or "create-pull-request"',
        );
      }
      // Validate every file path before touching any VCS provider
      for (const file of body.files) {
        if (!file.path) {
          throw new InputError('Each file must have a path.');
        }
        assertSafeDocPath(file.path);
        if (file.content === null) {
          continue;
        }
        if (file.encoding === 'base64') {
          const payloadBytes = Buffer.byteLength(file.content, 'base64');
          if (payloadBytes > MAX_IMAGE_UPLOAD_BYTES) {
            throw new InputError(
              `File ${file.path} exceeds the 10MB upload limit.`,
            );
          }
        }
      }

      const { entity, docEntity, credentials } = await loadEntity(
        req,
        namespace,
        kind,
        name,
      );
      const user = await userInfo.getUserInfo(credentials);

      const source = await resolveSource(
        docEntity,
        scmIntegrations,
        reader,
        config,
      );

      if (body.action === 'save-locally' && !source.local) {
        throw new InputError(
          'This entity has no local filesystem source — Save Locally is unavailable.',
        );
      }

      if (body.action === 'create-pull-request' && !source.vcs) {
        throw new InputError(
          'This entity has no configured VCS repository — Create Pull Request is unavailable.',
        );
      }

      // Determine repoUrl and resolvedDocsDir based on requested action
      let repoUrl: string;
      let resolvedDocsDir: string;

      if (body.action === 'save-locally') {
        repoUrl = `file://${source.local!.basePath}`;
        resolvedDocsDir = source.local!.docsDir;
      } else {
        // VCS source — require prTitle
        if (!body.prTitle) {
          throw new InputError('prTitle is required for VCS submissions');
        }
        repoUrl = source.vcs!.repoUrl;
        resolvedDocsDir = source.vcs!.docsDir ?? 'docs';
      }

      const provider: VcsProvider =
        body.action === 'save-locally'
          ? new LocalFsVcsProvider()
          : (() => {
              return getVcsProviderOrThrow(repoUrl);
            })();

      const baseBranch =
        body.baseBranch ??
        (body.action === 'create-pull-request'
          ? source.vcs!.defaultBranch
          : undefined) ??
        (await provider.getDefaultBranch(repoUrl));

      // Resolve the effective docs directory from mkdocs.yml the same way for
      // every source type and every route, so a submission never writes files
      // to a different docsDir than what `/tree` and `/file` last showed.
      const mkdocsContent = await fetchMkdocsContent(
        source,
        body.action === 'create-pull-request' ? provider : undefined,
        baseBranch,
      );
      resolvedDocsDir = resolveDocsDirFromMkdocs(
        parseMkdocsContent(mkdocsContent),
        resolvedDocsDir,
      );

      // Conflict detection — re-read each file and compare etags
      const conflicts: FileConflict[] = [];
      for (const file of body.files) {
        try {
          const current = await provider.readFile({
            repoUrl,
            ref: baseBranch,
            filePath: `${resolvedDocsDir}/${file.path}`,
          });
          if (current.etag !== file.etag) {
            conflicts.push({
              path: file.path,
              userEtag: file.etag,
              currentEtag: current.etag,
            });
          }
        } catch {
          // New file — no conflict
        }
      }

      if (conflicts.length > 0) {
        res.status(409).json({
          error: 'Conflicts detected',
          conflicts,
        });
        return;
      }

      // Build branch name: techdocs-editor/<username>/<timestamp>-<random>
      const userLogin = parseEntityRef(user.userEntityRef).name;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).slice(2, 7);
      const headBranch = `techdocs-editor/${userLogin}/${timestamp}-${randomSuffix}`;

      // Build file map
      const files = new Map<
        string,
        {
          content: string;
          encoding?: 'utf8' | 'base64';
          mimeType?: string;
        } | null
      >();
      for (const file of body.files) {
        files.set(
          `${resolvedDocsDir}/${file.path}`,
          file.content === null
            ? null
            : {
                content: file.content,
                encoding: file.encoding,
                mimeType: file.mimeType,
              },
        );
      }

      const authorName =
        config.getOptionalString('techdocsEditor.defaultAuthorName') ??
        userLogin;
      const authorEmail =
        config.getOptionalString('techdocsEditor.defaultAuthorEmail') ??
        'techdocs-editor@backstage.io';

      const result = await provider.openPullRequest({
        repoUrl,
        headBranch,
        baseBranch,
        title: body.prTitle ?? 'TechDocs update',
        description: body.prDescription,
        files,
        commitMessage: body.commitMessage,
        authorName,
        authorEmail,
        draft: body.draft ?? false,
      });

      // Handle local save vs VCS PR differently
      if (body.action === 'save-locally') {
        const savedPath = path.join(source.local!.basePath, resolvedDocsDir);
        logger.info(
          `TechDocs editor: saved ${
            body.files.length
          } files locally for ${stringifyEntityRef(entity)} at ${savedPath}`,
        );

        res.json({
          savedLocally: true,
          savedCount: body.files.length,
          savedPath,
        });
        return;
      }

      logger.info(
        `TechDocs editor: opened PR ${result.number} for ${stringifyEntityRef(
          entity,
        )}: ${result.url}`,
      );

      res.json({
        pullRequestUrl: result.url,
        pullRequestNumber: result.number,
        headBranch,
      });
    },
  );

  return router as unknown as express.RequestHandler;
}
