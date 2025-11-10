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
 * User email mode configuration
 * @public
 */
export type UserEmailMode = 'none' | 'message' | 'metadata';

/**
 * Platform Engineer Response Schema (A2A DataPart)
 * Single source of truth for structured responses from AI Platform Engineer.
 * Now uses Jarvis-compatible field names for consistency.
 * @public
 */
export interface PlatformEngineerInputField {
  field_name: string;
  field_description: string;
  field_values?: string[] | null;
}

export interface PlatformEngineerMetadata {
  user_input?: boolean;
  input_fields?: PlatformEngineerInputField[];
}

export interface PlatformEngineerResponse {
  is_task_complete: boolean;
  require_user_input: boolean;
  content: string;
  metadata?: PlatformEngineerMetadata | null;
}

/**
 * Message interface for chat messages
 * @public
 */
export interface Message {
  messageId?: string; // Unique identifier for the message
  text?: string; // Make optional to support A2A messages
  parts?: Array<{
    kind: string;
    text?: string;
    [key: string]: any;
  }>; // Add A2A parts support
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean; // Add streaming state support
  platformEngineerResponse?: PlatformEngineerResponse; // Structured response from Platform Engineer (may include user input request)
  userInputResponse?: Record<string, any>; // User's response to input request
  streamedOutput?: string; // Complete streaming history for collapsed container
  hasFinalResult?: boolean; // Whether partial_result was received
  skipCleaning?: boolean; // Skip markdown cleaning for final results
  executionPlan?: string; // Execution plan for this message (persisted to history)
  executionPlanHistory?: string[]; // History of execution plan updates
}

export interface Feedback {
  type?: string;
  reason?: string;
  additionalFeedback?: string;
  showFeedbackOptions?: boolean;
  promptForFeedback?: boolean;
  submitted?: boolean;
}
