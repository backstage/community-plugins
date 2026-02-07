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
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { n8nApiRef } from '../api';
import { N8N_ANNOTATION } from '../constants';
import type { N8nWorkflow } from '../api/types';

/** @public */
export function useWorkflows(): {
  workflows: N8nWorkflow[];
  loading: boolean;
  error?: Error;
  retry: () => void;
} {
  const api = useApi(n8nApiRef);
  const { entity } = useEntity();

  const workflowIds =
    entity.metadata.annotations?.[N8N_ANNOTATION]?.split(',').map(id =>
      id.trim(),
    ) ?? [];

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    if (workflowIds.length === 0) {
      return [];
    }

    const results = await Promise.all(
      workflowIds.map(id => api.getWorkflow(id)),
    );
    return results;
  }, [workflowIds.join(',')]);

  return {
    workflows: value ?? [],
    loading,
    error: error as Error | undefined,
    retry,
  };
}
