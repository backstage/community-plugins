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
import FormDataNode from 'form-data';
import type { LlamaStackClient } from './LlamaStackClient';
import type {
  LlamaStackConfig,
  LlamaStackFileResponse,
  LlamaStackVectorStoreFileResponse,
  FileAttributes,
} from '../../types';
import { toErrorMessage } from '../../services/utils';

/** Batch size for concurrent uploads to avoid overwhelming the API */
const UPLOAD_BATCH_SIZE = 5;

async function deleteOrphanedFile(
  client: LlamaStackClient,
  fileId: string,
  fileName: string,
  logger: LoggerService,
): Promise<void> {
  try {
    await client.request(`/v1/openai/v1/files/${fileId}`, { method: 'DELETE' });
    logger.info(`Cleaned up orphaned file ${fileId} (${fileName})`);
  } catch (cleanupErr) {
    logger.warn(
      `Failed to clean up orphaned file ${fileId} (${fileName}): ${toErrorMessage(
        cleanupErr,
      )}`,
    );
  }
}

export interface DocumentUploaderDeps {
  client: LlamaStackClient;
  config: LlamaStackConfig;
  logger: LoggerService;
}

/**
 * File to upload to the vector store.
 */
export interface UploadFile {
  fileName: string;
  content: string;
  attributes?: FileAttributes;
}

/**
 * Result of an upload operation.
 */
export interface UploadResult {
  uploaded: Array<{ id: string; fileName: string; status: string }>;
  failed: Array<{ fileName?: string; error: string }>;
}

/**
 * Upload a single file to the Files API and attach it to the vector store.
 */
async function uploadSingleFile(
  file: UploadFile,
  deps: DocumentUploaderDeps,
  vectorStoreId: string,
): Promise<
  | { id: string; fileName: string; status: string }
  | { fileName: string; error: string }
> {
  const { client, config, logger } = deps;

  try {
    const form = new FormDataNode();
    form.append('file', Buffer.from(file.content, 'utf-8'), file.fileName);
    form.append('purpose', 'assistants');

    const uploadResponse = await client.request<LlamaStackFileResponse>(
      '/v1/openai/v1/files',
      { method: 'POST', body: form },
    );

    const chunkingStrategy =
      config.chunkingStrategy === 'auto'
        ? { type: 'auto' as const }
        : {
            type: 'static' as const,
            static: {
              max_chunk_size_tokens: config.maxChunkSizeTokens ?? 512,
              chunk_overlap_tokens: config.chunkOverlapTokens ?? 50,
            },
          };

    const attachBody: Record<string, unknown> = {
      file_id: uploadResponse.id,
      chunking_strategy: chunkingStrategy,
    };
    if (file.attributes && Object.keys(file.attributes).length > 0) {
      attachBody.attributes = file.attributes;
    }

    let attachResponse: LlamaStackVectorStoreFileResponse;
    try {
      attachResponse = await client.request<LlamaStackVectorStoreFileResponse>(
        `/v1/openai/v1/vector_stores/${vectorStoreId}/files`,
        { method: 'POST', body: attachBody },
      );
    } catch (attachError) {
      await deleteOrphanedFile(
        client,
        uploadResponse.id,
        file.fileName,
        logger,
      );
      throw attachError;
    }

    if (attachResponse.status === 'failed') {
      const errMsg = attachResponse.last_error?.message ?? 'Attachment failed';
      logger.warn(`File attachment failed for ${file.fileName}: ${errMsg}`);
      await deleteOrphanedFile(
        client,
        uploadResponse.id,
        file.fileName,
        logger,
      );
      return { fileName: file.fileName, error: errMsg };
    }

    return {
      id: uploadResponse.id,
      fileName: file.fileName,
      status: attachResponse.status,
    };
  } catch (error) {
    const msg = toErrorMessage(error);
    logger.warn(`Upload failed for ${file.fileName}: ${msg}`);
    return { fileName: file.fileName, error: msg };
  }
}

/**
 * Upload documents to the vector store in batches.
 * Each file is uploaded to the Files API, then attached to the vector store.
 *
 * @param files - Files to upload
 * @param deps - Client, config, and logger
 * @param vectorStoreId - Optional vector store ID (defaults to config.vectorStoreIds[0])
 */
export async function uploadDocuments(
  files: UploadFile[],
  deps: DocumentUploaderDeps,
  vectorStoreId?: string,
): Promise<UploadResult> {
  const { config, logger } = deps;
  const targetId = vectorStoreId ?? config.vectorStoreIds[0];

  if (!targetId) {
    throw new InputError(
      'No vector store configured — cannot upload documents',
    );
  }

  const uploaded: UploadResult['uploaded'] = [];
  const failed: UploadResult['failed'] = [];

  for (let i = 0; i < files.length; i += UPLOAD_BATCH_SIZE) {
    const batch = files.slice(i, i + UPLOAD_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(file => uploadSingleFile(file, deps, targetId)),
    );

    for (const result of results) {
      if ('id' in result) {
        uploaded.push(result);
      } else {
        failed.push(result);
      }
    }
  }

  logger.info(`Uploaded ${uploaded.length} documents, ${failed.length} failed`);

  return { uploaded, failed };
}
