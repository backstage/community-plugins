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
import path from 'path';
import { InputError } from '@backstage/errors';
import multer from 'multer';
import { MAX_FILE_SIZE_BYTES } from '../constants';
import { createWithRoute } from './routeWrapper';
import type { AdminRouteDeps } from './adminRouteTypes';

const ALLOWED_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.pdf',
  '.json',
  '.yaml',
  '.yml',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(
        new InputError(
          `Unsupported file type: ${ext}. Allowed: ${[
            ...ALLOWED_EXTENSIONS,
          ].join(', ')}`,
        ),
      );
      return;
    }
    cb(null, true);
  },
});

export function registerAdminDocumentRoutes(
  router: import('express').Router,
  deps: AdminRouteDeps,
): void {
  const { provider, logger, sendRouteError } = deps;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.post(
    '/admin/documents',
    withRoute(
      'POST /admin/documents',
      'Failed to upload document',
      async (req, res) => {
        if (!provider.rag?.uploadDocument) {
          res.status(501).json({
            success: false,
            error: 'Document upload not supported by current provider',
          });
          return;
        }

        try {
          await new Promise<void>((resolve, reject) => {
            const multerMiddleware = upload.single('file');
            (multerMiddleware as unknown as import('express').RequestHandler)(
              req,
              res,
              (err: unknown) => {
                if (err) reject(err);
                else resolve();
              },
            );
          });
        } catch (multerErr) {
          if (
            multerErr instanceof multer.MulterError &&
            multerErr.code === 'LIMIT_FILE_SIZE'
          ) {
            sendRouteError(
              res,
              multerErr,
              'File too large',
              `File exceeds maximum size of ${
                MAX_FILE_SIZE_BYTES / 1024 / 1024
              }MB`,
              { success: false },
              400,
            );
            return;
          }
          throw multerErr;
        }

        if (!req.file) {
          throw new InputError('No file provided. Use multipart field "file".');
        }

        const targetStoreId =
          typeof req.query.vectorStoreId === 'string'
            ? req.query.vectorStoreId
            : undefined;

        const existingDocs = await provider.rag.listDocuments(targetStoreId);
        const duplicate = existingDocs.find(
          d => d.fileName === req.file!.originalname,
        );
        if (duplicate) {
          const replaceMode = req.query.replace === 'true';
          if (!replaceMode) {
            res.status(409).json({
              success: false,
              error: `A file named "${req.file.originalname}" already exists`,
              existingFile: duplicate,
              hint: 'Add ?replace=true to overwrite, or delete the existing file first.',
            });
            return;
          }
          if (!provider.rag.deleteDocument) {
            res.status(501).json({
              success: false,
              error:
                'Replace mode requires document deletion, which is not supported by the current provider.',
            });
            return;
          }
          await provider.rag.deleteDocument(duplicate.id, targetStoreId);
          logger.info(
            `Replaced existing document: ${duplicate.id} (${duplicate.fileName})`,
          );
        }

        const result = await provider.rag.uploadDocument(
          req.file.originalname,
          req.file.buffer,
          targetStoreId,
        );

        res.json({
          success: true,
          ...result,
          replaced: !!duplicate,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.delete(
    '/admin/documents/:id',
    withRoute(
      req => `DELETE /admin/documents/${req.params.id}`,
      'Failed to delete document',
      async (req, res) => {
        if (!provider.rag?.deleteDocument) {
          res.status(501).json({
            success: false,
            error: 'Document deletion not supported by current provider',
          });
          return;
        }

        const { id } = req.params;
        if (!id || id.trim().length === 0) {
          throw new InputError('Document ID is required');
        }

        const deleteStoreId =
          typeof req.query.vectorStoreId === 'string'
            ? req.query.vectorStoreId
            : undefined;
        const result = await provider.rag.deleteDocument(id, deleteStoreId);
        res.json({
          ...result,
          documentId: id,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
