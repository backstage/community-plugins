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
import { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { useApiQuery } from './useApiQuery';

export interface ModelInfo {
  id: string;
  owned_by?: string;
  model_type?: string;
}

/**
 * Fetches the list of available models from the inference server.
 * Returns models on mount with a manual refresh capability.
 */
export function useModels() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.listModels(), [api]);
  const {
    data: models,
    loading,
    error,
    refresh,
  } = useApiQuery({
    fetcher,
    initialValue: [] as ModelInfo[],
  });

  return { models, loading, error, refresh };
}
