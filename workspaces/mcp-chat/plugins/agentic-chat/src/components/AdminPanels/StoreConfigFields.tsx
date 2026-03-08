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
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import type { VectorStoreConfig } from '../../types';
import { HybridSearchConfig } from './HybridSearchConfig';

export interface StoreConfigFieldsProps {
  localConfig: Partial<VectorStoreConfig>;
  onUpdate: <K extends keyof VectorStoreConfig>(
    key: K,
    value: VectorStoreConfig[K],
  ) => void;
}

/**
 * Search mode and chunking configuration fields.
 */
export function StoreConfigFields({
  localConfig,
  onUpdate,
}: StoreConfigFieldsProps) {
  const isStatic = localConfig.chunkingStrategy === 'static';
  const isHybrid = localConfig.searchMode === 'hybrid';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        gap: 1.5,
        mt: 1.5,
      }}
    >
      <Autocomplete
        disableClearable
        options={['semantic', 'keyword', 'hybrid'] as const}
        getOptionLabel={opt =>
          opt === 'keyword'
            ? 'Keyword (BM25)'
            : opt.charAt(0).toUpperCase() + opt.slice(1)
        }
        value={
          (localConfig.searchMode ?? 'semantic') as
            | 'semantic'
            | 'keyword'
            | 'hybrid'
        }
        onChange={(_e, v) =>
          onUpdate('searchMode', v as VectorStoreConfig['searchMode'])
        }
        renderInput={params => (
          <TextField {...params} label="Search Mode" size="small" />
        )}
      />
      <Autocomplete
        disableClearable
        options={['auto', 'static'] as const}
        getOptionLabel={opt => opt.charAt(0).toUpperCase() + opt.slice(1)}
        value={(localConfig.chunkingStrategy ?? 'auto') as 'auto' | 'static'}
        onChange={(_e, v) =>
          onUpdate('chunkingStrategy', v as 'auto' | 'static')
        }
        renderInput={params => (
          <TextField {...params} label="Chunking" size="small" />
        )}
      />
      {isStatic ? (
        <TextField
          label="Max Chunk Size"
          size="small"
          type="number"
          value={localConfig.maxChunkSizeTokens ?? 200}
          onChange={e =>
            onUpdate('maxChunkSizeTokens', parseInt(e.target.value, 10) || 200)
          }
          helperText="tokens"
        />
      ) : (
        <TextField
          label="Max Results"
          size="small"
          type="number"
          value={localConfig.fileSearchMaxResults ?? ''}
          onChange={e =>
            onUpdate(
              'fileSearchMaxResults',
              parseInt(e.target.value, 10) || undefined,
            )
          }
          helperText="1-50 chunks/query"
        />
      )}
      {isStatic && (
        <>
          <TextField
            label="Chunk Overlap"
            size="small"
            type="number"
            value={localConfig.chunkOverlapTokens ?? 50}
            onChange={e =>
              onUpdate('chunkOverlapTokens', parseInt(e.target.value, 10) || 50)
            }
            helperText="tokens"
          />
          <TextField
            label="Max Results"
            size="small"
            type="number"
            value={localConfig.fileSearchMaxResults ?? ''}
            onChange={e =>
              onUpdate(
                'fileSearchMaxResults',
                parseInt(e.target.value, 10) || undefined,
              )
            }
            helperText="1-50 chunks/query"
          />
        </>
      )}
      <TextField
        label="Score Threshold"
        size="small"
        type="number"
        inputProps={{ min: 0, max: 1, step: 0.05 }}
        value={localConfig.fileSearchScoreThreshold ?? ''}
        onChange={e =>
          onUpdate(
            'fileSearchScoreThreshold',
            parseFloat(e.target.value) || undefined,
          )
        }
        helperText="0.0 – 1.0"
      />
      {isHybrid && (
        <Box sx={{ gridColumn: { xs: 1, md: '1 / -1' } }}>
          <HybridSearchConfig
            bm25Weight={localConfig.bm25Weight ?? 0.5}
            semanticWeight={localConfig.semanticWeight ?? 0.5}
            onBm25WeightChange={v => onUpdate('bm25Weight', v)}
            onSemanticWeightChange={v => onUpdate('semanticWeight', v)}
          />
        </Box>
      )}
    </Box>
  );
}
