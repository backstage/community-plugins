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

import {
  SonarCloudApiError,
  SonarCloudRateLimitError,
  SonarCloudTimeoutError,
} from './errors';
import type {
  BindProjectParams,
  CreateProjectParams,
  CreateProjectResult,
  NewCodeDefinitionType,
  QualityGate,
  QualityGateListResponse,
} from './types';

/** Delays between retry attempts for 429 responses (ms). */
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000];

/** Maximum wall-clock time for the entire retry sequence (ms). */
const RETRY_SEQUENCE_CAP_MS = 60_000;

/** Per-request timeout (ms). */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Low-level HTTP client for the SonarCloud Web API.
 *
 * Security: token only appears in Authorization headers, never in logs,
 * URLs, or error messages. When using app-config defaults (recommended),
 * the token never enters the scaffolder task payload and is not persisted
 * in the task database.
 *
 * @internal
 */
export class SonarCloudClient {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(options: { token: string; baseUrl?: string }) {
    this.token = options.token;
    this.baseUrl = (options.baseUrl ?? 'https://sonarcloud.io').replace(
      /\/$/,
      '',
    );
  }

  // ------------------------------------------------------------------ public

  /**
   * Creates a new project in SonarCloud.
   *
   * @remarks POST /api/projects/create
   */
  async createProject(
    params: CreateProjectParams & { token?: never },
  ): Promise<CreateProjectResult> {
    const body: Record<string, string> = {
      name: params.name,
      organization: params.organization,
      project: params.key,
    };
    if (params.visibility) {
      body.visibility = params.visibility;
    }

    const response = await this.request('POST', '/api/projects/create', body);
    const data = (await response.json()) as {
      project?: { key?: string; uuid?: string };
    };

    if (!data?.project?.key || !data?.project?.uuid) {
      throw new SonarCloudApiError(200, [
        'Unexpected response: missing project key or uuid in create response',
      ]);
    }

    return {
      projectKey: data.project.key,
      projectId: data.project.uuid,
      projectUrl: `${this.baseUrl}/project/overview?id=${encodeURIComponent(
        data.project.key,
      )}`,
    };
  }

  /**
   * Binds a SonarCloud project to a repository via v2 API.
   *
   * @remarks POST https://api.sonarcloud.io/dop-translation/project-bindings
   */
  async bindProject(params: BindProjectParams): Promise<void> {
    const url = 'https://api.sonarcloud.io/dop-translation/project-bindings';
    await this.requestJson('POST', url, {
      projectId: params.projectId,
      repositoryId: params.repositoryId,
    });
  }

  /**
   * Renames the main branch of a SonarCloud project.
   *
   * @remarks POST /api/project_branches/rename
   */
  async renameMainBranch(params: {
    projectKey: string;
    name: string;
  }): Promise<void> {
    await this.request('POST', '/api/project_branches/rename', {
      project: params.projectKey,
      name: params.name,
    });
  }

  /**
   * Associates a quality gate with a project.
   *
   * @remarks POST /api/qualitygates/select
   */
  async selectQualityGate(params: {
    projectKey: string;
    gateId: number;
    organization: string;
  }): Promise<void> {
    await this.request('POST', '/api/qualitygates/select', {
      projectKey: params.projectKey,
      gateId: String(params.gateId),
      organization: params.organization,
    });
  }

  /**
   * Sets the new code definition period for a project.
   *
   * @remarks SonarCloud uses sonar.leak.period.type + sonar.leak.period
   * via api/settings/set. For previous_version, resets both keys so the
   * project inherits the org default.
   *
   * Note: for number_of_days/reference_branch, two API calls are made.
   * If the second fails, the type is set but value is stale. This is
   * acceptable because SonarCloud will reject invalid type+value combos
   * at analysis time, making the partial state visible.
   */
  async setNewCodePeriod(params: {
    projectKey: string;
    type: NewCodeDefinitionType;
    value?: string;
  }): Promise<void> {
    if (params.type === 'previous_version') {
      await this.request('POST', '/api/settings/reset', {
        keys: 'sonar.leak.period,sonar.leak.period.type',
        component: params.projectKey,
      });
      return;
    }

    const leakType = params.type === 'number_of_days' ? 'days' : params.type;

    await this.request('POST', '/api/settings/set', {
      key: 'sonar.leak.period.type',
      value: leakType,
      component: params.projectKey,
    });

    if (params.value) {
      await this.request('POST', '/api/settings/set', {
        key: 'sonar.leak.period',
        value: params.value,
        component: params.projectKey,
      });
    }
  }

