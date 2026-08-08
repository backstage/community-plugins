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

/**
 * Instance type returned by the backend.
 *
 * @public
 */
export type ArgoInstanceType = 'argo-server' | 'kubernetes';

/**
 * Instance detail returned by the backend.
 *
 * @public
 */
export interface ArgoInstanceDetail {
  name: string;
  type: ArgoInstanceType;
}

/**
 * Response shape from the `GET /instances` backend endpoint.
 *
 * @public
 */
export interface ArgoInstancesResponse {
  instances: ArgoInstanceDetail[];
  defaultInstance?: string;
}

/**
 * Hook to fetch the list of configured Argo Workflows instances
 * from the backend.
 *
 * Calls `GET /api/argo-workflows/instances`.
 *
 * @returns An object with instance details, default instance, and loading state
 *
 * @public
 */
export function useArgoInstances(): {
  instances: ArgoInstanceDetail[];
  defaultInstance?: string;
  loading: boolean;
} {
  const fetchApi = useApi(fetchApiRef);
  const discoveryApi = useApi(discoveryApiRef);

  const [instances, setInstances] = useState<ArgoInstanceDetail[]>([]);
  const [defaultInstance, setDefaultInstance] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchInstances() {
      try {
        const baseUrl = await discoveryApi.getBaseUrl('argo-workflows');
        const response = await fetchApi.fetch(`${baseUrl}/instances`);

        if (response.ok) {
          const data: ArgoInstancesResponse = await response.json();
          if (!cancelled) {
            setInstances(data.instances);
            setDefaultInstance(data.defaultInstance);
          }
        }
      } catch {
        // Silently fail — the selector just won't show
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInstances();

    return () => {
      cancelled = true;
    };
  }, [fetchApi, discoveryApi]);

  return { instances, defaultInstance, loading };
}
