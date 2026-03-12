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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import type { LlamaStackClient } from './LlamaStackClient';
import {
  FileFormat,
  type DocumentInfo,
  type LlamaStackConfig,
  type LlamaStackFileResponse,
  type LlamaStackVectorStoreFileResponse,
} from '../../types';
import { VECTOR_STORE_PAGE_SIZE } from '../../constants';
import { toErrorMessage, detectFileFormat } from '../../services/utils';

export interface DocumentListerDeps {
  client: LlamaStackClient;
  config: LlamaStackConfig;
  logger: LoggerService;
}

/**
 * Fetch all files from vector store with pagination.
 * Handles pagination automatically to retrieve all files.
 *
 * @param deps - Client, config, and logger
 * @param vectorStoreId - Optional vector store ID (defaults to config.vectorStoreIds[0])
 */
export async function fetchAllVectorStoreFiles(
  deps: DocumentListerDeps,
  vectorStoreId?: string,
): Promise<LlamaStackVectorStoreFileResponse[]> {
  const { client, config } = deps;
  const targetId = vectorStoreId ?? config.vectorStoreIds[0];
  if (!targetId) {
    throw new InputError('No vector store configured — cannot list files');
  }
  const allFiles: LlamaStackVectorStoreFileResponse[] = [];
  let after: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const url = after
      ? `/v1/openai/v1/vector_stores/${targetId}/files?limit=${VECTOR_STORE_PAGE_SIZE}&after=${after}`
      : `/v1/openai/v1/vector_stores/${targetId}/files?limit=${VECTOR_STORE_PAGE_SIZE}`;

    const response = await client.request<
      | {
          data?: LlamaStackVectorStoreFileResponse[];
          has_more?: boolean;
        }
      | LlamaStackVectorStoreFileResponse[]
    >(url, { method: 'GET' });

    const files = Array.isArray(response) ? response : response.data || [];
    allFiles.push(...files);

    if (Array.isArray(response)) {
      hasMore = files.length === VECTOR_STORE_PAGE_SIZE;
    } else {
      hasMore = response.has_more ?? false;
    }

    if (hasMore && files.length > 0) {
      after = files[files.length - 1].id;
    }
  }

  return allFiles;
}

/**
 * List all documents in the vector store.
 * Uses vector store files endpoint first (source of truth), falls back to Files API.
 * Implements pagination to fetch all documents when count exceeds page size.
 *
 * @param deps - Client, config, and logger
 * @param vectorStoreId - Optional vector store ID (defaults to config.vectorStoreIds[0])
 */
export async function listDocuments(
  deps: DocumentListerDeps,
  vectorStoreId?: string,
): Promise<DocumentInfo[]> {
  const { client, logger } = deps;

  try {
    const vsFiles = await fetchAllVectorStoreFiles(deps, vectorStoreId);

    logger.info(`Vector store files endpoint returned ${vsFiles.length} files`);

    const BATCH_SIZE = 10;
    const documents: DocumentInfo[] = [];
    for (let i = 0; i < vsFiles.length; i += BATCH_SIZE) {
      const batch = vsFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async vsFile => {
          try {
            const fileDetails = await client.request<LlamaStackFileResponse>(
              `/v1/openai/v1/files/${vsFile.id}`,
              { method: 'GET' },
            );
            return {
              id: vsFile.id,
              fileName: fileDetails.filename,
              format: detectFileFormat(fileDetails.filename),
              fileSize: fileDetails.bytes,
              uploadedAt: new Date(vsFile.created_at * 1000).toISOString(),
              status: vsFile.status,
            } as DocumentInfo;
          } catch {
            logger.debug(
              `Could not get details for file ${vsFile.id}, using basic info`,
            );
            return {
              id: vsFile.id,
              fileName: vsFile.id,
              format: FileFormat.TEXT,
              fileSize: 0,
              uploadedAt: new Date(vsFile.created_at * 1000).toISOString(),
              status: vsFile.status,
            } as DocumentInfo;
          }
        }),
      );
      documents.push(...results);
    }

    logger.info(`Returning ${documents.length} documents from vector store`);
    return documents;
  } catch (error) {
    const errorMessage = toErrorMessage(error);

    logger.debug(`Vector store files endpoint not available: ${errorMessage}`);

    try {
      const response = await client.request<
        | {
            data?: LlamaStackFileResponse[];
          }
        | LlamaStackFileResponse[]
      >(`/v1/openai/v1/files`, { method: 'GET' });

      const files: LlamaStackFileResponse[] = Array.isArray(response)
        ? response
        : response.data || [];

      logger.debug(`Files API returned ${files.length} files`);

      const documents: DocumentInfo[] = [];
      const seenFileIds = new Set<string>();

      for (const file of files) {
        if (file.purpose !== 'assistants') {
          continue;
        }

        if (seenFileIds.has(file.id)) {
          continue;
        }
        seenFileIds.add(file.id);

        documents.push({
          id: file.id,
          fileName: file.filename,
          format: detectFileFormat(file.filename),
          fileSize: file.bytes,
          uploadedAt: file.created_at
            ? new Date(file.created_at * 1000).toISOString()
            : new Date().toISOString(),
          status: 'completed',
        });
      }

      logger.info(`Returning ${documents.length} documents`);
      return documents;
    } catch (fallbackError) {
      const fallbackMsg = toErrorMessage(fallbackError);
      logger.warn(
        `Could not list documents: vector store endpoint failed (${errorMessage}), files API also failed (${fallbackMsg})`,
      );
      return [];
    }
  }
}
