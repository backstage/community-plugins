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
  executionPlan?: string; // Add execution plan support
  isStreaming?: boolean; // Add streaming state support
}
