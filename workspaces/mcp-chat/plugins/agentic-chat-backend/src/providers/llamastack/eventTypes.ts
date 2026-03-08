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

/**
 * Typed interfaces for Llama Stack SSE event shapes.
 * Used by EventNormalizer to avoid Record<string, unknown> casts.
 */

export interface LlamaStackResponseEvent {
  type: string;
  response_id?: string;
  response?: {
    id?: string;
    model?: string;
    status?: string;
    status_reason?: string;
    created_at?: number;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
      input_tokens_details?: { cached_tokens?: number };
      output_tokens_details?: { reasoning_tokens?: number };
    };
    error?: { message?: string; code?: string };
    output?: Array<Record<string, unknown>>;
  };
}

export interface LlamaStackOutputItemEvent {
  type: string;
  item?: {
    type?: string;
    id?: string;
    call_id?: string;
    name?: string;
    arguments?: string;
    output?: string;
    error?: string;
    server_label?: string;
    role?: string;
    status?: string;
    content?: Array<{ type?: string; text?: string }>;
    queries?: Array<unknown>;
    results?: Array<{
      text?: string;
      score?: number;
      file_id?: string;
      filename?: string;
      name?: string;
      attributes?: Record<string, unknown>;
    }>;
  };
}

export interface LlamaStackErrorEvent {
  type: string;
  error?: string | { message?: string };
}

export interface LlamaStackTextDeltaEvent {
  type: string;
  delta?: string;
  part?: { type?: string; text?: string };
}

export function hasResponse(event: unknown): event is LlamaStackResponseEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'response' in event &&
    typeof (event as Record<string, unknown>).response === 'object'
  );
}

export function hasItem(event: unknown): event is LlamaStackOutputItemEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'item' in event &&
    typeof (event as Record<string, unknown>).item === 'object'
  );
}

export function hasPart(event: unknown): event is LlamaStackTextDeltaEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'part' in event &&
    typeof (event as Record<string, unknown>).part === 'object'
  );
}

export function hasError(event: unknown): event is LlamaStackErrorEvent {
  return typeof event === 'object' && event !== null && 'error' in event;
}
