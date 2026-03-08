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
 * StreamingMessage Module
 *
 * Exports for the streaming message component and its state management.
 */

// Component
export { StreamingMessage } from './StreamingMessage';

// Types
export type {
  StreamingState,
  ToolCallState,
  RAGSourceInfo,
  PendingApprovalInfo,
  StreamingPhase,
  PhaseInfo,
} from './StreamingMessage.types';

// State management
export {
  createInitialStreamingState,
  updateStreamingState,
} from './StreamingMessage.reducer';

// Constants
export {
  STREAMING_PHASES,
  EVENT_TYPES,
  TOOL_STATUS,
  PHASE_LABELS,
  PHASE_MESSAGES,
  PHASE_COLOR_KEYS,
  DEFAULT_PHASE_LABEL,
  DEFAULT_PHASE_COLOR_KEY,
} from './StreamingMessage.constants';
export type { BrandingColorKey } from './StreamingMessage.constants';
