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

import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import type { N8nApi } from './N8nApi';
import type { N8nWorkflow, N8nExecution } from './types';

/** @public */
export class N8nClient implements N8nApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('n8n');
  }

  private async request<T>(
    path: string,
    options?: { method?: string },
  ): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${path}`;

    const response = await this.fetchApi.fetch(url, {
      method: options?.method ?? 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    return this.request<N8nWorkflow[]>('/workflows');
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(
      `/workflows/${encodeURIComponent(workflowId)}`,
    );
  }

  async getExecutions(workflowId: string, limit = 20): Promise<N8nExecution[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.request<N8nExecution[]>(
      `/workflows/${encodeURIComponent(
        workflowId,
      )}/executions?${params.toString()}`,
    );
  }

  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(
      `/workflows/${encodeURIComponent(workflowId)}/activate`,
      { method: 'POST' },
    );
  }

  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(
      `/workflows/${encodeURIComponent(workflowId)}/deactivate`,
      { method: 'POST' },
    );
  }
}
