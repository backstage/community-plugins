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
import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useRagTest, type ActiveVectorStore } from '../../hooks';
import { RagQueryForm } from './RagQueryForm';
import { RagResultsTable } from './RagResultsTable';

const MAX_HISTORY = 8;

interface Props {
  stores: ActiveVectorStore[];
  selectedStoreId: string | null;
}

export const KBRagTest = ({ stores, selectedStoreId }: Props) => {
  const {
    search,
    loading,
    error,
    result,
    searchTimeMs,
    clearResult,
    clearError,
  } = useRagTest();

  const [ragQuery, setRagQuery] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [searchAllStores, setSearchAllStores] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());

  const selectedStore = stores.find(s => s.id === selectedStoreId) ?? null;
  const hasStores = stores.length > 0;

  const addToHistory = useCallback((query: string) => {
    setQueryHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      return [query, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = ragQuery.trim();
    if (!trimmed) return;
    clearError();
    setExpandedChunks(new Set());
    addToHistory(trimmed);
    if (searchAllStores) {
      await search(
        trimmed,
        maxResults,
        undefined,
        stores.map(s => s.id),
      ).catch(() => {});
    } else {
      await search(trimmed, maxResults, selectedStoreId ?? undefined).catch(
        () => {},
      );
    }
  }, [
    ragQuery,
    maxResults,
    search,
    clearError,
    selectedStoreId,
    searchAllStores,
    stores,
    addToHistory,
  ]);

  const handleHistoryClick = useCallback(
    (query: string) => {
      setRagQuery(query);
      clearError();
      setExpandedChunks(new Set());
      addToHistory(query);
      if (searchAllStores) {
        void search(
          query,
          maxResults,
          undefined,
          stores.map(s => s.id),
        ).catch(() => {});
      } else {
        void search(query, maxResults, selectedStoreId ?? undefined).catch(
          () => {},
        );
      }
    },
    [
      search,
      maxResults,
      selectedStoreId,
      searchAllStores,
      stores,
      clearError,
      addToHistory,
    ],
  );

  const toggleChunk = useCallback((index: number) => {
    setExpandedChunks(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleExpandCollapseAll = useCallback(() => {
    if (!result) return;
    const CHUNK_PREVIEW_LENGTH = 300;
    const longIndices = result.chunks
      .map((c, i) => (c.text.length > CHUNK_PREVIEW_LENGTH ? i : -1))
      .filter(i => i >= 0);
    const allExpanded = longIndices.every(i => expandedChunks.has(i));
    setExpandedChunks(allExpanded ? new Set() : new Set(longIndices));
  }, [result, expandedChunks]);

  useEffect(() => {
    clearResult();
    clearError();
    setExpandedChunks(new Set());
  }, [selectedStoreId, searchAllStores, clearResult, clearError]);

  // ── Empty states ──────────────────────────────────────────────────────────

  if (!hasStores) {
    return (
      <Alert severity="info" variant="outlined">
        Create a vector store and ingest documents before testing RAG queries.
      </Alert>
    );
  }

  if (!searchAllStores && !selectedStore) {
    return (
      <Alert severity="info" variant="outlined">
        Select a store in <strong>Manage Stores</strong>, or enable{' '}
        <strong>Search all stores</strong> below.
        {stores.length > 1 && (
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={searchAllStores}
                  onChange={(_, v) => setSearchAllStores(v)}
                />
              }
              label={
                <Typography variant="caption">
                  Search all {stores.length} stores
                </Typography>
              }
            />
          </Box>
        )}
      </Alert>
    );
  }

  return (
    <>
      <RagQueryForm
        ragQuery={ragQuery}
        onRagQueryChange={setRagQuery}
        maxResults={maxResults}
        onMaxResultsChange={setMaxResults}
        searchAllStores={searchAllStores}
        onSearchAllStoresChange={setSearchAllStores}
        queryHistory={queryHistory}
        onSearch={handleSearch}
        onHistoryClick={handleHistoryClick}
        loading={loading}
        stores={stores}
        selectedStore={selectedStore}
      />

      {!searchAllStores && selectedStore && selectedStore.fileCount === 0 && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 1.5 }}>
          This store has no documents. Ingest files first to test retrieval.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {result && (
        <RagResultsTable
          result={result}
          searchTimeMs={searchTimeMs}
          searchAllStores={searchAllStores}
          stores={stores}
          expandedChunks={expandedChunks}
          onToggleChunk={toggleChunk}
          onExpandCollapseAll={handleExpandCollapseAll}
        />
      )}
    </>
  );
};
