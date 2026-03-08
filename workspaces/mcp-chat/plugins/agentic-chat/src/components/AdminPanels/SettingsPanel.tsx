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
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import { BrandingSection, type BrandingState } from './BrandingSection';
import { SafetyPatternsSection } from './SafetyEvalPanel/SafetyPatternsSection';
import {
  useAdminConfig,
  useEffectiveConfig,
  useToast,
  useFormState,
  useConfigSync,
} from '../../hooks';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const SettingsPanel = () => {
  const theme = useTheme();
  const defaultBranding = useMemo<BrandingState>(
    () => ({
      appName: '',
      tagline: '',
      primaryColor: theme.palette.primary.main,
      secondaryColor: theme.palette.text.secondary,
    }),
    [theme],
  );
  const systemPromptConfig = useAdminConfig('systemPrompt');
  const brandingConfig = useAdminConfig('branding');
  const { config: effectiveConfig } = useEffectiveConfig();

  const { toast, showToast, closeToast } = useToast();

  const [systemPrompt, setSystemPrompt] = useState('');
  const brandingForm = useFormState<BrandingState>(defaultBranding);

  useConfigSync(
    systemPromptConfig.loading,
    systemPromptConfig.entry?.configValue as string | undefined,
    useCallback((v: string) => setSystemPrompt(v), []),
  );

  useConfigSync(
    brandingConfig.loading,
    brandingConfig.entry?.configValue as BrandingState | undefined,
    useCallback(
      (v: BrandingState) =>
        brandingForm.setValues({
          appName: v.appName || '',
          tagline: v.tagline || '',
          primaryColor: v.primaryColor || theme.palette.primary.main,
          secondaryColor: v.secondaryColor || theme.palette.text.secondary,
        }),
      [theme, brandingForm],
    ),
  );

  const handleSavePrompt = useCallback(async () => {
    if (!systemPrompt.trim()) {
      showToast('System prompt cannot be empty', 'error');
      return;
    }
    try {
      await systemPromptConfig.save(systemPrompt);
    } catch {
      return;
    }
    showToast('System prompt saved');
  }, [systemPrompt, systemPromptConfig, showToast]);

  const handleSaveBranding = useCallback(async () => {
    const { primaryColor, secondaryColor } = brandingForm.values;
    if (primaryColor && !HEX_RE.test(primaryColor)) {
      showToast(
        `Primary color must be a valid hex color (e.g. ${theme.palette.primary.main})`,
        'error',
      );
      return;
    }
    if (secondaryColor && !HEX_RE.test(secondaryColor)) {
      showToast('Secondary color must be a valid hex color', 'error');
      return;
    }
    try {
      await brandingConfig.save(brandingForm.values);
    } catch {
      return;
    }
    showToast('Branding saved');
  }, [
    brandingForm.values,
    brandingConfig,
    showToast,
    theme.palette.primary.main,
  ]);

  const loading = systemPromptConfig.loading || brandingConfig.loading;

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      {/* System Prompt */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6">System Prompt</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {systemPromptConfig.source === 'database' && (
              <Chip label="Customized" size="small" color="info" />
            )}
            <Button
              size="small"
              startIcon={<RestoreIcon />}
              onClick={async () => {
                await systemPromptConfig.reset();
                setSystemPrompt('');
                showToast('Reset to YAML default');
              }}
              disabled={
                systemPromptConfig.saving ||
                systemPromptConfig.source === 'default'
              }
            >
              Reset
            </Button>
          </Box>
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={12}
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder="Enter the system prompt for the AI assistant..."
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={
            systemPromptConfig.saving ? (
              <CircularProgress size={16} />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSavePrompt}
          disabled={systemPromptConfig.saving}
        >
          Save
        </Button>
        {systemPromptConfig.error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {systemPromptConfig.error}
          </Alert>
        )}
      </Paper>

      <BrandingSection
        values={brandingForm.values}
        onFieldChange={(field, value) => brandingForm.setField(field, value)}
        onSave={handleSaveBranding}
        onReset={async () => {
          await brandingConfig.reset();
          brandingForm.setValues(defaultBranding);
          showToast('Reset to YAML default');
        }}
        configSource={brandingConfig.source}
        saving={brandingConfig.saving}
        error={brandingConfig.error}
      />

      <SafetyPatternsSection effectiveConfig={effectiveConfig ?? undefined} />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};
