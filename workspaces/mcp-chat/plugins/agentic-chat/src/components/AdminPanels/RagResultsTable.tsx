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
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { RagTestResult } from '../../types';
import type { ActiveVectorStore } from '../../hooks';
import { ChunkCard } from './ChunkCard';

const CHUNK_PREVIEW_LENGTH = 300;

export interface RagResultsTableProps {
  /** RAG search result */
  result: RagTestResult;
  /** Search duration in ms */
  searchTimeMs: number | null;
  /** Whether search was across all stores */
  searchAllStores: boolean;
  /** All stores (for name lookup) */
  stores: ActiveVectorStore[];
  /** Indices of expanded chunks */
  expandedChunks: Set<number>;
  /** Toggle a chunk's expanded state */
  onToggleChunk: (index: number) => void;
  /** Expand or collapse all long chunks */
  onExpandCollapseAll: () => void;
}

export function RagResultsTable({
  result,
  searchTimeMs,
  searchAllStores,
  stores,
  expandedChunks,
  onToggleChunk,
  onExpandCollapseAll,
}: RagResultsTableProps) {
  const theme = useTheme();
  const storeNameMap = new Map(
    stores.map(s => [s.id, s.name !== s.id ? s.name : s.id]),
  );

  const chunks = result.chunks ?? [];
  const longChunkIndices = chunks
    .map((c, i) => (c.text.length > CHUNK_PREVIEW_LENGTH ? i : -1))
    .filter(i => i >= 0);
  const allExpanded =
    longChunkIndices.length > 0 &&
    longChunkIndices.every(i => expandedChunks.has(i));

  return (
    <Box>
      {/* Results summary header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          px: 0.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {result.totalResults} result
          {result.totalResults !== 1 ? 's' : ''}
          {!searchAllStores && result.vectorStoreId && (
            <>
              {' '}
              from{' '}
              <Chip
                label={
                  storeNameMap.get(result.vectorStoreId) ?? result.vectorStoreId
                }
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20, mx: 0.5 }}
              />
            </>
          )}
          {searchAllStores && <> across {stores.length} stores</>}
        </Typography>
        {searchTimeMs !== null && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {searchTimeMs < 1000
                ? `${searchTimeMs}ms`
                : `${(searchTimeMs / 1000).toFixed(2)}s`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* No results guidance */}
      {chunks.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 2.5, textAlign: 'center', borderStyle: 'dashed' }}
        >
          <Typography variant="body2" color="textSecondary" gutterBottom>
            No matching chunks found.
          </Typography>
          <Typography variant="caption" color="textSecondary" component="div">
            Try broader search terms, check that your documents cover this
            topic, or verify that files are properly ingested and chunked.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Score legend */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 1,
              px: 0.5,
            }}
          >
            {[
              { label: 'High (≥70%)', color: theme.palette.success.main },
              { label: 'Medium (40–70%)', color: theme.palette.warning.main },
              { label: 'Low (<40%)', color: theme.palette.error.main },
            ].map(item => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color,
                  }}
                />
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: '0.675rem' }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Chunk cards */}
          {chunks.map((chunk, i) => (
            <ChunkCard
              key={i}
              chunk={chunk}
              index={i}
              query={result.query}
              expanded={expandedChunks.has(i)}
              onToggle={() => onToggleChunk(i)}
              storeName={
                chunk.vectorStoreId
                  ? storeNameMap.get(chunk.vectorStoreId)
                  : undefined
              }
              showStore={searchAllStores}
              theme={theme}
            />
          ))}

          {/* Expand/collapse all (when multiple long chunks) */}
          {longChunkIndices.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
              <Button
                size="small"
                onClick={onExpandCollapseAll}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                }}
              >
                {allExpanded ? 'Collapse all chunks' : 'Expand all chunks'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
