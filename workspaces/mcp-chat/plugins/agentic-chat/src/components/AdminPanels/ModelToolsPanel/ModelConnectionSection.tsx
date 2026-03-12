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
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../../../api';
import { normalizeErrorMessage } from '../../../utils';
import { useAdminConfig, useModels } from '../../../hooks';
import { AdminSection } from '../shared/AdminSection';
import { ModelSelector } from './ModelSelector';

const URL_RE = /^https?:\/\/.+/;

interface Props {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
  providerName: string;
}

function modelConnectionStatusText(result: TestResult): string {
  if (result.canGenerate) return 'Connected · Model found · Can generate';
  if (result.modelFound) {
    const suffix = result.error ? `: ${result.error}` : '';
    return `Connected · Model found · Cannot generate${suffix}`;
  }
  if (result.connected) {
    return `Connected · ${result.error || 'Model not found'}`;
  }
  const suffix = result.error ? `: ${result.error}` : '';
  return `Not connected${suffix}`;
}

type TestResult = {
  connected: boolean;
  modelFound: boolean;
  canGenerate: boolean;
  error?: string;
};

export const ModelConnectionSection = ({
  effectiveConfig,
  onConfigSaved,
  providerName,
}: Props) => {
  const api = useApi(agenticChatApiRef);
  const modelConfig = useAdminConfig('model');
  const baseUrlConfig = useAdminConfig('baseUrl');
  const {
    models,
    loading: modelsLoading,
    refresh: refreshModels,
  } = useModels();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const effectiveModel = (effectiveConfig?.model as string) ?? '';
  const effectiveBaseUrl = (effectiveConfig?.baseUrl as string) ?? '';

  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    severity: 'success' | 'warning' | 'error';
  } | null>(null);
  const [initialized, setInitialized] = useState({
    model: false,
    baseUrl: false,
  });

  useEffect(() => {
    if (!initialized.model && !modelConfig.loading) {
      const dbValue = modelConfig.entry?.configValue as string | undefined;
      setModel(dbValue ?? effectiveModel);
      setInitialized(prev => ({ ...prev, model: true }));
    }
  }, [
    initialized.model,
    modelConfig.loading,
    modelConfig.entry,
    effectiveModel,
  ]);

  useEffect(() => {
    if (!initialized.baseUrl && !baseUrlConfig.loading) {
      const dbValue = baseUrlConfig.entry?.configValue as string | undefined;
      setBaseUrl(dbValue ?? effectiveBaseUrl);
      setInitialized(prev => ({ ...prev, baseUrl: true }));
    }
  }, [
    initialized.baseUrl,
    baseUrlConfig.loading,
    baseUrlConfig.entry,
    effectiveBaseUrl,
  ]);

  const source =
    modelConfig.source === 'database' || baseUrlConfig.source === 'database'
      ? 'database'
      : 'default';
  const saving = modelConfig.saving || baseUrlConfig.saving;
  const error = modelConfig.error || baseUrlConfig.error;

  const modelOptions = models.map(m => m.id);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testModelConnection(model.trim() || undefined);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        connected: false,
        modelFound: false,
        canGenerate: false,
        error: normalizeErrorMessage(err, 'Test failed'),
      });
    } finally {
      setTesting(false);
    }
  }, [api, model]);

  const handleSave = useCallback(async () => {
    const allWarnings: string[] = [];
    if (baseUrl.trim() && !URL_RE.test(baseUrl.trim())) {
      setToast({
        message: 'Base URL must start with http:// or https://',
        severity: 'error',
      });
      return;
    }
    try {
      if (model.trim()) {
        const result = await modelConfig.save(model.trim());
        if (result.warnings?.length) {
          allWarnings.push(...result.warnings);
        }
      }
      if (baseUrl.trim()) {
        await baseUrlConfig.save(baseUrl.trim());
      }
    } catch {
      return;
    }
    if (allWarnings.length > 0) {
      setToast({ message: allWarnings.join(' '), severity: 'warning' });
    } else {
      setToast({ message: 'Model connection saved', severity: 'success' });
    }
    onConfigSaved?.();
  }, [model, baseUrl, modelConfig, baseUrlConfig, onConfigSaved]);

  const handleReset = useCallback(async () => {
    try {
      await Promise.all([modelConfig.reset(), baseUrlConfig.reset()]);
    } catch {
      return;
    }
    setModel(effectiveModel);
    setBaseUrl(effectiveBaseUrl);
    setInitialized({ model: false, baseUrl: false });
    setToast({ message: 'Reset to YAML defaults', severity: 'success' });
  }, [modelConfig, baseUrlConfig, effectiveModel, effectiveBaseUrl]);

  if (modelConfig.loading || baseUrlConfig.loading) return null;

  return (
    <>
      <AdminSection
        title="Model Connection"
        description={`Configure the LLM model identifier and ${providerName} server URL.`}
        source={source}
        saving={saving}
        error={error}
        onSave={handleSave}
        onReset={handleReset}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <ModelSelector
            model={model}
            onModelChange={setModel}
            modelOptions={modelOptions}
            loading={modelsLoading}
            onRefresh={refreshModels}
            effectiveModel={effectiveModel}
          />
          <TextField
            label="Base URL"
            size="small"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="e.g. http://localhost:8321"
            helperText={`${providerName} server endpoint`}
            sx={{ flex: 1, minWidth: 280 }}
            error={!!baseUrl && !URL_RE.test(baseUrl)}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleTestConnection}
            disabled={testing}
            startIcon={testing ? <CircularProgress size={14} /> : undefined}
          >
            {testing ? 'Testing…' : 'Test Connection'}
          </Button>
          {testResult && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {testResult.canGenerate ? (
                <CheckCircleOutlineIcon color="success" fontSize="small" />
              ) : (
                <ErrorOutlineIcon
                  color={testResult.connected ? 'warning' : 'error'}
                  fontSize="small"
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {modelConnectionStatusText(testResult)}
              </Typography>
            </Box>
          )}
        </Box>
      </AdminSection>

      <Snackbar
        open={!!toast}
        autoHideDuration={toast?.severity === 'warning' ? 8000 : 4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};
