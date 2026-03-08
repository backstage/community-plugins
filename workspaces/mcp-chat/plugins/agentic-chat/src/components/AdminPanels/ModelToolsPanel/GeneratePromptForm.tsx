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
import { useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  useGeneratePrompt,
  useModels,
  type AgentCapabilities,
} from '../../../hooks';
import { CapabilitiesSelector } from './CapabilitiesSelector';
import type { PromptCapabilities } from '../../../types';

export interface GeneratePromptFormProps {
  /** Agent capabilities for the selector */
  capabilities: AgentCapabilities;
  /** Effective model from config (for "active" chip) */
  effectiveModel: string;
  /** Callback when prompt is generated - receives the new prompt text */
  onGenerated: (prompt: string) => void;
}

export const GeneratePromptForm = ({
  capabilities,
  effectiveModel,
  onGenerated,
}: GeneratePromptFormProps) => {
  const { generate, generating, error: genError } = useGeneratePrompt();
  const {
    models,
    loading: modelsLoading,
    refresh: refreshModels,
  } = useModels();
  const [description, setDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const selectedCapsRef = useRef<PromptCapabilities | undefined>(undefined);

  const modelOptions = models.map(m => m.id);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;
    const model = selectedModel || undefined;
    let prompt: string;
    try {
      prompt = await generate(
        description.trim(),
        model,
        selectedCapsRef.current,
      );
    } catch {
      return;
    }
    onGenerated(prompt);
  }, [description, generate, selectedModel, onGenerated]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Describe what you want your agent to do, then select which capabilities
        to emphasize. The LLM will generate a production-quality system prompt
        that references your agent&apos;s actual tools by name.
      </Typography>

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={5}
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="e.g. Help developers troubleshoot Kubernetes deployments, check pod logs, and suggest fixes..."
        disabled={generating}
        inputProps={{ maxLength: 2000 }}
        size="small"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 1.5 }} />

      <CapabilitiesSelector
        capabilities={capabilities}
        onChange={caps => {
          selectedCapsRef.current = caps;
        }}
        disabled={generating}
      />

      <Divider sx={{ my: 1.5 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Autocomplete
              freeSolo
              size="small"
              options={modelOptions}
              value={selectedModel}
              onInputChange={(_e, v) => setSelectedModel(v)}
              loading={modelsLoading}
              disabled={generating}
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
                    <Typography variant="body2" noWrap>
                      {option}
                    </Typography>
                    {option === effectiveModel && (
                      <Chip
                        label="active"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </li>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Model for generation"
                  placeholder={
                    effectiveModel
                      ? `Default: ${effectiveModel}`
                      : 'Select or type model'
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {modelsLoading && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Tooltip title="Refresh model list">
              <Typography variant="body2" component="span">
                <IconButton
                  size="small"
                  onClick={refreshModels}
                  disabled={modelsLoading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Typography>
            </Tooltip>
          </Box>
          {!selectedModel && effectiveModel && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              Will use active model: {effectiveModel}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pt: 0.25,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={
              generating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={handleGenerate}
            disabled={generating || !description.trim()}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>

          <Typography variant="caption" color="text.secondary">
            {description.length}/2000
          </Typography>
        </Box>
      </Box>

      {genError && (
        <Alert severity="error" sx={{ mt: 1.5 }} variant="outlined">
          {genError}
        </Alert>
      )}
    </Box>
  );
};
