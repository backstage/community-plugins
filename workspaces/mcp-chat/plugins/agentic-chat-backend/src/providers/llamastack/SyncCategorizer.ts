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

import type { DocumentInfo } from '@backstage-community/plugin-agentic-chat-common';
import type { FetchedDocument } from '../../types';

/**
 * Result of categorizing fetched documents against existing documents.
 * Used to determine which documents need to be added, updated, or left unchanged.
 */
export interface SyncCategorization {
  /** New documents to add to the vector store */
  toAdd: FetchedDocument[];
  /** Existing documents whose content has changed and need re-upload */
  toUpdate: FetchedDocument[];
  /** File names of documents that are unchanged (no action needed) */
  unchanged: string[];
}

/**
 * Categorizes fetched documents into add, update, and unchanged buckets.
 * Pure function: no side effects, deterministic output for given inputs.
 *
 * Change detection uses content hashing:
 * - Documents not in existingDocsMap → toAdd
 * - Documents with contentHash that differs from cached hash → toUpdate
 * - Documents with matching hash or no hash → unchanged
 *
 * @param fetchedDocs - Documents fetched from configured sources
 * @param existingDocsMap - Map of fileName → DocumentInfo for current vector store contents
 * @param contentHashCache - Map of sourceId → content hash for change detection
 */
export function categorizeDocuments(
  fetchedDocs: FetchedDocument[],
  existingDocsMap: Map<string, DocumentInfo>,
  contentHashCache: ReadonlyMap<string, string>,
): SyncCategorization {
  const toAdd: FetchedDocument[] = [];
  const toUpdate: FetchedDocument[] = [];
  const unchanged: string[] = [];

  for (const doc of fetchedDocs) {
    const cacheKey = doc.sourceId || doc.fileName;
    const existingDoc = existingDocsMap.get(doc.fileName);

    if (!existingDoc) {
      toAdd.push(doc);
      continue;
    }

    if (doc.contentHash) {
      const cachedHash = contentHashCache.get(cacheKey);
      if (cachedHash && cachedHash !== doc.contentHash) {
        toUpdate.push(doc);
      } else {
        unchanged.push(doc.fileName);
      }
    } else {
      unchanged.push(doc.fileName);
    }
  }

  return { toAdd, toUpdate, unchanged };
}
