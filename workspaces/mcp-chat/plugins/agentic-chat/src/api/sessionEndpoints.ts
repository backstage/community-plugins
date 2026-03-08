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
import type { ChatSessionSummary, SessionMessagesResponse } from '../types';
import { jsonBody } from './fetchHelpers';

export interface SessionApiDeps {
  fetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
  fetchJsonSafe: <T>(
    path: string,
    fallback: T,
    init?: RequestInit,
  ) => Promise<T>;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

// ---------------------------------------------------------------------------
// Chat Sessions (local DB)
// ---------------------------------------------------------------------------

export async function listSessions(
  deps: SessionApiDeps,
  limit?: number,
  offset?: number,
): Promise<ChatSessionSummary[]> {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', limit.toString());
  if (offset !== undefined) params.set('offset', offset.toString());
  const qs = params.toString();
  const path = qs ? `/sessions?${qs}` : '/sessions';
  const data = await deps.fetchJson<{ sessions?: ChatSessionSummary[] }>(path);
  return data.sessions || [];
}

export async function createSession(
  deps: SessionApiDeps,
  title?: string,
): Promise<ChatSessionSummary> {
  const data = await deps.fetchJson<{ session: ChatSessionSummary }>(
    '/sessions',
    jsonBody({ title }),
  );
  return data.session;
}

export async function deleteSession(
  deps: SessionApiDeps,
  sessionId: string,
): Promise<boolean> {
  const data = await deps.fetchJsonSafe<{ success?: boolean }>(
    `/sessions/${sessionId}`,
    { success: false },
    { method: 'DELETE' },
  );
  return data.success === true;
}

export async function getSessionMessages(
  deps: SessionApiDeps,
  sessionId: string,
): Promise<SessionMessagesResponse> {
  const baseUrl = await deps.discoveryApi.getBaseUrl('agentic-chat');
  const response = await deps.fetchApi.fetch(
    `${baseUrl}/sessions/${sessionId}/messages`,
  );
  if (!response.ok) {
    if (response.status === 404) return { messages: [] };
    throw await ResponseError.fromResponse(response);
  }
  const data = await response.json();
  return {
    messages: data.messages || [],
    sessionCreatedAt: data.sessionCreatedAt,
  };
}

// ---------------------------------------------------------------------------
// Admin Sessions
// ---------------------------------------------------------------------------

export async function listAllSessions(
  deps: SessionApiDeps,
): Promise<ChatSessionSummary[]> {
  const data = await deps.fetchJson<{ sessions?: ChatSessionSummary[] }>(
    '/admin/sessions',
  );
  return data.sessions || [];
}

export async function getAdminSessionMessages(
  deps: SessionApiDeps,
  sessionId: string,
): Promise<SessionMessagesResponse> {
  const baseUrl = await deps.discoveryApi.getBaseUrl('agentic-chat');
  const response = await deps.fetchApi.fetch(
    `${baseUrl}/admin/sessions/${sessionId}/messages`,
  );
  if (!response.ok) {
    if (response.status === 404) return { messages: [] };
    throw await ResponseError.fromResponse(response);
  }
  const data = await response.json();
  return {
    messages: data.messages || [],
    sessionCreatedAt: data.sessionCreatedAt,
  };
}
