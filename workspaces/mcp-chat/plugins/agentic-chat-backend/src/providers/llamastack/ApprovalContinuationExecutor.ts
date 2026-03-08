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
import { toErrorMessage } from '../../services/utils';
import type { LlamaStackClient } from './LlamaStackClient';
import { McpAuthService } from './McpAuthService';
import { McpProxyService } from './McpProxyService';
import { MCPServerConfig } from '../../types';
import { buildApprovalRequest, parseApprovalResponse } from './ApprovalHandler';
import { createOutputSummaryForLogging } from './ConversationHelpers';
import type {
  ApprovalResult,
  ConversationClientAccessor,
} from './conversationTypes';

export interface ApprovalContinuationDeps {
  clientAccessor: ConversationClientAccessor;
  mcpAuth: McpAuthService;
  mcpServers: MCPServerConfig[];
  proxyModeEnabled: boolean;
  mcpProxy?: McpProxyService;
  getConversationForResponse: (
    responseId: string,
  ) => Promise<string | undefined>;
  registerResponse: (
    conversationId: string,
    responseId: string,
  ) => Promise<void>;
  logger: LoggerService;
}

export interface ApprovalContinuationParams {
  responseId: string;
  approvalRequestId: string;
  approved: boolean;
  toolName?: string;
  toolArguments?: string;
  conversationId?: string;
  attempt: number;
  maxAttempts: number;
}

/**
 * Executes HITL approval continuation: sends mcp_approval_response to Llama Stack,
 * parses the response, handles auto-reapproval for chained duplicate requests.
 */
export async function executeApprovalContinuation(
  deps: ApprovalContinuationDeps,
  params: ApprovalContinuationParams,
): Promise<ApprovalResult> {
  const {
    responseId,
    approvalRequestId,
    approved,
    toolName,
    toolArguments,
    conversationId,
    attempt,
    maxAttempts,
  } = params;

  const {
    clientAccessor,
    mcpAuth,
    mcpServers,
    proxyModeEnabled,
    mcpProxy,
    getConversationForResponse,
    registerResponse,
    logger,
  } = deps;

  const client: LlamaStackClient = clientAccessor.getClient();

  logger.info(
    `Continuing conversation ${responseId} after ${
      approved ? 'approval' : 'rejection'
    } for approval request ${approvalRequestId}${
      attempt > 0 ? ` (auto-reapproval attempt ${attempt})` : ''
    }`,
  );

  try {
    const tools = await buildMcpToolsPayload({
      mcpAuth,
      mcpServers,
      proxyModeEnabled,
      mcpProxy,
    });

    let resolvedConversationId = conversationId;
    if (!resolvedConversationId) {
      resolvedConversationId = await getConversationForResponse(responseId);
      if (resolvedConversationId) {
        logger.info(
          `Resolved conversationId=${resolvedConversationId} from registry for response ${responseId}`,
        );
      }
    }

    const responsesRequest = buildApprovalRequest({
      model: clientAccessor.getModel(),
      approved,
      responseId,
      approvalRequestId,
      toolName,
      toolArguments,
      conversationId: resolvedConversationId,
      tools,
    });

    logger.info(
      `Sending approval continuation request for response=${responseId}, approved=${approved}, tool=${toolName}`,
    );

    const response = await client.request<{
      id: string;
      output: Array<{
        type: string;
        id?: string;
        status?: string;
        output?: string;
        error?: string;
        content?: Array<{ type: string; text: string }>;
        name?: string;
        server_label?: string;
        arguments?: string;
      }>;
    }>('/v1/openai/v1/responses', {
      method: 'POST',
      body: JSON.stringify(responsesRequest),
    });

    const outputSummary = createOutputSummaryForLogging(response.output || []);
    logger.info(
      `Approval continuation response: id=${response.id}, outputItems=${
        response.output?.length ?? 0
      }, items=${JSON.stringify(outputSummary)}`,
    );

    if (resolvedConversationId && response.id) {
      await registerResponse(resolvedConversationId, response.id);
    }

    const result = parseApprovalResponse(response, approved, toolName, logger);

    // Auto-reapprove: Llama Stack may return a duplicate approval request
    // for the same tool because it regenerates the tool call with different
    // arguments. If the user originally approved and the chained request
    // targets the same tool, auto-approve it.
    if (
      approved &&
      result.pendingApproval &&
      result.pendingApproval.toolName === toolName &&
      attempt < maxAttempts
    ) {
      logger.info(
        `[HITL] Auto-reapproving chained approval for same tool "${toolName}" ` +
          `(attempt ${attempt + 1}/${maxAttempts}), new approvalId=${
            result.pendingApproval.approvalRequestId
          }`,
      );
      return executeApprovalContinuation(deps, {
        responseId: result.responseId,
        approvalRequestId: result.pendingApproval.approvalRequestId,
        approved: true,
        toolName,
        toolArguments: result.pendingApproval.arguments,
        conversationId: resolvedConversationId,
        attempt: attempt + 1,
        maxAttempts,
      });
    }

    return result;
  } catch (error) {
    const msg = toErrorMessage(error);
    logger.error(
      `Approval continuation failed for tool "${
        toolName ?? 'unknown'
      }": ${msg}`,
    );
    const action = approved ? 'execute' : 'reject';
    return {
      content: `Failed to ${action} tool \`${toolName ?? 'unknown'}\`: ${msg}`,
      responseId,
      toolExecuted: false,
    };
  }
}

async function buildMcpToolsPayload(opts: {
  mcpAuth: McpAuthService;
  mcpServers: MCPServerConfig[];
  proxyModeEnabled: boolean;
  mcpProxy?: McpProxyService;
}): Promise<Array<Record<string, unknown>>> {
  const { mcpAuth, mcpServers, proxyModeEnabled, mcpProxy } = opts;
  const useProxy = proxyModeEnabled && mcpProxy;

  const headerResults = !useProxy
    ? await Promise.all(mcpServers.map(s => mcpAuth.getServerHeaders(s)))
    : mcpServers.map(() => ({}));

  const tools: Array<Record<string, unknown>> = [];
  for (let i = 0; i < mcpServers.length; i++) {
    const server = mcpServers[i];
    const headers = headerResults[i];
    const approvalConfig = mcpAuth.getApiApprovalConfig(server.requireApproval);
    const serverUrl =
      useProxy && mcpProxy ? mcpProxy.getProxyUrl(server.id) : server.url;
    const mcpTool: Record<string, unknown> = {
      type: 'mcp',
      server_url: serverUrl,
      server_label: server.id,
      require_approval: approvalConfig,
    };
    if (server.allowedTools && server.allowedTools.length > 0) {
      mcpTool.allowed_tools = useProxy
        ? server.allowedTools.map(
            t => `${McpProxyService.getPrefix(server.id)}${t}`,
          )
        : server.allowedTools;
    }
    if (!useProxy && Object.keys(headers).length > 0) {
      mcpTool.headers = headers;
    }
    tools.push(mcpTool);
  }
  return tools;
}
