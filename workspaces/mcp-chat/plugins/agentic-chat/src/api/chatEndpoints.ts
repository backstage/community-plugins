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
import type {
  ChatMessage,
  ChatResponse,
  StreamingEvent,
  StreamingEventCallback,
} from '../types';
import { parseSSEStream } from './sseStreaming';
import { jsonBody } from './fetchHelpers';

export interface ChatApiDeps {
  fetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

/**
 * Non-streaming chat request.
 */
export async function chat(
  deps: ChatApiDeps,
  messages: ChatMessage[],
  enableRAG: boolean,
  signal?: AbortSignal,
  previousResponseId?: string,
  conversationId?: string,
): Promise<ChatResponse> {
  return deps.fetchJson(
    '/chat',
    jsonBody(
      { messages, enableRAG, previousResponseId, conversationId },
      'POST',
      { signal },
    ),
  );
}

/**
 * Internal SSE streaming helper shared by chatStream and chatStreamWithSession.
 * Handles timeout, fetch, SSE line parsing, event forwarding, and retry with backoff.
 */
async function streamSSE(
  deps: ChatApiDeps,
  body: Record<string, unknown>,
  onEvent: StreamingEventCallback,
  signal?: AbortSignal,
): Promise<void> {
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1000;
  const baseUrl = await deps.discoveryApi.getBaseUrl('agentic-chat');

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) return;

    if (attempt > 0) {
      onEvent({
        type: 'stream.error',
        error: `Reconnecting... (attempt ${attempt}/${MAX_RETRIES})`,
        code: 'reconnecting',
      } as StreamingEvent);
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
      if (signal?.aborted) return;
    }

    try {
      await streamSSEAttempt(deps, baseUrl, body, onEvent, signal);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (signal?.aborted) return;
      if (err instanceof DOMException && err.name === 'AbortError') throw err;

      const isRetryable =
        err instanceof TypeError ||
        (lastError.message.includes('timeout') &&
          !lastError.message.includes('5 minutes')) ||
        lastError.message.includes('Stream request failed: 5');

      if (!isRetryable || attempt === MAX_RETRIES) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Stream failed after retries');
}

/**
 * Single SSE connection attempt — extracted from streamSSE for retry logic.
 */
async function streamSSEAttempt(
  deps: ChatApiDeps,
  baseUrl: string,
  body: Record<string, unknown>,
  onEvent: StreamingEventCallback,
  signal?: AbortSignal,
): Promise<void> {
  const STREAM_CONNECT_TIMEOUT_MS = 300_000;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, STREAM_CONNECT_TIMEOUT_MS);

  const onAbort = () => {
    clearTimeout(timeoutId);
    timeoutController.abort();
  };

  if (signal) {
    signal.addEventListener('abort', onAbort);
  }

  let response: Response;
  try {
    response = await deps.fetchApi.fetch(`${baseUrl}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutController.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error(
        'Connection timeout: Server did not respond within 5 minutes. The request may have been too complex.',
      );
    }
    throw err;
  }

  if (!response.ok) {
    signal?.removeEventListener('abort', onAbort);
    let detail = '';
    try {
      const rawBody = await response.text();
      try {
        const parsed = JSON.parse(rawBody);
        detail =
          parsed.error?.message || parsed.message || parsed.error || rawBody;
      } catch {
        if (rawBody.length > 0) {
          detail = rawBody.slice(0, 200);
        }
      }
    } catch {
      // Couldn't read body at all
    }
    throw new Error(
      detail
        ? `Stream request failed: ${response.status} — ${detail}`
        : `Stream request failed: ${response.status}`,
    );
  }

  if (!response.body) {
    signal?.removeEventListener('abort', onAbort);
    throw new Error('No response body for streaming');
  }

  const reader = response.body.getReader();
  try {
    await parseSSEStream(reader, onEvent, signal);
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * Streaming chat request.
 */
export async function chatStream(
  deps: ChatApiDeps,
  messages: ChatMessage[],
  onEvent: StreamingEventCallback,
  enableRAG: boolean,
  signal?: AbortSignal,
  previousResponseId?: string,
  conversationId?: string,
): Promise<void> {
  return streamSSE(
    deps,
    { messages, enableRAG, previousResponseId, conversationId },
    onEvent,
    signal,
  );
}

/**
 * Streaming chat with session ID.
 */
export async function chatStreamWithSession(
  deps: ChatApiDeps,
  messages: ChatMessage[],
  onEvent: StreamingEventCallback,
  sessionId: string,
  enableRAG: boolean,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE(deps, { messages, enableRAG, sessionId }, onEvent, signal);
}

/**
 * Submit tool approval (continue after approval).
 */
export async function submitToolApproval(
  deps: ChatApiDeps,
  responseId: string,
  callId: string,
  approved: boolean,
  toolName?: string,
  toolArguments?: string,
  signal?: AbortSignal,
): Promise<{
  success: boolean;
  content?: string;
  responseId?: string;
  rejected?: boolean;
  toolOutput?: string;
  toolExecuted?: boolean;
  pendingApproval?: {
    approvalRequestId: string;
    toolName: string;
    serverLabel?: string;
    arguments?: string;
  };
}> {
  return deps.fetchJson(
    '/chat/approve',
    jsonBody(
      { responseId, callId, approved, toolName, toolArguments },
      'POST',
      { signal },
    ),
  );
}
