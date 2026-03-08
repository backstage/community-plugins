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

import type { ResponseUsage } from '@backstage-community/plugin-agentic-chat-common';
import type { ResponsesApiOutputEvent } from './llamaStackApi';

/**
 * A tool call awaiting user approval
 * @public
 */
export interface PendingToolApproval {
  /** Unique ID for this approval request */
  approvalId: string;
  /** The response ID from Llama Stack (for resuming) */
  responseId: string;
  /** Tool call details */
  toolCall: {
    /** Tool call ID from the API */
    callId: string;
    /** Tool name */
    name: string;
    /** MCP server label */
    serverLabel: string;
    /** Arguments as JSON string */
    arguments: string;
    /** Parsed arguments for display */
    parsedArguments: Record<string, unknown>;
  };
  /** Timestamp when approval was requested */
  requestedAt: string;
  /** Optional custom message for the approval dialog */
  confirmationMessage?: string;
  /** Severity level for UI styling */
  severity: 'info' | 'warning' | 'critical';
}

/**
 * User's response to a tool approval request
 * @public
 */
export interface ToolApprovalResponse {
  /** The approval ID being responded to */
  approvalId: string;
  /** User's decision */
  approved: boolean;
  /** Optional modified arguments (if user edited them) */
  modifiedArguments?: string;
  /** Optional reason for rejection */
  rejectionReason?: string;
}

/**
 * Result after processing an approval response
 * @public
 */
export interface ToolApprovalResult {
  /** Whether the tool was executed */
  executed: boolean;
  /** Tool output if executed */
  output?: string;
  /** Error if execution failed */
  error?: string;
  /** Whether chat should continue after this */
  continueChat: boolean;
}

/**
 * @internal
 */
export interface ResponsesApiResponse {
  id: string;
  object: 'response';
  created_at: number;
  model: string;
  status: 'completed' | 'failed' | 'cancelled';
  output: ResponsesApiOutputEvent[];
  usage?: ResponseUsage;
}

/**
 * A stored response from Llama Stack (conversation entry)
 * Mapped from GET /v1/openai/v1/responses
 * @public
 */
export interface StoredResponse {
  /** Unique response ID - use as previousResponseId to continue conversation */
  id: string;
  /** Model used for this response */
  model: string;
  /** Status of the response */
  status: 'completed' | 'failed' | 'in_progress';
  /** Unix timestamp when created */
  created_at: number;
  /** Output items from the response */
  output: Array<{
    type: string;
    id?: string;
    role?: string;
    content?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

/**
 * List of stored responses (paginated)
 * Response from GET /v1/openai/v1/responses
 * @public
 */
export interface StoredResponseList {
  /** The responses */
  data: StoredResponse[];
  /** Whether there are more results */
  has_more: boolean;
  /** First ID in the list */
  first_id?: string;
  /** Last ID in the list */
  last_id?: string;
}

/**
 * Input item from a response (conversation context)
 * Response from GET /v1/openai/v1/responses/{id}/input_items
 * @public
 */
export interface ResponseInputItem {
  /** Item type: message, function_call_output, etc. */
  type: string;
  /** Item ID */
  id?: string;
  /** Role for message types */
  role?: 'user' | 'assistant' | 'system';
  /** Content for message types */
  content?: string | Array<{ type: string; text?: string }>;
  /** Status */
  status?: string;
  /** Call ID for function outputs */
  call_id?: string;
  /** Output for function outputs */
  output?: string;
}

/**
 * List of input items for a response
 * @public
 */
export interface ResponseInputItemList {
  data: ResponseInputItem[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}
