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
 * StreamingMessage State Reducer
 *
 * Handles state updates for normalized streaming events from the backend.
 * The backend normalizes all provider-specific events (Llama Stack, ADK, etc.)
 * into a common format before sending them to the frontend.
 *
 * This reducer is provider-agnostic — it only processes normalized events.
 */

import type { ResponseUsage } from '@backstage-community/plugin-agentic-chat-common';
import { StreamingEvent } from '../../types';
import { StreamingState, ToolCallState } from './StreamingMessage.types';
import {
  STREAMING_PHASES,
  EVENT_TYPES,
  TOOL_STATUS,
} from './StreamingMessage.constants';

// =============================================================================
// INITIAL STATE FACTORY
// =============================================================================

export function createInitialStreamingState(): StreamingState {
  return {
    phase: STREAMING_PHASES.CONNECTING,
    toolCalls: [],
    filesSearched: [],
    ragSources: [],
    text: '',
    completed: false,
  };
}

// =============================================================================
// MAIN REDUCER
// =============================================================================

/**
 * Updates streaming state based on incoming normalized events.
 *
 * Each event type maps cleanly to a state update:
 * - stream.started → set responseId, model, transition to thinking
 * - stream.text.delta → append text, transition to generating
 * - stream.tool.* → manage tool call lifecycle
 * - stream.rag.results → populate RAG sources
 * - stream.completed → finalize with usage stats
 */
