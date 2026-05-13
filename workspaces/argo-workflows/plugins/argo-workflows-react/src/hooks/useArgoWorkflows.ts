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

import { useState, useEffect, useCallback } from 'react';
import {
  useApi,
  fetchApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { parseWorkflow } from '@backstage-community/plugin-argo-workflows-common';
import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';

/**
 * Hook to fetch the list of Argo Workflows filtered by label selector.
 *
 * Supports querying a single instance, multiple instances (fetched in
 * parallel and merged), or no instance (uses the backend default).
 *
 * @param options - The query options
 * @returns An object with workflows, loading state, error, and retry function
 *
 * @public
 */
export function useArgoWorkflows(options: {
  labelSelector: string;
  /** Single instance name (backward compat). */
  instanceName?: string;
  /** Multiple instance names — fetched in parallel and merged. Takes precedence over instanceName. */
  instanceNames?: string[];
  namespace?: string;
}): {
  workflows: Workflow[];
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
} {
  const { labelSelector, instanceName, instanceNames, namespace } = options;
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Stable serialized key for the instance list to use in the dep array
  const instanceKey = instanceNames
    ? instanceNames.slice().sort().join(',')
    : instanceName ?? '';

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchForInstance(
      baseUrl: string,
      name?: string,
    ): Promise<Workflow[]> {
      const params = new URLSearchParams();
      params.set('labelSelector', labelSelector);
      if (name) {
        params.set('instanceName', name);
      }
      if (namespace) {
        params.set('namespace', namespace);
      }

      const response = await fetchApi.fetch(
        `${baseUrl}/workflows?${params.toString()}`,
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Failed to fetch workflows: ${response.status} ${
            response.statusText
          }${body ? ` - ${body}` : ''}`,
        );
      }

      const data = await response.json();
      const rawWorkflows: Record<string, unknown>[] = Array.isArray(
        data.workflows,
      )
        ? data.workflows
        : [];

      return rawWorkflows.map(raw => parseWorkflow(raw));
    }

    async function fetchWorkflows() {
      setLoading(true);
      setError(undefined);

      try {
        const baseUrl = await discoveryApi.getBaseUrl('argo-workflows');

        // Determine which instances to query
        const names =
          instanceNames && instanceNames.length > 0
            ? instanceNames
            : [instanceName];

        // Fetch all instances in parallel
        const results = await Promise.all(
          names.map(async name => {
            const wfs = await fetchForInstance(baseUrl, name);
            return wfs.map(wf => ({ ...wf, _sourceInstance: name }));
          }),
        );

        // Merge and deduplicate by uid
        const seen = new Set<string>();
        const merged: Array<Workflow & { _sourceInstance?: string }> = [];
        for (const batch of results) {
          for (const wf of batch) {
            if (!seen.has(wf.metadata.uid)) {
              seen.add(wf.metadata.uid);
              merged.push(wf);
            }
          }
        }

        if (!cancelled) {
          setWorkflows(merged);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setWorkflows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWorkflows();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    labelSelector,
    instanceKey,
    namespace,
    fetchApi,
    discoveryApi,
    retryCount,
  ]);

  return { workflows, loading, error, retry };
}
