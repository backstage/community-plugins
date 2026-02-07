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

import fetch from 'node-fetch';
import { NotFoundError } from '@backstage/errors';
import type {
  N8nWorkflow,
  N8nExecution,
  N8nWorkflowListResponse,
  N8nExecutionListResponse,
} from '../types';

/** @public */
export class N8nApi {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: { baseUrl: string; apiKey: string }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    path: string,
    options?: { method?: string; body?: unknown },
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const response = await fetch(url, {
      method: options?.method ?? 'GET',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(`n8n resource not found: ${path}`);
      }
      const text = await response.text();
      throw new Error(`n8n API request failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    const allWorkflows: N8nWorkflow[] = [];
    let cursor: string | undefined;

    do {
      const params = new URLSearchParams({ limit: '250' });
      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await this.request<N8nWorkflowListResponse>(
        `/workflows?${params.toString()}`,
      );
      allWorkflows.push(...response.data);
      cursor = response.nextCursor;
    } while (cursor);

    return allWorkflows;
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(
      `/workflows/${encodeURIComponent(workflowId)}`,
    );
  }

  async getExecutions(workflowId: string, limit = 20): Promise<N8nExecution[]> {
    const params = new URLSearchParams({
      workflowId,
      limit: String(limit),
    });

    const response = await this.request<N8nExecutionListResponse>(
      `/executions?${params.toString()}`,
    );
    return response.data;
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