export function updateStreamingState(
  state: StreamingState,
  event: StreamingEvent,
): StreamingState {
  if (!event || !event.type) {
    return state;
  }

  // Guard: once HITL approval is pending, only process stream lifecycle
  // and tool-data events. Discard text, reasoning, RAG, and discovery
  // events that would otherwise override the PENDING_APPROVAL phase.
  if (state.phase === STREAMING_PHASES.PENDING_APPROVAL) {
    switch (event.type) {
      case EVENT_TYPES.STREAM_STARTED:
      case EVENT_TYPES.STREAM_COMPLETED:
      case EVENT_TYPES.STREAM_ERROR:
      case EVENT_TYPES.STREAM_TOOL_APPROVAL:
      case EVENT_TYPES.STREAM_TOOL_COMPLETED:
      case EVENT_TYPES.STREAM_TOOL_FAILED:
      case EVENT_TYPES.STREAM_TOOL_DELTA:
        break;
      default:
        return state;
    }
  }

  switch (event.type) {
    // ---- Response lifecycle ----

    case EVENT_TYPES.STREAM_STARTED: {
      const started = event as {
        responseId?: string;
        model?: string;
        createdAt?: number;
      };
      return {
        ...state,
        phase: STREAMING_PHASES.THINKING,
        responseId: started.responseId || state.responseId,
        model: started.model || state.model,
        serverTimestamp: started.createdAt || state.serverTimestamp,
      };
    }

    case EVENT_TYPES.STREAM_COMPLETED: {
      const usage = (event as { usage?: ResponseUsage }).usage;
      if (state.phase === STREAMING_PHASES.PENDING_APPROVAL) {
        return { ...state, completed: true, usage: usage || state.usage };
      }
      return {
        ...state,
        phase: STREAMING_PHASES.COMPLETED,
        completed: true,
        usage: usage || state.usage,
      };
    }

    case EVENT_TYPES.STREAM_ERROR: {
      const errorEvent = event as { error?: string; code?: string };
      const errorMessage = errorEvent.error || 'Unknown error';
      return {
        ...state,
        phase: STREAMING_PHASES.COMPLETED,
        completed: true,
        errorCode: errorEvent.code,
        text: state.text || `Error: ${errorMessage}`,
      };
    }

    // ---- Text streaming ----

    case EVENT_TYPES.STREAM_TEXT_DELTA:
      return {
        ...state,
        phase: STREAMING_PHASES.GENERATING,
        text: state.text + ((event as { delta?: string }).delta || ''),
      };

    case EVENT_TYPES.STREAM_TEXT_DONE:
      return {
        ...state,
        text: (event as { text?: string }).text || state.text,
      };

    // ---- Reasoning/thinking ----

    case EVENT_TYPES.STREAM_REASONING_DELTA:
      return {
        ...state,
        phase: STREAMING_PHASES.REASONING,
        reasoning:
          (state.reasoning || '') + ((event as { delta?: string }).delta || ''),
        reasoningStartTime: state.reasoningStartTime || Date.now(),
      };

    case EVENT_TYPES.STREAM_REASONING_DONE: {
      const reasoningDuration = state.reasoningStartTime
        ? Math.round((Date.now() - state.reasoningStartTime) / 1000)
        : undefined;
      return {
        ...state,
        reasoning: (event as { text?: string }).text || state.reasoning,
        reasoningDuration,
      };
    }

    // ---- Tool discovery ----

    case EVENT_TYPES.STREAM_TOOL_DISCOVERY: {
      const discovery = event as { status?: string };
      if (discovery.status === 'in_progress') {
        return { ...state, phase: STREAMING_PHASES.DISCOVERING_TOOLS };
      }
      return {
        ...state,
        phase:
          state.phase === STREAMING_PHASES.DISCOVERING_TOOLS
            ? STREAMING_PHASES.THINKING
            : state.phase,
      };
    }

    // ---- Tool call lifecycle ----

    case EVENT_TYPES.STREAM_TOOL_STARTED: {
      const started = event as {
        callId?: string;
        name?: string;
        serverLabel?: string;
      };
      const newTool: ToolCallState = {
        id: started.callId || `tool-${Date.now()}`,
        type: 'tool_call',
        name: started.name,
        status: TOOL_STATUS.IN_PROGRESS,
        serverLabel: started.serverLabel,
      };
      return {
        ...state,
        phase: STREAMING_PHASES.CALLING_TOOLS,
        toolCalls: [...state.toolCalls, newTool],
      };
    }

    case EVENT_TYPES.STREAM_TOOL_DELTA: {
      const delta = event as { callId?: string; delta?: string };
      if (!delta.callId || !delta.delta) return state;
      return {
        ...state,
        toolCalls: state.toolCalls.map(tc =>
          tc.id === delta.callId
            ? { ...tc, arguments: (tc.arguments || '') + delta.delta }
            : tc,
        ),
      };
    }

    case EVENT_TYPES.STREAM_TOOL_COMPLETED: {
      const completed = event as {
        callId?: string;
        name?: string;
        serverLabel?: string;
        output?: string;
        error?: string;
      };
      if (!completed.callId) return state;
      return {
        ...state,
        toolCalls: state.toolCalls.map(tc =>
          tc.id === completed.callId
            ? {
                ...tc,
                status: TOOL_STATUS.COMPLETED,
                name: completed.name || tc.name,
                serverLabel: completed.serverLabel || tc.serverLabel,
                output: completed.output,
              }
            : tc,
        ),
      };
    }

    case EVENT_TYPES.STREAM_TOOL_FAILED: {
      const failed = event as {
        callId?: string;
        name?: string;
        error?: string;
      };
      if (!failed.callId) return state;
      return {
        ...state,
        toolCalls: state.toolCalls.map(tc =>
          tc.id === failed.callId
            ? {
                ...tc,
                status: TOOL_STATUS.FAILED,
                name: failed.name || tc.name,
                error: failed.error,
              }
            : tc,
        ),
      };
    }

    case EVENT_TYPES.STREAM_TOOL_APPROVAL: {
      const approval = event as {
        callId?: string;
        name?: string;
        serverLabel?: string;
        arguments?: string;
        responseId?: string;
      };
      const resolvedResponseId = approval.responseId || state.responseId || '';
      return {
        ...state,
        phase: STREAMING_PHASES.PENDING_APPROVAL,
        pendingApproval: {
          toolCallId: approval.callId || '',
          toolName: approval.name || '',
          serverLabel: approval.serverLabel,
          arguments: approval.arguments || '{}',
          responseId: resolvedResponseId,
          requestedAt: new Date().toISOString(),
        },
        toolCalls: state.toolCalls.map(tc =>
          tc.id === approval.callId
            ? {
                ...tc,
                status: TOOL_STATUS.PENDING_APPROVAL,
                requiresApproval: true,
              }
            : tc,
        ),
      };
    }

    // ---- RAG results ----

    case EVENT_TYPES.STREAM_RAG_RESULTS: {
      const ragEvent = event as {
        sources?: Array<{
          filename: string;
          fileId?: string;
          text?: string;
          score?: number;
          title?: string;
          sourceUrl?: string;
          contentType?: string;
          attributes?: Record<string, unknown>;
        }>;
        filesSearched?: string[];
      };

      if (!ragEvent.sources) return state;

      const newFilesSearched = [...state.filesSearched];
      const newRagSources = [...(state.ragSources || [])];
      const seenSourceKeys = new Set(
        newRagSources.map(s => s.sourceUrl || s.fileId || s.filename),
      );

      for (const source of ragEvent.sources) {
        const displayName = source.title || source.filename || 'Document';

        if (!newFilesSearched.includes(displayName)) {
          newFilesSearched.push(displayName);
        }

        const sourceKey = source.sourceUrl || source.fileId || displayName;
        if (seenSourceKeys.has(sourceKey)) continue;
        seenSourceKeys.add(sourceKey);

        newRagSources.push({
          filename: displayName,
          text: source.text
            ? source.text.substring(0, 200) +
              (source.text.length > 200 ? '...' : '')
            : undefined,
          score: source.score,
          fileId: source.fileId,
          title: source.title,
          sourceUrl: source.sourceUrl,
          contentType: source.contentType,
          attributes: source.attributes,
        });
      }

      return {
        ...state,
        phase:
          newRagSources.length > 0 ? STREAMING_PHASES.SEARCHING : state.phase,
        filesSearched: newFilesSearched,
        ragSources: newRagSources,
      };
    }

    default:
      return state;
  }
}
