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
 * Metadata field definition for input forms
 * @public
 */
export interface MetadataField {
  name: string;
  label?: string;
  type?:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'boolean';
  required?: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

/**
 * Metadata request for user input
 * @public
 */
export interface MetadataRequest {
  requestId?: string;
  title?: string;
  description?: string;
  fields: MetadataField[];
  artifactName?: string;
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
  metadataRequest?: MetadataRequest; // CopilotKit-style metadata input request
  metadataResponse?: Record<string, any>; // User's response to metadata request
  streamedOutput?: string; // Complete streaming history for collapsed container
  hasFinalResult?: boolean; // Whether partial_result was received
  skipCleaning?: boolean; // Skip markdown cleaning for final results
  executionPlan?: string; // Execution plan for this message (persisted to history)
  executionPlanHistory?: string[]; // History of execution plan updates
}
