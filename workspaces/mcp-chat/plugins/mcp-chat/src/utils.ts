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

import { ApprovalStatus, ChatMessage } from './types';

/**
 * Extracts tool requests from the last message in a conversation.
 * Returns a map of tool call IDs to their approval status if the last
 * message is an assistant message with tool calls, or undefined otherwise.
 *
 * @param messages - Array of chat messages in the conversation
 * @returns Map of tool call IDs to approval status, or undefined
 * @public
 */
export function extractLastToolRequests(
  messages: ChatMessage[],
): Record<string, ApprovalStatus> | undefined {
  const lastMsg = messages.at(-1);
  if (lastMsg?.role !== 'assistant' || !lastMsg.tool_calls) {
    return undefined;
  }
  return lastMsg.tool_calls.reduce(
    (acc, tc) => ({
      ...acc,
      [tc.id]: tc.metadata?.approval_status ?? 'pending',
    }),
    {} as Record<string, ApprovalStatus>,
  );
}
