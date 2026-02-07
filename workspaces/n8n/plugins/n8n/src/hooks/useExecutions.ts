/*
 * Copyright 2024 The Backstage Authors
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

import { useApi } from '@backstage/core-plugin-api';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { n8nApiRef } from '../api';
import type { N8nExecution } from '../api/types';

/** @public */
export function useExecutions(
  workflowId: string,
  limit = 20,
): {
  executions: N8nExecution[];
  loading: boolean;
  error?: Error;
  retry: () => void;
} {
  const api = useApi(n8nApiRef);

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    if (!workflowId) {
      return [];
    }
    return api.getExecutions(workflowId, limit);
  }, [workflowId, limit]);

  return {
    executions: value ?? [],
    loading,
    error: error as Error | undefined,
    retry,
  };
}
