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
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';

/** Form data keyed by patch name, then field name. */
export type PatchesData = Record<string, Record<string, unknown>>;

export interface EntityPatchClientOptions {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

/**
 * Client for the entity-patch backend plugin REST API.
 */
export class EntityPatchClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor({ discoveryApi, fetchApi }: EntityPatchClientOptions) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
  }

  private async baseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('entity-patch');
  }

  /**
   * Fetches the current values for all patches on an entity.
   * Returns `{}` if the backend is unavailable (graceful degradation).
   */
  async getInitialValues(
    kind: string,
    namespace: string,
    name: string,
  ): Promise<PatchesData> {
    const base = await this.baseUrl();
    const response = await this.fetchApi.fetch(
      `${base}/values/${encodeURIComponent(namespace)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch initial values (${response.status}): ${await response.text()}`,
      );
    }
    return response.json();
  }

  /**
   * Persists form data for a single patch on an entity.
   */
  async savePatch(
    kind: string,
    namespace: string,
    name: string,
    patchName: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const base = await this.baseUrl();
    const response = await this.fetchApi.fetch(
      `${base}/patches/${encodeURIComponent(namespace)}/${encodeURIComponent(kind)}/${encodeURIComponent(name)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchName, data }),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to save patch (${response.status}): ${await response.text()}`,
      );
    }
  }
}
