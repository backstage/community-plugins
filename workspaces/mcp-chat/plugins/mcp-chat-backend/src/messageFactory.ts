/*
 * Copyright 2026 The Backstage Authors
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

import { v4 as uuid } from 'uuid';
import { ChatMessage, MessageMetadata, ToolCall } from './types';

/**
 * Builds a new unique message metadata object.
 *
 * @returns Fresh {@link MessageMetadata} with a UUID and current timestamp
 * @public
 */
export function buildMessageMetadata(): MessageMetadata {
  return {
    id: uuid(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a system message.
 *
 * @param content - The system prompt text
 * @returns A {@link ChatMessage} with role `system`
 * @public
 */
export function systemMessage(content: string): ChatMessage {
  return {
    role: 'system',
    content,
    metadata: buildMessageMetadata(),
  };
}

/**
 * Creates a user message.
 *
 * @param content - The user's input text
 * @returns A {@link ChatMessage} with role `user`
 * @public
 */
export function userMessage(content: string): ChatMessage {
  return {
    role: 'user',
    content,
    metadata: buildMessageMetadata(),
  };
}

/**
 * Creates an assistant message with text content.
 *
 * @param content - The assistant's reply text
 * @returns A {@link ChatMessage} with role `assistant`
 * @public
 */
export function assistantMessage(content: string): ChatMessage {
  return {
    role: 'assistant',
    content,
    metadata: buildMessageMetadata(),
  };
}

/**
 * Creates an assistant message containing tool calls (content is null).
 *
 * @param toolCalls - Array of tool calls the assistant wants to invoke
 * @returns A {@link ChatMessage} with role `assistant` and null content
 * @public
 */
export function assistantToolCallMessage(toolCalls: ToolCall[]): ChatMessage {
  return {
    role: 'assistant',
    content: null,
    tool_calls: toolCalls,
    metadata: buildMessageMetadata(),
  };
}

/**
 * Creates a tool response message.
 *
 * @param content - The tool execution result or error text
 * @param toolCallId - ID of the tool call this message responds to
 * @returns A {@link ChatMessage} with role `tool`
 * @public
 */
export function toolMessage(content: string, toolCallId: string): ChatMessage {
  return {
    role: 'tool',
    content,
    tool_call_id: toolCallId,
    metadata: buildMessageMetadata(),
  };
}
