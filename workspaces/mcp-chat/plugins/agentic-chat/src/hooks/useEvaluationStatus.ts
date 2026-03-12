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
import { useCallback, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { EvaluationStatusResponse } from '../types';
import { useApiQuery } from './useApiQuery';

/**
 * Fetches the list of available scoring functions from the Llama Stack server.
 * Used by the Evaluation admin panel to populate scoring function selection.
 */
export function useEvaluationStatus() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.getEvaluationStatus(), [api]);
  const { data, loading, error, refresh } =
    useApiQuery<EvaluationStatusResponse | null>({
      fetcher,
      initialValue: null,
    });

  const scoringFunctions = useMemo(() => data?.scoringFunctions ?? [], [data]);
  const serverEnabled = data?.enabled ?? false;

  return { scoringFunctions, serverEnabled, loading, error, refresh };
}
