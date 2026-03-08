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
import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { DocumentInfo } from '../types';
import { useApiQuery } from './useApiQuery';

/**
 * Hook to view documents in the knowledge base.
 * Optionally scoped to a specific vector store.
 * When vectorStoreId changes, the document list is automatically re-fetched.
 */
export function useDocuments(vectorStoreId?: string | null) {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(
    () => api.listDocumentsForStore(vectorStoreId!),
    [api, vectorStoreId],
  );

  const {
    data: documents,
    loading,
    error,
    refresh,
  } = useApiQuery({
    fetcher,
    initialValue: [] as DocumentInfo[],
    deps: [vectorStoreId],
    skip: !vectorStoreId,
  });

  return { documents, loading, error, refresh };
}