  /**
   * Resolves a project's internal UUID from its key via v2 API.
   */
  async getProjectId(projectKey: string): Promise<string> {
    const response = await this.requestJson(
      'GET',
      `https://api.sonarcloud.io/projects/projects?keys=${encodeURIComponent(
        projectKey,
      )}`,
    );

    const data = (await response.json()) as {
      projects?: Array<{ id?: string }>;
    };

    const id = data?.projects?.[0]?.id;
    if (!id) {
      throw new SonarCloudApiError(200, [
        `Could not resolve project UUID for key '${projectKey}'`,
      ]);
    }

    return id;
  }

  // ---------------------------------------------------------------- internal

  /**
   * Lists all quality gates for an organization.
   *
   * @remarks GET /api/qualitygates/list — validates response shape.
   */
  async listQualityGates(organization: string): Promise<QualityGate[]> {
    const raw = await this.request('GET', '/api/qualitygates/list', {
      organization,
    });

    const data = (await raw.json()) as QualityGateListResponse;

    if (!Array.isArray(data?.qualitygates)) {
      throw new SonarCloudApiError(200, [
        'Unexpected response: missing qualitygates array',
      ]);
    }

    return data.qualitygates.map(gate => {
      if (typeof gate.id !== 'number') {
        throw new SonarCloudApiError(200, [
          `Unexpected response: quality gate id is not a number (got ${typeof gate.id})`,
        ]);
      }
      return { id: gate.id, name: gate.name };
    });
  }

  // ----------------------------------------------------------------- private

  /**
   * Wraps any async operation with 429 retry + exponential backoff.
   */
  private async withRetry(fn: () => Promise<Response>): Promise<Response> {
    const retryStart = Date.now();

    for (let attempt = 0; ; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        if (err instanceof SonarCloudApiError && err.status === 429) {
          if (attempt >= RETRY_DELAYS_MS.length) {
            throw new SonarCloudRateLimitError(attempt + 1);
          }
          const elapsed = Date.now() - retryStart;
          if (elapsed + RETRY_DELAYS_MS[attempt] > RETRY_SEQUENCE_CAP_MS) {
            throw new SonarCloudRateLimitError(attempt + 1);
          }
          await new Promise(resolve =>
            setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
          );
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * JSON request to absolute URL (v2 API at api.sonarcloud.io) with retry.
   */
  private async requestJson(
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    body?: Record<string, string>,
  ): Promise<Response> {
    return this.withRetry(() => {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.token}`,
      };
      const init: RequestInit = { method, headers };
      if (body && method !== 'GET') {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }
      return this.fetchWithTimeout(url, url, init);
    });
  }

  /**
   * Form-encoded request to v1 API (relative path) with retry.
   */
  private async request(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, string>,
  ): Promise<Response> {
    return this.withRetry(() => this.executeRequest(method, path, params));
  }

  /**
   * Sends a single HTTP request with a 30-second abort timeout.
   */
  private async executeRequest(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, string>,
  ): Promise<Response> {
    const url = this.buildUrl(method, path, params);
    const init = this.buildRequestInit(method, params);
    return this.fetchWithTimeout(url, path, init);
  }

  /**
   * Wraps fetch with AbortController timeout + unified error handling.
   */
  private async fetchWithTimeout(
    url: string,
    label: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.buildApiError(response);
      }

      return response;
    } catch (err: unknown) {
      if (err instanceof SonarCloudApiError) throw err;
      if (this.isAbortError(err)) {
        throw new SonarCloudTimeoutError(label);
      }
      const message =
        err instanceof Error ? err.message : 'Unknown network error';
      throw new Error(`SonarCloud request to ${label} failed: ${message}`, {
        cause: err,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, string>,
  ): string {
    const url = new URL(path, this.baseUrl);
    if (method === 'GET') {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  private buildRequestInit(
    method: 'GET' | 'POST',
    params: Record<string, string>,
  ): RequestInit {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };

    const init: RequestInit = { method, headers };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      init.body = new URLSearchParams(params).toString();
    }

    return init;
  }

  /**
   * Parses a non-2xx response into a structured API error.
   */
  private async buildApiError(response: Response): Promise<SonarCloudApiError> {
    try {
      const body = (await response.json()) as {
        errors?: Array<{ msg: string }>;
      };
      const messages = body?.errors?.map(e => e.msg) ?? [
        `HTTP ${response.status}`,
      ];
      return new SonarCloudApiError(response.status, messages);
    } catch {
      return new SonarCloudApiError(response.status, [
        `SonarCloud returned HTTP ${response.status} with unparseable body`,
      ]);
    }
  }

  private isAbortError(err: unknown): boolean {
    return (
      err instanceof DOMException ||
      (err instanceof Error && err.name === 'AbortError')
    );
  }
}
