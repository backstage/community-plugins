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
import type { LlamaStackClient } from './LlamaStackClient';
import type { McpAuthService } from './McpAuthService';
import type { ConversationService } from './ConversationService';
import type {
  EffectiveConfig,
  MCPServerConfig,
  ResponsesApiTool,
  ResponsesApiFileSearchTool,
  ResponsesApiMcpTool,
} from '../../types';
import { McpProxyService } from './McpProxyService';

/**
 * Dependencies for building tools (matches ChatDeps).
 */
export interface ToolsBuilderDeps {
  client: LlamaStackClient;
  config: EffectiveConfig;
  mcpServers: MCPServerConfig[];
  mcpAuth: McpAuthService | null;
  conversations: ConversationService | null;
  /** MCP namespacing proxy instance (used when conflicts detected). */
  mcpProxy?: McpProxyService;
  /** Whether proxy mode is active (tool name conflicts exist). */
  proxyModeEnabled?: boolean;
}

/**
 * Build the tools array for the Responses API request.
 * All config is read from the passed-in deps.
 *
 * @param enableRAG - Whether to include file_search tool
 * @param deps - Chat dependencies (client, config, mcpServers, mcpAuth, conversations)
 * @param logger - Logger for diagnostics
 * @param logPrefix - Optional prefix for log messages (e.g., '[Stream] ')
 */
export async function buildTools(
  enableRAG: boolean,
  deps: ToolsBuilderDeps,
  logger: LoggerService,
  logPrefix: string = '',
): Promise<ResponsesApiTool[]> {
  const { config, mcpServers, mcpAuth } = deps;
  const tools: ResponsesApiTool[] = [];

  if (logPrefix && mcpServers.length > 0) {
    logger.info(
      `${logPrefix}MCP servers resolved: ${mcpServers
        .map(
          s =>
            `${s.id}(staticHeaders=${
              s.headers ? Object.keys(s.headers).join(',') : 'none'
            })`,
        )
        .join(', ')}`,
    );
  }

  if (enableRAG) {
    const dedupedStoreIds = [...new Set(config.vectorStoreIds)];
    if (dedupedStoreIds.length > 0) {
      const fileSearchTool: ResponsesApiFileSearchTool = {
        type: 'file_search',
        vector_store_ids: dedupedStoreIds,
      };
      if (config.fileSearchMaxResults) {
        fileSearchTool.max_num_results = config.fileSearchMaxResults;
      }
      if (config.fileSearchScoreThreshold) {
        fileSearchTool.ranking_options = {
          score_threshold: config.fileSearchScoreThreshold,
        };
      }
      tools.push(fileSearchTool);
      logger.info(
        `${logPrefix}file_search tool added: stores=${dedupedStoreIds.join(
          ',',
        )}, maxResults=${config.fileSearchMaxResults ?? 'default'}`,
      );
    } else {
      logger.warn(
        `${logPrefix}RAG enabled but no vector store IDs configured — file_search tool will not be added`,
      );
    }
  }

  const useProxy = deps.proxyModeEnabled && deps.mcpProxy;

  if (useProxy && logPrefix) {
    logger.info(
      `${logPrefix}MCP proxy mode ACTIVE — tool names will be prefixed with server IDs`,
    );
  }

  if (mcpServers.length > 0 && mcpAuth) {
    const headerResults = !useProxy
      ? await Promise.all(mcpServers.map(s => mcpAuth.getServerHeaders(s)))
      : mcpServers.map((): Record<string, string> => ({}));

    for (let i = 0; i < mcpServers.length; i++) {
      const server = mcpServers[i];
      const headers = headerResults[i];

      const approvalConfig = mcpAuth.getApiApprovalConfig(
        server.requireApproval,
      );

      if (logPrefix) {
        logger.info(
          `${logPrefix}MCP server ${
            server.id
          } HITL require_approval: ${JSON.stringify(approvalConfig)}`,
        );
      }

      const serverUrl = useProxy
        ? deps.mcpProxy!.getProxyUrl(server.id)
        : server.url;

      const mcpTool: ResponsesApiMcpTool = {
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
        if (logPrefix) {
          logger.info(
            `${logPrefix}MCP server ${server.id} limited to ${server.allowedTools.length} allowed tools`,
          );
        }
      }

      if (!useProxy) {
        if (Object.keys(headers).length > 0) {
          mcpTool.headers = headers;
          if (logPrefix) {
            logger.info(
              `${logPrefix}MCP server ${server.id} auth: Authorization=${
                headers.Authorization
                  ? `present(${headers.Authorization.length} chars)`
                  : 'absent'
              }, totalHeaders=${Object.keys(headers).length}`,
            );
          }
        } else if (logPrefix) {
          logger.warn(
            `${logPrefix}MCP server ${server.id} has NO headers/auth — Llama Stack will connect unauthenticated`,
          );
        }
      } else if (logPrefix) {
        logger.info(
          `${logPrefix}MCP server ${server.id} routed through proxy: ${serverUrl}`,
        );
      }

      tools.push(mcpTool);
    }
  } else if (mcpServers.length > 0 && !mcpAuth) {
    for (const server of mcpServers) {
      logger.warn(
        `${logPrefix}Skipping MCP server ${server.id}: McpAuthService not initialized`,
      );
    }
  }

  if (config.functions) {
    for (const func of config.functions) {
      tools.push({
        type: 'function',
        name: func.name,
        description: func.description,
        parameters: func.parameters,
        strict: func.strict ?? true,
      });
    }
  }

  if (config.enableWebSearch) {
    tools.push({ type: 'web_search' });
  }

  if (config.enableCodeInterpreter) {
    tools.push({ type: 'code_interpreter' });
  }

  return tools;
}
