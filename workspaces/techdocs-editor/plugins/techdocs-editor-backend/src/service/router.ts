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
import { ScmIntegrations } from '@backstage/integration';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  techdocsEditorReadPermission,
  techdocsEditorWritePermission,
  SubmitEditsRequest,
  FileConflict,
} from '@backstage-community/plugin-techdocs-editor-common';
import express, { Request, Response } from 'express';
import Router from 'express-promise-router';
import yaml from 'js-yaml';
import { VcsProviderRegistry } from './VcsProviderRegistry';
import { resolveSourceUrl } from './sourceResolver';

/**
 * Validates that a file path supplied by the client is relative, contains only
 * safe characters, and cannot escape the docs directory via path traversal.
 * Throws InputError on any violation.
 */
function assertSafeDocPath(filePath: string): void {
  // Block absolute paths, hidden-file prefixes, and any form of path traversal
  if (
    filePath.startsWith('/') ||
    filePath.startsWith('..') ||
    filePath.includes('/../') ||
    filePath.includes('/..') ||
    filePath === '..' ||
    /\0/.test(filePath) // null bytes
  ) {
    throw new InputError(
      'Invalid file path: must be relative and must not escape the docs directory.',
    );
  }
  // Whitelist: only alphanumeric, hyphens, underscores, dots, slashes
  if (!/^[a-zA-Z0-9_\-./]+$/.test(filePath)) {
    throw new InputError(
      'Invalid file path: only alphanumeric characters, hyphens, underscores, dots, and slashes are allowed.',
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
  router.use(express.json());

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
    return { entity, credentials };
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

  // ─── GET /sources/:namespace/:kind/:name/mkdocs ───────────────────────────
  // Returns parsed subset of mkdocs.yml: site_name, docs_dir, repo_url, edit_uri, nav
  router.get(
    '/sources/:namespace/:kind/:name/mkdocs',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorReadPermission);
      const { namespace, kind, name } = req.params;
      const { entity } = await loadEntity(req, namespace, kind, name);

      const { repoUrl, docsDir, defaultBranch } = await resolveSourceUrl(
        entity,
        scmIntegrations,
        reader,
      );

      const provider = providerRegistry.getForUrl(repoUrl);
      if (!provider) {
        throw new InputError(
          `No VcsProvider registered that can handle repo: ${repoUrl}`,
        );
      }

      const branch =
        defaultBranch ?? (await provider.getDefaultBranch(repoUrl));
      let mkdocsContent = '{}';
      try {
        const result = await provider.readFile({
          repoUrl,
          ref: branch,
          filePath: 'mkdocs.yml',
        });
        mkdocsContent = result.content;
      } catch {
        // mkdocs.yml missing — return sensible defaults
      }

      const parsed =
        (yaml.load(mkdocsContent) as Record<string, unknown>) ?? {};
      res.json({
        site_name: parsed.site_name ?? name,
        docs_dir: parsed.docs_dir ?? docsDir ?? 'docs',
        repo_url: parsed.repo_url ?? repoUrl,
        edit_uri: parsed.edit_uri ?? `edit/${branch}/`,
        nav: parsed.nav ?? null,
      });
    },
  );

  // ─── GET /sources/:namespace/:kind/:name/tree ────────────────────────────
  // Returns a list of file paths relative to docs_dir
  router.get(
    '/sources/:namespace/:kind/:name/tree',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorReadPermission);
      const { namespace, kind, name } = req.params;
      const { entity } = await loadEntity(req, namespace, kind, name);

      const { repoUrl, docsDir, defaultBranch } = await resolveSourceUrl(
        entity,
        scmIntegrations,
        reader,
      );

      const provider = providerRegistry.getForUrl(repoUrl);
      if (!provider) {
        throw new InputError(`No VcsProvider for ${repoUrl}`);
      }

      const branch =
        defaultBranch ?? (await provider.getDefaultBranch(repoUrl));
      const resolvedDocsDir = docsDir ?? 'docs';
      const files = await provider.listFiles({
        repoUrl,
        ref: branch,
        dirPath: resolvedDocsDir,
      });

      res.json({ files, docsDir: resolvedDocsDir, branch });
    },
  );

  // ─── GET /sources/:namespace/:kind/:name/file ────────────────────────────
  // Query: ?path=getting-started.md&branch=main
  // Returns { content, etag }
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

      const { entity } = await loadEntity(req, namespace, kind, name);

      const { repoUrl, docsDir, defaultBranch } = await resolveSourceUrl(
        entity,
        scmIntegrations,
        reader,
      );

      const provider = providerRegistry.getForUrl(repoUrl);
      if (!provider) {
        throw new InputError(`No VcsProvider for ${repoUrl}`);
      }

      const branch =
        (req.query.branch as string | undefined) ??
        defaultBranch ??
        (await provider.getDefaultBranch(repoUrl));

      const resolvedDocsDir = docsDir ?? 'docs';
      const fullPath = `${resolvedDocsDir}/${filePath}`;

      const { content, etag } = await provider.readFile({
        repoUrl,
        ref: branch,
        filePath: fullPath,
      });

      res.json({ content, etag, path: filePath, branch });
    },
  );

  // ─── POST /submissions/:namespace/:kind/:name ─────────────────────────────
  // Body: SubmitEditsRequest
  // Returns: SubmitEditsResponse
  router.post(
    '/submissions/:namespace/:kind/:name',
    async (req: Request, res: Response) => {
      await authorize(req, techdocsEditorWritePermission);
      const { namespace, kind, name } = req.params;

      const body = req.body as SubmitEditsRequest;
      if (!body.files?.length) {
        throw new InputError('No files provided');
      }
      if (!body.prTitle) {
        throw new InputError('prTitle is required');
      }
      if (!body.commitMessage) {
        throw new InputError('commitMessage is required');
      }
      // Validate every file path before touching any VCS provider
      for (const file of body.files) {
        if (!file.path) {
          throw new InputError('Each file must have a path.');
        }
        assertSafeDocPath(file.path);
      }

      const { entity, credentials } = await loadEntity(
        req,
        namespace,
        kind,
        name,
      );
      const user = await userInfo.getUserInfo(credentials);

      const { repoUrl, docsDir, defaultBranch } = await resolveSourceUrl(
        entity,
        scmIntegrations,
        reader,
      );

      const provider = providerRegistry.getForUrl(repoUrl);
      if (!provider) {
        throw new InputError(`No VcsProvider for ${repoUrl}`);
      }

      const resolvedDocsDir = docsDir ?? 'docs';
      const baseBranch =
        body.baseBranch ??
        defaultBranch ??
        (await provider.getDefaultBranch(repoUrl));

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

      // Build branch name: techdocs-editor/<username>/<timestamp>
      const userLogin =
        (user as any)?.userEntityRef?.split('/').pop() ?? 'user';
      const timestamp = Date.now();
      const headBranch = `techdocs-editor/${userLogin}/${timestamp}`;

      // Build file map
      const files = new Map<string, string | null>();
      for (const file of body.files) {
        files.set(`${resolvedDocsDir}/${file.path}`, file.content);
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
        title: body.prTitle,
        description: body.prDescription,
        files,
        commitMessage: body.commitMessage,
        authorName,
        authorEmail,
        draft: body.draft ?? false,
      });

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
