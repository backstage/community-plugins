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
import { useState, useCallback, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { asStringArray } from '../../../utils';
import { useAdminConfig, useSafetyStatus } from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';
import { ServerItemPicker } from '../shared/ServerItemPicker';

interface Props {
  providerName: string;
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const SafetyShieldsSection = ({
  providerName,
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const enabledConfig = useAdminConfig('safetyEnabled');
  const inputShieldsConfig = useAdminConfig('inputShields');
  const outputShieldsConfig = useAdminConfig('outputShields');
  const safetyStatus = useSafetyStatus();

  const effectiveEnabled = (effectiveConfig?.safetyEnabled as boolean) ?? false;
  const effectiveInput = useMemo(
    () => asStringArray(effectiveConfig?.inputShields),
    [effectiveConfig?.inputShields],
  );
  const effectiveOutput = useMemo(
    () => asStringArray(effectiveConfig?.outputShields),
    [effectiveConfig?.outputShields],
  );

  const [enabled, setEnabled] = useState(false);
  const [inputShields, setInputShields] = useState<string[]>([]);
  const [outputShields, setOutputShields] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState({
    enabled: false,
    input: false,
    output: false,
  });

  useEffect(() => {
    if (!initialized.enabled && !enabledConfig.loading) {
      const dbValue = enabledConfig.entry?.configValue as boolean | undefined;
      setEnabled(dbValue ?? effectiveEnabled);
      setInitialized(prev => ({ ...prev, enabled: true }));
    }
  }, [
    initialized.enabled,
    enabledConfig.loading,
    enabledConfig.entry,
    effectiveEnabled,
  ]);

  useEffect(() => {
    if (!initialized.input && !inputShieldsConfig.loading) {
      const dbValue = inputShieldsConfig.entry?.configValue;
      setInputShields(
        dbValue !== undefined ? asStringArray(dbValue) : [...effectiveInput],
      );
      setInitialized(prev => ({ ...prev, input: true }));
    }
  }, [
    initialized.input,
    inputShieldsConfig.loading,
    inputShieldsConfig.entry,
    effectiveInput,
  ]);

  useEffect(() => {
    if (!initialized.output && !outputShieldsConfig.loading) {
      const dbValue = outputShieldsConfig.entry?.configValue;
      setOutputShields(
        dbValue !== undefined ? asStringArray(dbValue) : [...effectiveOutput],
      );
      setInitialized(prev => ({ ...prev, output: true }));
    }
  }, [
    initialized.output,
    outputShieldsConfig.loading,
    outputShieldsConfig.entry,
    effectiveOutput,
  ]);

  const source =
    enabledConfig.source === 'database' ||
    inputShieldsConfig.source === 'database' ||
    outputShieldsConfig.source === 'database'
      ? 'database'
      : 'default';

  const saving =
    enabledConfig.saving ||
    inputShieldsConfig.saving ||
    outputShieldsConfig.saving;
  const error =
    enabledConfig.error ||
    inputShieldsConfig.error ||
    outputShieldsConfig.error;

  const handleSave = useCallback(async () => {
    const results = await Promise.allSettled([
      enabledConfig.save(enabled),
      inputShieldsConfig.save(inputShields),
      outputShieldsConfig.save(outputShields),
    ]);

    const labels = ['Enabled toggle', 'Input Shields', 'Output Shields'];
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? labels[i] : null))
      .filter(Boolean);

    if (failed.length > 0) {
      setToast(`Failed to save: ${failed.join(', ')}`);
    } else {
      setToast('Safety shields saved');
      onConfigSaved?.();
    }
  }, [
    enabled,
    inputShields,
    outputShields,
    enabledConfig,
    inputShieldsConfig,
    outputShieldsConfig,
    onConfigSaved,
  ]);

  const handleReset = useCallback(async () => {
    try {
      await Promise.all([
        enabledConfig.reset(),
        inputShieldsConfig.reset(),
        outputShieldsConfig.reset(),
      ]);
    } catch {
      return;
    }
    setEnabled(effectiveEnabled);
    setInputShields([...effectiveInput]);
    setOutputShields([...effectiveOutput]);
    setInitialized({ enabled: false, input: false, output: false });
    setToast('Reset to YAML defaults');
  }, [
    enabledConfig,
    inputShieldsConfig,
    outputShieldsConfig,
    effectiveEnabled,
    effectiveInput,
    effectiveOutput,
  ]);

  const loading =
    enabledConfig.loading ||
    inputShieldsConfig.loading ||
    outputShieldsConfig.loading;
  if (loading) return null;

  return (
    <>
      <AdminSection
        title={`${providerName} Shields`}
        description={`Enable input and output safety shields. Shields are registered with the ${providerName} Safety API.`}
        source={source}
        saving={saving}
        error={error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(_, checked) => setEnabled(checked)}
            />
          }
          label={
            <Typography variant="body2">
              {enabled ? 'Safety shields enabled' : 'Safety shields disabled'}
            </Typography>
          }
          sx={{ mb: 1 }}
        />

        {enabled &&
          safetyStatus.shields.length === 0 &&
          !safetyStatus.loading && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              {`No safety shields are registered on the ${providerName} server. Safety checks will not run until shields are configured in the server's run.yaml (e.g. llama-guard, prompt-guard providers).`}
            </Alert>
          )}

        <Collapse in={enabled}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <ServerItemPicker
              selected={inputShields}
              onChange={setInputShields}
              serverItems={safetyStatus.shields}
              serverLoading={safetyStatus.loading}
              serverError={safetyStatus.error}
              onRefresh={safetyStatus.refresh}
              label="Input Shields"
              placeholder="e.g. content_safety"
              itemLabel="shields"
            />
            <ServerItemPicker
              selected={outputShields}
              onChange={setOutputShields}
              serverItems={safetyStatus.shields}
              serverLoading={safetyStatus.loading}
              serverError={safetyStatus.error}
              onRefresh={safetyStatus.refresh}
              label="Output Shields"
              placeholder="e.g. content_safety"
              itemLabel="shields"
            />
          </Box>
        </Collapse>
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
