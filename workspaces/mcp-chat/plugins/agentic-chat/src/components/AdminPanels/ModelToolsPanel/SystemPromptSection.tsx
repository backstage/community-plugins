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
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  useAdminConfig,
  useStatus,
  useAgentCapabilities,
} from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';
import { GeneratePromptForm } from './GeneratePromptForm';

const INNER_TABS_SX = {
  minHeight: 32,
  '& .MuiTab-root': {
    minHeight: 32,
    textTransform: 'none',
    fontSize: '0.8125rem',
    px: 2,
    mr: 0.5,
  },
} as const;

interface Props {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const SystemPromptSection = ({
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const config = useAdminConfig('systemPrompt');
  const { status } = useStatus();
  const agentCaps = useAgentCapabilities(effectiveConfig, status?.mcpServers);

  const effectiveValue = (effectiveConfig?.systemPrompt as string) ?? '';
  const effectiveModel = (effectiveConfig?.model as string) ?? '';

  const [value, setValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [innerTab, setInnerTab] = useState<'editor' | 'generate'>('editor');

  useEffect(() => {
    if (!initialized && !config.loading) {
      const dbValue = config.entry?.configValue as string | undefined;
      setValue(dbValue ?? effectiveValue);
      setInitialized(true);
    }
  }, [initialized, config.loading, config.entry, effectiveValue]);

  const handleSave = useCallback(async () => {
    if (!value.trim()) {
      setToast('System prompt cannot be empty');
      return;
    }
    try {
      await config.save(value);
    } catch {
      return;
    }
    setToast('System prompt saved');
    onConfigSaved?.();
  }, [value, config, onConfigSaved]);

  const handleReset = useCallback(async () => {
    try {
      await config.reset();
    } catch {
      return;
    }
    setValue(effectiveValue);
    setInitialized(false);
    setToast('Reset to YAML default');
  }, [config, effectiveValue]);

  const handleGenerated = useCallback((prompt: string) => {
    setValue(prompt);
    setInnerTab('editor');
    setToast('Prompt generated — review and save when ready');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await window.navigator.clipboard.writeText(value);
      setToast('Copied to clipboard');
    } catch {
      setToast('Failed to copy');
    }
  }, [value]);

  if (config.loading) return null;

  return (
    <>
      <AdminSection
        title="System Prompt"
        description="The system prompt sent with every chat request. Changes apply to new conversations."
        source={config.source}
        saving={config.saving}
        error={config.error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Tabs
            value={innerTab}
            onChange={(_, v) => setInnerTab(v)}
            sx={INNER_TABS_SX}
          >
            <Tab
              icon={<EditNoteIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Current Instructions"
              value="editor"
            />
            <Tab
              icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Generate from Description"
              value="generate"
            />
          </Tabs>
        </Box>

        {innerTab === 'editor' && (
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              minRows={6}
              maxRows={16}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter the system prompt for the AI assistant..."
            />
            {value && (
              <Tooltip title="Copy to clipboard">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  aria-label="Copy prompt"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    opacity: 0.7,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {innerTab === 'generate' && (
          <GeneratePromptForm
            capabilities={agentCaps}
            effectiveModel={effectiveModel}
            onGenerated={handleGenerated}
          />
        )}
      </AdminSection>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};
