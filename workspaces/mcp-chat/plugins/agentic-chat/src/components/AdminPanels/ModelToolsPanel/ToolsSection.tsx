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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import { useAdminConfig } from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';

const TOOL_CHOICE_OPTIONS = ['auto', 'required', 'none'] as const;
type ToolChoice = (typeof TOOL_CHOICE_OPTIONS)[number];

const TOOL_CHOICE_DESCRIPTIONS: Record<ToolChoice, string> = {
  auto: 'Model decides when to call tools',
  required: 'Always call tools',
  none: 'Never call tools',
};

function isValidToolChoice(value: unknown): value is ToolChoice {
  return (
    typeof value === 'string' &&
    TOOL_CHOICE_OPTIONS.includes(value as ToolChoice)
  );
}

interface Props {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const ToolsSection = ({ effectiveConfig, onConfigSaved }: Props) => {
  const toolChoiceConfig = useAdminConfig('toolChoice');
  const webSearchConfig = useAdminConfig('enableWebSearch');
  const codeInterpreterConfig = useAdminConfig('enableCodeInterpreter');

  const effectiveToolChoice = (effectiveConfig?.toolChoice as string) ?? 'auto';
  const effectiveWebSearch =
    (effectiveConfig?.enableWebSearch as boolean) ?? false;
  const effectiveCodeInterpreter =
    (effectiveConfig?.enableCodeInterpreter as boolean) ?? false;

  const [toolChoice, setToolChoice] = useState('auto');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [enableCodeInterpreter, setEnableCodeInterpreter] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState({
    toolChoice: false,
    webSearch: false,
    codeInterpreter: false,
  });

  useEffect(() => {
    if (!initialized.toolChoice && !toolChoiceConfig.loading) {
      const dbValue = toolChoiceConfig.entry?.configValue;
      const raw = dbValue ?? effectiveToolChoice;
      setToolChoice(isValidToolChoice(raw) ? raw : 'auto');
      setInitialized(prev => ({ ...prev, toolChoice: true }));
    }
  }, [
    initialized.toolChoice,
    toolChoiceConfig.loading,
    toolChoiceConfig.entry,
    effectiveToolChoice,
  ]);

  useEffect(() => {
    if (!initialized.webSearch && !webSearchConfig.loading) {
      const dbValue = webSearchConfig.entry?.configValue as boolean | undefined;
      setEnableWebSearch(dbValue ?? effectiveWebSearch);
      setInitialized(prev => ({ ...prev, webSearch: true }));
    }
  }, [
    initialized.webSearch,
    webSearchConfig.loading,
    webSearchConfig.entry,
    effectiveWebSearch,
  ]);

  useEffect(() => {
    if (!initialized.codeInterpreter && !codeInterpreterConfig.loading) {
      const dbValue = codeInterpreterConfig.entry?.configValue as
        | boolean
        | undefined;
      setEnableCodeInterpreter(dbValue ?? effectiveCodeInterpreter);
      setInitialized(prev => ({ ...prev, codeInterpreter: true }));
    }
  }, [
    initialized.codeInterpreter,
    codeInterpreterConfig.loading,
    codeInterpreterConfig.entry,
    effectiveCodeInterpreter,
  ]);

  const source =
    toolChoiceConfig.source === 'database' ||
    webSearchConfig.source === 'database' ||
    codeInterpreterConfig.source === 'database'
      ? 'database'
      : 'default';

  const saving =
    toolChoiceConfig.saving ||
    webSearchConfig.saving ||
    codeInterpreterConfig.saving;

  const error =
    toolChoiceConfig.error ||
    webSearchConfig.error ||
    codeInterpreterConfig.error;

  const handleSave = useCallback(async () => {
    const results = await Promise.allSettled([
      toolChoiceConfig.save(toolChoice),
      webSearchConfig.save(enableWebSearch),
      codeInterpreterConfig.save(enableCodeInterpreter),
    ]);

    const labels = ['Tool Choice', 'Web Search', 'Code Interpreter'];
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? labels[i] : null))
      .filter(Boolean);

    if (failed.length > 0) {
      setToast(`Failed to save: ${failed.join(', ')}`);
    } else {
      setToast('Tools configuration saved');
      onConfigSaved?.();
    }
  }, [
    toolChoice,
    enableWebSearch,
    enableCodeInterpreter,
    toolChoiceConfig,
    webSearchConfig,
    codeInterpreterConfig,
    onConfigSaved,
  ]);

  const handleReset = useCallback(async () => {
    try {
      await Promise.all([
        toolChoiceConfig.reset(),
        webSearchConfig.reset(),
        codeInterpreterConfig.reset(),
      ]);
    } catch {
      return;
    }
    setToolChoice(effectiveToolChoice);
    setEnableWebSearch(effectiveWebSearch);
    setEnableCodeInterpreter(effectiveCodeInterpreter);
    setInitialized({
      toolChoice: false,
      webSearch: false,
      codeInterpreter: false,
    });
    setToast('Reset to YAML defaults');
  }, [
    toolChoiceConfig,
    webSearchConfig,
    codeInterpreterConfig,
    effectiveToolChoice,
    effectiveWebSearch,
    effectiveCodeInterpreter,
  ]);

  const loading =
    toolChoiceConfig.loading ||
    webSearchConfig.loading ||
    codeInterpreterConfig.loading;

  if (loading) return null;

  return (
    <>
      <AdminSection
        title="Tools Configuration"
        description="Control how the LLM invokes tools during chat sessions."
        source={source}
        saving={saving}
        error={error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            disableClearable
            options={[...TOOL_CHOICE_OPTIONS]}
            value={isValidToolChoice(toolChoice) ? toolChoice : 'auto'}
            onChange={(_e, newValue) => {
              if (newValue) setToolChoice(newValue);
            }}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {option}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {TOOL_CHOICE_DESCRIPTIONS[option]}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label="Tool Choice"
                size="small"
                helperText="Controls when the model calls tools"
              />
            )}
            sx={{ maxWidth: 300 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={enableWebSearch}
                onChange={(_, checked) => setEnableWebSearch(checked)}
              />
            }
            label="Enable Web Search"
          />

          <FormControlLabel
            control={
              <Switch
                checked={enableCodeInterpreter}
                onChange={(_, checked) => setEnableCodeInterpreter(checked)}
              />
            }
            label="Enable Code Interpreter"
          />
        </Box>
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
