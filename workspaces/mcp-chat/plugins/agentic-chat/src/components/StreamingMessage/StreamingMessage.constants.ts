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
 * StreamingMessage Constants
 *
 * Centralized constants for streaming phases, event types, and UI configuration.
 */

// =============================================================================
// STREAMING PHASES
// =============================================================================

/**
 * All possible streaming phases
 */
export const STREAMING_PHASES = {
  CONNECTING: 'connecting',
  THINKING: 'thinking',
  REASONING: 'reasoning',
  DISCOVERING_TOOLS: 'discovering_tools',
  SEARCHING: 'searching',
  CALLING_TOOLS: 'calling_tools',
  PENDING_APPROVAL: 'pending_approval',
  GENERATING: 'generating',
  COMPLETED: 'completed',
} as const;

// =============================================================================
// NORMALIZED EVENT TYPES
// =============================================================================

/**
 * Provider-agnostic normalized streaming event types.
 * The backend normalizes all provider-specific events to this format
 * before sending them to the frontend via SSE.
 */
export const EVENT_TYPES = {
  STREAM_STARTED: 'stream.started',
  STREAM_TEXT_DELTA: 'stream.text.delta',
  STREAM_TEXT_DONE: 'stream.text.done',
  STREAM_REASONING_DELTA: 'stream.reasoning.delta',
  STREAM_REASONING_DONE: 'stream.reasoning.done',
  STREAM_TOOL_DISCOVERY: 'stream.tool.discovery',
  STREAM_TOOL_STARTED: 'stream.tool.started',
  STREAM_TOOL_DELTA: 'stream.tool.delta',
  STREAM_TOOL_COMPLETED: 'stream.tool.completed',
  STREAM_TOOL_FAILED: 'stream.tool.failed',
  STREAM_TOOL_APPROVAL: 'stream.tool.approval',
  STREAM_RAG_RESULTS: 'stream.rag.results',
  STREAM_COMPLETED: 'stream.completed',
  STREAM_ERROR: 'stream.error',
} as const;

/**
 * Tool call statuses
 */
export const TOOL_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING_APPROVAL: 'pending_approval',
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Phase labels (colors come from branding)
 */
export const PHASE_LABELS: Record<string, string> = {
  [STREAMING_PHASES.CONNECTING]: 'Thinking',
  [STREAMING_PHASES.THINKING]: 'Thinking',
  [STREAMING_PHASES.REASONING]: 'Thinking',
  [STREAMING_PHASES.DISCOVERING_TOOLS]: 'Working',
  [STREAMING_PHASES.SEARCHING]: 'Searching',
  [STREAMING_PHASES.CALLING_TOOLS]: 'Working',
  [STREAMING_PHASES.PENDING_APPROVAL]: 'Needs approval',
  [STREAMING_PHASES.GENERATING]: 'Responding',
  [STREAMING_PHASES.COMPLETED]: 'Done',
};

/**
 * Phase loading messages
 */
export const PHASE_MESSAGES: Record<string, string> = {
  [STREAMING_PHASES.CONNECTING]: 'Preparing...',
  [STREAMING_PHASES.THINKING]: 'Thinking...',
  [STREAMING_PHASES.REASONING]: '',
  [STREAMING_PHASES.DISCOVERING_TOOLS]: 'Working...',
  [STREAMING_PHASES.SEARCHING]: 'Searching...',
  [STREAMING_PHASES.CALLING_TOOLS]: 'Working...',
  [STREAMING_PHASES.PENDING_APPROVAL]: 'Waiting for approval...',
  [STREAMING_PHASES.GENERATING]: 'Responding...',
};

/**
 * Phase color keys - maps phases to branding color properties
 * This allows components to get colors from branding dynamically
 */
export type BrandingColorKey =
  | 'primaryColor'
  | 'secondaryColor'
  | 'successColor'
  | 'warningColor'
  | 'errorColor'
  | 'infoColor';

export const PHASE_COLOR_KEYS: Record<string, BrandingColorKey> = {
  [STREAMING_PHASES.CONNECTING]: 'primaryColor',
  [STREAMING_PHASES.THINKING]: 'secondaryColor',
  [STREAMING_PHASES.REASONING]: 'secondaryColor',
  [STREAMING_PHASES.DISCOVERING_TOOLS]: 'secondaryColor',
  [STREAMING_PHASES.SEARCHING]: 'infoColor',
  [STREAMING_PHASES.CALLING_TOOLS]: 'warningColor',
  [STREAMING_PHASES.PENDING_APPROVAL]: 'errorColor',
  [STREAMING_PHASES.GENERATING]: 'successColor',
  [STREAMING_PHASES.COMPLETED]: 'successColor',
};

/**
 * Default phase label
 */
export const DEFAULT_PHASE_LABEL = 'Processing...';

/**
 * Default color key for unknown phases
 */
export const DEFAULT_PHASE_COLOR_KEY: BrandingColorKey = 'primaryColor';
