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

import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import type { ProviderDescriptor } from '@backstage-community/plugin-agentic-chat-common';
import type {
  Workflow,
  QuickAction,
  SwimLane,
  AdminConfigKey,
  AdminConfigEntry,
  McpTestConnectionResult,
  SafetyStatusResponse,
  EvaluationStatusResponse,
} from '../types';
import type { PromptCapabilities } from '../types';
import { jsonBody } from './fetchHelpers';

export interface AdminApiDeps {
  fetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export async function listProviders(
  deps: AdminApiDeps,
): Promise<{ providers: ProviderDescriptor[]; activeProviderId: string }> {
  return deps.fetchJson('/admin/providers');
}

export async function getActiveProvider(
  deps: AdminApiDeps,
): Promise<{ providerId: string }> {
  return deps.fetchJson('/admin/active-provider');
}

export async function setActiveProvider(
  deps: AdminApiDeps,
  providerId: string,
): Promise<{ success: boolean; providerId: string; error?: string }> {
  return deps.fetchJson(
    '/admin/active-provider',
    jsonBody({ providerId }, 'PUT'),
  );
}

// ---------------------------------------------------------------------------
// Admin Config
// ---------------------------------------------------------------------------

export async function getEffectiveConfig(
  deps: AdminApiDeps,
): Promise<Record<string, unknown>> {
  const data = await deps.fetchJson<{ config?: Record<string, unknown> }>(
    '/admin/effective-config',
  );
  return data.config ?? {};
}

export async function getAdminConfig(
  deps: AdminApiDeps,
  key: AdminConfigKey,
): Promise<{
  entry: AdminConfigEntry | null;
  source: 'database' | 'default';
}> {
  const data = await deps.fetchJson<{
    entry?: AdminConfigEntry | null;
    source: 'database' | 'default';
  }>(`/admin/config/${key}`);
  return { entry: data.entry ?? null, source: data.source };
}

export async function setAdminConfig(
  deps: AdminApiDeps,
  key: AdminConfigKey,
  value: unknown,
): Promise<{ warnings?: string[] }> {
  const data = await deps.fetchJson<{ warnings?: string[] }>(
    `/admin/config/${key}`,
    jsonBody({ value }, 'PUT'),
  );
  return { warnings: data.warnings };
}

export async function deleteAdminConfig(
  deps: AdminApiDeps,
  key: AdminConfigKey,
): Promise<{ deleted: boolean }> {
  return deps.fetchJson(`/admin/config/${key}`, { method: 'DELETE' });
}

export async function listAdminConfig(
  deps: AdminApiDeps,
): Promise<
  Array<{ configKey: AdminConfigKey; updatedAt: string; updatedBy: string }>
> {
  const data = await deps.fetchJson<{
    entries?: Array<{
      configKey: AdminConfigKey;
      updatedAt: string;
      updatedBy: string;
    }>;
  }>('/admin/config');
  return data.entries ?? [];
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export async function listModels(
  deps: AdminApiDeps,
): Promise<Array<{ id: string; owned_by?: string; model_type?: string }>> {
  const baseUrl = await deps.discoveryApi.getBaseUrl('agentic-chat');
  const response = await deps.fetchApi.fetch(`${baseUrl}/admin/models`);
  if (!response.ok) {
    if (response.status === 501) return [];
    throw await ResponseError.fromResponse(response);
  }
  const data = await response.json();
  return data.models ?? [];
}

export async function generateSystemPrompt(
  deps: AdminApiDeps,
  description: string,
  model?: string,
  capabilities?: PromptCapabilities,
): Promise<string> {
  const body: Record<string, unknown> = { description };
  if (model) body.model = model;
  if (capabilities) body.capabilities = capabilities;
  const data = await deps.fetchJson<{ prompt: string }>(
    '/admin/generate-system-prompt',
    jsonBody(body),
  );
  return data.prompt;
}

// ---------------------------------------------------------------------------
// Safety & Evaluation
// ---------------------------------------------------------------------------

export async function getSafetyStatus(
  deps: AdminApiDeps,
): Promise<SafetyStatusResponse> {
  return deps.fetchJson('/safety/status');
}

export async function getEvaluationStatus(
  deps: AdminApiDeps,
): Promise<EvaluationStatusResponse> {
  return deps.fetchJson('/evaluation/status');
}

// ---------------------------------------------------------------------------
// Model & MCP Testing
// ---------------------------------------------------------------------------

export async function testModelConnection(
  deps: AdminApiDeps,
  model?: string,
): Promise<{
  connected: boolean;
  modelFound: boolean;
  canGenerate: boolean;
  error?: string;
}> {
  return deps.fetchJson('/admin/test-model', jsonBody({ model }));
}

export async function testMcpConnection(
  deps: AdminApiDeps,
  url: string,
  type?: string,
  headers?: Record<string, string>,
): Promise<McpTestConnectionResult> {
  const body: Record<string, unknown> = { url, type };
  if (headers && Object.keys(headers).length > 0) {
    body.headers = headers;
  }
  return deps.fetchJson('/admin/mcp/test-connection', jsonBody(body));
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function getWorkflows(deps: AdminApiDeps): Promise<Workflow[]> {
  const data = await deps.fetchJson<{ workflows?: Workflow[] }>('/workflows');
  return data.workflows || [];
}

export async function getQuickActions(
  deps: AdminApiDeps,
): Promise<QuickAction[]> {
  const data = await deps.fetchJson<{ quickActions?: QuickAction[] }>(
    '/quick-actions',
  );
  return data.quickActions || [];
}

export async function getSwimLanes(deps: AdminApiDeps): Promise<SwimLane[]> {
  const data = await deps.fetchJson<{ swimLanes?: SwimLane[] }>('/swim-lanes');
  return data.swimLanes || [];
}
