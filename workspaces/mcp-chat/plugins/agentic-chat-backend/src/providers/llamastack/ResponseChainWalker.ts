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
import type { LoggerService } from '@backstage/backend-plugin-api';
import type {
  ConversationClientAccessor,
  ConversationDetails,
} from './conversationTypes';
import { toErrorMessage } from '../../services/utils';
import {
  extractContentFromItem,
  extractUserInputFromRaw,
} from './MessageProcessor';
import { RESPONSE_CHAIN_TIMEOUT_MS } from '../../constants';

/** Response shape from Llama Stack GET /v1/openai/v1/responses */
export interface ResponseListApiResult {
  data: Array<{
    id: string;
    model: string;
    status: string;
    created_at: number;
    input: Array<{
      type: string;
      content?: string | Array<{ type: string; text?: string }>;
      role?: string;
    }>;
    output: Array<{
      type: string;
      role?: string;
      content?: string | Array<{ type: string; text?: string }>;
    }>;
    previous_response_id?: string;
    conversation?: string;
  }>;
  has_more: boolean;
  last_id?: string;
}

/**
 * Walk the previous_response_id chain to reconstruct full conversation
 * history. Used as a fallback for legacy responses that lack a
 * conversationId. Returns messages in chronological order.
 *
 * Guards:
 * - Max depth of 50 to prevent infinite loops.
 * - Per-request timeout of 15 s — if the chain is very long and the
 *   upstream server is slow, we return whatever we've collected so far
 *   rather than hanging indefinitely.
 * - Visited-set to break cycles (defensive against bad data).
 */
export async function walkResponseChain(
  responseId: string,
  getConversation: (responseId: string) => Promise<ConversationDetails | null>,
  logger: LoggerService,
): Promise<Array<{ role: 'user' | 'assistant'; text: string }>> {
  const MAX_DEPTH = 50;
  const deadline = Date.now() + RESPONSE_CHAIN_TIMEOUT_MS;

  const chain: Array<{ role: 'user' | 'assistant'; text: string }> = [];
  const visited = new Set<string>();

  let currentId: string | undefined = responseId;
  let depth = 0;

  while (currentId && depth < MAX_DEPTH) {
    if (visited.has(currentId)) {
      logger.warn(`Cycle detected in response chain at ${currentId}, stopping`);
      break;
    }
    if (Date.now() > deadline) {
      logger.warn(
        `Chain walk timed out after ${RESPONSE_CHAIN_TIMEOUT_MS}ms at depth ${depth}, returning partial result`,
      );
      break;
    }

    visited.add(currentId);
    depth++;

    try {
      const response = await getConversation(currentId);
      if (!response) break;

      // Extract assistant output
      if (response.output) {
        for (const output of response.output) {
          if (
            output.type === 'message' &&
            output.role === 'assistant' &&
            output.content
          ) {
            const text = extractContentFromItem(output.content);
            if (text.trim()) {
              chain.push({ role: 'assistant', text });
            }
            break;
          }
        }
      }

      const userText = extractUserInputFromRaw(response.input);
      if (userText.trim()) {
        chain.push({ role: 'user', text: userText });
      }

      currentId = response.previousResponseId;
    } catch {
      logger.debug('Response chain walk stopped due to fetch error');
      break;
    }
  }

  chain.reverse();
  logger.info(
    `Walked response chain for ${responseId}: ${chain.length} messages across ${depth} responses`,
  );
  return chain;
}

/**
 * HTTP call to list responses from Llama Stack GET /v1/openai/v1/responses
 */
export async function fetchResponsesFromApi(
  clientAccessor: ConversationClientAccessor,
  limit: number,
  order: 'asc' | 'desc',
  after: string | undefined,
  logger: LoggerService,
): Promise<ResponseListApiResult> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    order,
  });
  if (after) {
    params.set('after', after);
  }

  logger.info(
    `Fetching conversations: /v1/openai/v1/responses?${params.toString()}`,
  );

  try {
    const client = clientAccessor.getClient();
    const response = await client.request<ResponseListApiResult>(
      `/v1/openai/v1/responses?${params.toString()}`,
      { method: 'GET' },
    );

    logger.info(
      `Llama Stack returned ${
        (response.data || []).length
      } responses, has_more: ${response.has_more}`,
    );

    return response;
  } catch (error) {
    logger.error(`Failed to fetch conversations: ${toErrorMessage(error)}`);
    throw error;
  }
}
