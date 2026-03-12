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
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import CircularProgress from '@mui/material/CircularProgress';
import type { ActiveVectorStore } from '../../hooks';

const MAX_RESULTS_OPTIONS = [3, 5, 10, 15, 20];

export interface RagQueryFormProps {
  /** Current query text */
  ragQuery: string;
  /** Update query text */
  onRagQueryChange: (value: string) => void;
  /** Max results (top-K) */
  maxResults: number;
  /** Update max results */
  onMaxResultsChange: (value: number) => void;
  /** Whether to search all stores */
  searchAllStores: boolean;
  /** Toggle search all stores */
  onSearchAllStoresChange: (value: boolean) => void;
  /** Recent query history for quick re-run */
  queryHistory: string[];
  /** Run search (called when Search clicked or Enter pressed) */
  onSearch: () => void;
  /** Click a history chip to re-run that query */
  onHistoryClick: (query: string) => void;
  /** Whether search is in progress */
  loading: boolean;
  /** All available stores */
  stores: ActiveVectorStore[];
  /** Currently selected store (when not searching all) */
  selectedStore: ActiveVectorStore | null;
}

export function RagQueryForm({
  ragQuery,
  onRagQueryChange,
  maxResults,
  onMaxResultsChange,
  searchAllStores,
  onSearchAllStoresChange,
  queryHistory,
  onSearch,
  onHistoryClick,
  loading,
  stores,
  selectedStore,
}: RagQueryFormProps) {
  const searchContextLabel = (() => {
    if (searchAllStores) {
      return (
        <>
          Searching{' '}
          <strong>
            all {stores.length} store
            {stores.length !== 1 ? 's' : ''}
          </strong>
        </>
      );
    }
    if (selectedStore) {
      const storeLabel =
        selectedStore.name !== selectedStore.id
          ? selectedStore.name
          : selectedStore.id;
      const fileSuffix = selectedStore.fileCount !== 1 ? 's' : '';
      const fileCountLabel =
        selectedStore.fileCount > 0
          ? ` (${selectedStore.fileCount} file${fileSuffix})`
          : ' (empty)';
      return (
        <>
          Searching <strong>{storeLabel}</strong>
          {fileCountLabel}
        </>
      );
    }
    return null;
  })();

  return (
    <>
      {/* Store context bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <StorageIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
          {searchContextLabel}
        </Typography>
        {stores.length > 1 && (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={searchAllStores}
                onChange={(_, v) => onSearchAllStoresChange(v)}
              />
            }
            label={<Typography variant="caption">All stores</Typography>}
          />
        )}
      </Box>

      {/* Search controls */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter a test query..."
          value={ragQuery}
          onChange={e => onRagQueryChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSearch();
          }}
          inputProps={{ maxLength: 2000 }}
        />
        <TextField
          select
          size="small"
          label="Results"
          value={maxResults}
          onChange={e => onMaxResultsChange(Number(e.target.value))}
          sx={{ minWidth: 88 }}
        >
          {MAX_RESULTS_OPTIONS.map(n => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <SearchIcon />}
          onClick={onSearch}
          disabled={
            loading ||
            !ragQuery.trim() ||
            (!searchAllStores && selectedStore?.fileCount === 0)
          }
          sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
        >
          Search
        </Button>
      </Box>

      {/* Query history */}
      {queryHistory.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="caption" color="textSecondary" sx={{ mr: 0.5 }}>
            Recent:
          </Typography>
          {queryHistory.map(q => (
            <Chip
              key={q}
              label={q.length > 30 ? `${q.slice(0, 30)}…` : q}
              size="small"
              variant="outlined"
              onClick={() => onHistoryClick(q)}
              sx={{
                fontSize: '0.7rem',
                height: 22,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            />
          ))}
        </Box>
      )}
    </>
  );
}
