/*
 * Copyright 2026 The Backstage Authors
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

import { useState, useEffect } from 'react';
import {
  useApi,
  fetchApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { parseWorkflow } from '@backstage-community/plugin-argo-workflows-common';
import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';

/**
 * Hook to fetch the detail of a single Argo Workflow by namespace and name.
 *
 * Calls `GET /api/argo-workflows/workflows/:namespace/:name` with the
 * provided parameters.
 *
 * @param options - The query options
 * @returns An object with the workflow, loading state, and error
 *
 * @public
 */
export function useArgoWorkflowDetail(options: {
  namespace: string;
  name: string;
  instanceName?: string;
}): {
  workflow: Workflow | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const { namespace, name, instanceName } = options;
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const [workflow, setWorkflow] = useState<Workflow | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function fetchWorkflowDetail() {
      setLoading(true);
      setError(undefined);

      try {
        const baseUrl = await discoveryApi.getBaseUrl('argo-workflows');
        const params = new URLSearchParams();
        if (instanceName) {
          params.set('instanceName', instanceName);
        }

        const queryString = params.toString();
        const url = `${baseUrl}/workflows/${encodeURIComponent(
          namespace,
        )}/${encodeURIComponent(name)}${queryString ? `?${queryString}` : ''}`;

        const response = await fetchApi.fetch(url);

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `Failed to fetch workflow detail: ${response.status} ${
              response.statusText
            }${body ? ` - ${body}` : ''}`,
          );
        }

        const data = await response.json();
        const parsed = parseWorkflow(data as Record<string, unknown>);

        if (!cancelled) {
          setWorkflow(parsed);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setWorkflow(undefined);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWorkflowDetail();

    return () => {
      cancelled = true;
    };
  }, [namespace, name, instanceName, fetchApi, discoveryApi]);

  return { workflow, loading, error };
}
