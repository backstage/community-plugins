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
import { APPROVAL_OUTPUT_LOG_MAX_LENGTH } from '../../constants';
import type { ApprovalResult } from './conversationTypes';

/**
 * Build the Responses API request body for an approval continuation.
 *
 * Uses the native Llama Stack `mcp_approval_response` input type for
 * both approvals and rejections, keeping conversation state consistent.
 */
export function buildApprovalRequest(opts: {
  model: string;
  approved: boolean;
  responseId: string;
  approvalRequestId: string;
  toolName?: string;
  toolArguments?: string;
  conversationId?: string;
  tools: Array<Record<string, unknown>>;
}): Record<string, unknown> {
  return {
    model: opts.model,
    input: [
      {
        type: 'mcp_approval_response',
        approval_request_id: opts.approvalRequestId,
        approve: opts.approved,
      },
    ],
    previous_response_id: opts.responseId,
    store: true,
    tools: opts.tools,
  };
}

/**
 * Parse the Responses API reply after an approval continuation.
 * Extracts tool execution results, LLM message, and error state.
 *
 * Handles chained tool calls: if the model requests approval for a
 * second tool after the first executes, we capture the pending
 * approval in the result so the frontend can show the dialog again.
 */
export function parseApprovalResponse(
  response: {
    id: string;
    output: Array<{
      type: string;
      id?: string;
      output?: string;
      error?: string;
      content?: Array<{ type: string; text: string }>;
      name?: string;
      server_label?: string;
      arguments?: string;
    }>;
  },
  approved: boolean,
  toolName: string | undefined,
  logger: LoggerService,
): ApprovalResult {
  let llmMessage = '';
  let toolExecuted = false;
  let executedToolName = toolName || 'unknown';
  let toolOutput = '';
  let toolError = '';
  let executedServerLabel: string | undefined;
  let pendingApproval: ApprovalResult['pendingApproval'];

  for (const item of response.output) {
    logger.info(
      `[HITL] Processing output item: type=${item.type}, name=${
        item.name ?? 'n/a'
      }, hasOutput=${
        item.output !== null && item.output !== undefined && item.output !== ''
      }, hasError=${!!item.error}, snippet=${JSON.stringify(item).substring(
        0,
        APPROVAL_OUTPUT_LOG_MAX_LENGTH,
      )}`,
    );

    if (item.type === 'message' && item.content) {
      for (const part of item.content) {
        if (part.type === 'output_text' || part.type === 'text') {
          llmMessage += part.text;
        }
      }
    } else if (item.type === 'mcp_call') {
      toolExecuted = true;
      if (item.name) {
        executedToolName = item.name;
      }
      if (item.server_label) {
        executedServerLabel = item.server_label;
      }
      if (item.output) {
        logger.info(
          `[HITL] MCP tool "${executedToolName}" executed successfully (output length=${item.output.length})`,
        );
        toolOutput = item.output;
      } else {
        logger.warn(
          `[HITL] MCP tool "${executedToolName}" returned no output (output=${JSON.stringify(
            item.output,
          )})`,
        );
      }
      if (item.error) {
        logger.warn(
          `[HITL] MCP tool "${executedToolName}" returned error: ${item.error}`,
        );
        toolError = item.error;
      }
    } else if (item.type === 'mcp_approval_request') {
      logger.info(
        `[HITL] Chained approval request: id=${item.id}, name=${item.name}, server=${item.server_label}`,
      );
      pendingApproval = {
        approvalRequestId: item.id || '',
        toolName: item.name || '',
        serverLabel: item.server_label,
        arguments: item.arguments,
      };
    } else if (item.type !== 'mcp_list_tools') {
      logger.info(`[HITL] Skipping unhandled output item type: ${item.type}`);
    }
  }

  // Strip proxy prefix (e.g. "ocp_mcp__projects_list" → "projects_list")
  // for user-facing messages so the UI shows clean tool names.
  const displayName = (() => {
    if (executedServerLabel) {
      const pfx = `${executedServerLabel.replace(/-/g, '_')}__`;
      if (executedToolName.startsWith(pfx)) {
        return executedToolName.slice(pfx.length);
      }
    }
    return executedToolName;
  })();

  let content = '';
  if (!approved) {
    content = `🚫 **Tool Rejected:** \`${displayName}\`\n\nThe operation was cancelled.`;
  } else if (toolError) {
    content = `❌ **Tool Failed:** \`${displayName}\`\n\n**Error:** ${toolError}`;
  } else if (toolExecuted) {
    if (
      llmMessage &&
      llmMessage.trim() &&
      llmMessage.trim().toLowerCase() !== 'ok'
    ) {
      content = llmMessage;
    } else {
      content = `Tool \`${displayName}\` executed successfully. See tool details for output.`;
    }
  } else {
    content =
      llmMessage || `Tool \`${displayName}\` approved but no output received.`;
  }

  logger.info(
    `[HITL] Approval result: toolExecuted=${toolExecuted}, hasOutput=${!!toolOutput}, hasError=${!!toolError}, hasPendingApproval=${!!pendingApproval}, contentLength=${
      content.length
    }`,
  );

  return {
    content,
    responseId: response.id,
    toolExecuted,
    toolOutput: toolOutput || undefined,
    pendingApproval,
  };
}
