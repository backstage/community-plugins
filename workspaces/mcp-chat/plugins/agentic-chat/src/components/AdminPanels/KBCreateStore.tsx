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
import { useState, useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { useModels } from '../../hooks';
import type { VectorStoreConfig } from '../../types';
import { CreateStoreForm } from './CreateStoreForm';
import { StoreConfigFields } from './StoreConfigFields';

interface VsConfigHandle {
  config: VectorStoreConfig | null;
  configSource: string;
  saving: boolean;
  creating: boolean;
  save: (overrides: Partial<VectorStoreConfig>) => Promise<void>;
  reset: () => Promise<void>;
  create: (
    overrides?: Record<string, unknown>,
  ) => Promise<{ vectorStoreId: string; vectorStoreName: string } | null>;
}

interface Props {
  vsConfig: VsConfigHandle;
  onCreated: (id: string, name: string) => void;
}

export const KBCreateStore = ({ vsConfig, onCreated }: Props) => {
  const {
    models,
    loading: modelsLoading,
    refresh: refreshModels,
  } = useModels();
  const [localConfig, setLocalConfig] =
    useState<Partial<VectorStoreConfig> | null>(null);
  const [createResult, setCreateResult] = useState<string | null>(null);

  const embeddingModels = useMemo(
    () => models.filter(m => m.model_type === 'embedding').map(m => m.id),
    [models],
  );

  const allModelIds = useMemo(() => models.map(m => m.id), [models]);

  useEffect(() => {
    if (vsConfig.config && !localConfig) {
      setLocalConfig({ ...vsConfig.config });
    }
  }, [vsConfig.config]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    <K extends keyof VectorStoreConfig>(
      key: K,
      value: VectorStoreConfig[K],
    ) => {
      setLocalConfig(prev =>
        prev ? { ...prev, [key]: value } : { [key]: value },
      );
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    setCreateResult(null);
    const result = await vsConfig.create(localConfig ?? undefined);
    if (result) {
      setCreateResult(
        `"${result.vectorStoreName}" created (ID: ${result.vectorStoreId})`,
      );
      onCreated(result.vectorStoreId, result.vectorStoreName);
    }
  }, [vsConfig, localConfig, onCreated]);

  const handleSave = useCallback(async () => {
    if (localConfig) await vsConfig.save(localConfig);
  }, [localConfig, vsConfig]);

  const handleReset = useCallback(async () => {
    await vsConfig.reset();
    setLocalConfig(null);
  }, [vsConfig]);

  if (!localConfig) return null;

  const nameValid = (localConfig.vectorStoreName ?? '').trim().length > 0;
  const modelValid = (localConfig.embeddingModel ?? '').trim().length > 0;
  const dimValid =
    typeof localConfig.embeddingDimension === 'number' &&
    localConfig.embeddingDimension > 0;
  const canCreate = nameValid && modelValid && dimValid && !vsConfig.creating;

  return (
    <>
      <CreateStoreForm
        localConfig={localConfig}
        embeddingModels={embeddingModels}
        allModelIds={allModelIds}
        modelsLoading={modelsLoading}
        defaultEmbeddingModel={vsConfig.config?.embeddingModel}
        onUpdate={update}
        onRefreshModels={refreshModels}
      />
      <StoreConfigFields localConfig={localConfig} onUpdate={update} />

      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSave}
          disabled={vsConfig.saving}
        >
          {vsConfig.saving ? 'Saving...' : 'Save as Defaults'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          disabled={vsConfig.saving || vsConfig.configSource === 'yaml'}
        >
          Reset
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          size="small"
          onClick={handleCreate}
          disabled={!canCreate}
          startIcon={
            vsConfig.creating ? <CircularProgress size={14} /> : <AddIcon />
          }
        >
          {vsConfig.creating ? 'Creating...' : 'Create Store'}
        </Button>
      </Box>

      {createResult && (
        <Alert
          severity="success"
          sx={{ mt: 1 }}
          onClose={() => setCreateResult(null)}
        >
          {createResult}
        </Alert>
      )}
    </>
  );
};
