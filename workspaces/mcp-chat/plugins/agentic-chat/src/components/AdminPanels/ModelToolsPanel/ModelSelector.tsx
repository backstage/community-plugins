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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface ModelSelectorProps {
  model: string;
  onModelChange: (value: string) => void;
  modelOptions: string[];
  loading: boolean;
  onRefresh: () => void;
  effectiveModel?: string;
}

/**
 * Autocomplete for model selection with refresh button
 */
export function ModelSelector({
  model,
  onModelChange,
  modelOptions,
  loading,
  onRefresh,
  effectiveModel = '',
}: ModelSelectorProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 280,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.5,
      }}
    >
      <Autocomplete
        freeSolo
        options={modelOptions}
        value={model}
        onInputChange={(_e, newValue) => onModelChange(newValue)}
        loading={loading}
        renderOption={(props, option) => (
          <li {...props} key={option}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {option}
              </Typography>
              {option === effectiveModel && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'success.main',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  active
                </Typography>
              )}
            </Box>
          </li>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label="Model"
            size="small"
            placeholder="e.g. meta-llama/Llama-3.3-8B-Instruct"
            helperText="Select from available models or type a custom identifier"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ flex: 1 }}
      />
      <Tooltip title="Refresh model list">
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={loading}
          sx={{ mt: 0.5 }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
