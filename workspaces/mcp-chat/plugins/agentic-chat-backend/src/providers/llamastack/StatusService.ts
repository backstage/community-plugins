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
import * as https from 'https';
import { MCP_TOOLS_TIMEOUT_MS, HEALTH_CHECK_TIMEOUT_MS } from '../../constants';
import {
  parseJsonRpcFromResponse,
  fetchWithTlsControl,
} from '../../services/utils/http';
import { toErrorMessage } from '../../services/utils';
import type {
  LlamaStackConfig,
  AgenticChatStatus,
  LlamaStackVectorStoreResponse,
  MCPServerConfig,
  MCPServerStatus,
  SecurityConfig,
} from '../../types';
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { MCPToolInfo } from '@backstage-community/plugin-agentic-chat-common';
import type { ClientManager } from './ClientManager';
import type { McpAuthService } from './McpAuthService';

/**
 * Dependencies passed per getStatus() call so the service
 * always operates on the latest orchestrator state.
 */
export interface StatusDeps {
  config: LlamaStackConfig | null;
  clientManager: ClientManager;
  mcpAuth: McpAuthService | null;
  mcpServers: MCPServerConfig[];
  /** IDs of servers that originate from YAML (vs admin-added) */
  yamlServerIds: Set<string>;
  securityConfig: SecurityConfig;
  vectorStoreReady: boolean;
  logger: LoggerService;
}

/**
 * Encapsulates all status and health-check logic that was previously
 * in LlamaStackOrchestrator. Each getStatus() call receives a fresh
 * StatusDeps snapshot so there are no stale references.
 */
export class StatusService {
  async getStatus(deps: StatusDeps): Promise<AgenticChatStatus> {
    const { config, clientManager, securityConfig, mcpServers } = deps;

    if (!config || !clientManager.hasClient()) {
      return {
        providerId: 'llamastack',
        provider: {
          id: 'llamastack',
          model: 'not configured',
          baseUrl: 'not configured',
          connected: false,
          error: 'Llama Stack not configured',
        },
        vectorStore: {
          id: 'not configured',
          connected: false,
          error: 'Llama Stack not configured',
        },
        mcpServers: [],
        securityMode: securityConfig.mode,
        timestamp: new Date().toISOString(),
        ready: false,
        configurationErrors: [
          'Llama Stack not configured. Add agenticChat.llamaStack.baseUrl to your app-config.yaml',
        ],
      };
    }

    const [providerResult, vectorStoreResult, mcpServerStatuses] =
      await Promise.all([
        this.checkProviderHealth(deps),
        this.checkVectorStoreHealth(deps),
        this.checkMcpServerHealth(deps),
      ]);

    const configurationErrors: string[] = [];
    if (!providerResult.connected) {
      configurationErrors.push(
        `AI Provider (Llama Stack) not connected: ${
          providerResult.error || 'Unknown error'
        }. Check agenticChat.llamaStack.baseUrl in app-config.yaml`,
      );
    } else if (!providerResult.modelAvailable) {
      configurationErrors.push(
        `Model "${config.model}" not found on the Llama Stack server. Chat may fail. Update the model in the Admin Panel.`,
      );
    }

    const mcpAvailable =
      mcpServerStatuses.length > 0 && mcpServerStatuses.some(s => s.connected);
    const mcpConfigured = mcpServers.length > 0;

    const providerError =
      providerResult.error ??
      (!providerResult.modelAvailable && providerResult.connected
        ? `Model "${config.model}" not found on server`
        : undefined);

    return {
      providerId: 'llamastack',
      provider: {
        id: 'llamastack',
        model: config.model,
        baseUrl: config.baseUrl,
        connected: providerResult.connected,
        error: providerError,
      },
      vectorStore: {
        id: config.vectorStoreIds.join(', ') || 'not configured',
        connected: vectorStoreResult.connected,
        totalDocuments: vectorStoreResult.totalDocuments,
        error: vectorStoreResult.error,
      },
      mcpServers: mcpServerStatuses,
      securityMode: securityConfig.mode,
      timestamp: new Date().toISOString(),
      ready: providerResult.connected,
      configurationErrors,
      capabilities: {
        chat: providerResult.connected,
        rag: {
          available: vectorStoreResult.connected,
          reason: !vectorStoreResult.connected
            ? vectorStoreResult.error ||
              'Vector store not initialized — trigger a sync to set up'
            : undefined,
        },
        mcpTools: {
          available: mcpAvailable,
          reason: getMcpToolsReason(
            mcpAvailable,
            mcpConfigured,
            mcpServerStatuses,
          ),
        },
      },
    };
  }

  private async checkProviderHealth(
    deps: StatusDeps,
  ): Promise<{ connected: boolean; modelAvailable: boolean; error?: string }> {
    try {
      const response = await deps.clientManager
        .getExistingClient()
        .request<{ data: Array<{ id: string }> }>('/v1/openai/v1/models', {
          method: 'GET',
        });

      const models = response.data || [];
      const modelAvailable = deps.config
        ? models.some(m => m.id === deps.config!.model)
        : false;

      return { connected: true, modelAvailable };
    } catch (error) {
      return {
        connected: false,
        modelAvailable: false,
        error: toErrorMessage(error, 'Failed to connect'),
      };
    }
  }

  private async checkVectorStoreHealth(
    deps: StatusDeps,
  ): Promise<{ connected: boolean; totalDocuments?: number; error?: string }> {
    if (!deps.vectorStoreReady) {
      return {
        connected: false,
        error: 'Not initialized yet — will be created on first sync',
      };
    }

    try {
      const storeIds = deps.config!.vectorStoreIds;
      if (!storeIds || storeIds.length === 0) {
        return { connected: false, error: 'No vector store IDs configured' };
      }
      const vectorStoreInfo = await deps.clientManager
        .getExistingClient()
        .request<LlamaStackVectorStoreResponse>(
          `/v1/openai/v1/vector_stores/${storeIds[0]}`,
          { method: 'GET' },
        );
      return {
        connected: true,
        totalDocuments: vectorStoreInfo.file_counts?.total,
      };
    } catch (error) {
      return {
        connected: false,
        error: toErrorMessage(error, 'Failed to connect'),
      };
    }
  }

  private async checkMcpServerHealth(
    deps: StatusDeps,
  ): Promise<MCPServerStatus[]> {
    return Promise.all(
      deps.mcpServers.map(async server => {
        const source: 'yaml' | 'admin' = deps.yamlServerIds.has(server.id)
          ? 'yaml'
          : 'admin';
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
            ...(server.headers || {}),
          };

          if (deps.mcpAuth) {
            const authHeaders = await deps.mcpAuth.getServerHeaders(server);
            Object.assign(headers, authHeaders);
          }

          const skipTls = deps.config?.skipTlsVerify ?? false;
          const initResponse = await this.fetchWithTlsControlLocal(
            server.url,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                  protocolVersion: '2024-11-05',
                  capabilities: {},
                  clientInfo: { name: 'agentic-chat', version: '1.0.0' },
                },
                id: 1,
              }),
            },
            skipTls,
          );

          if (!initResponse.ok) {
            return {
              id: server.id,
              name: server.name,
              url: server.url,
              connected: false,
              error: `HTTP ${initResponse.status}`,
              source,
            };
          }

          if (initResponse.sessionId) {
            headers['Mcp-Session-Id'] = initResponse.sessionId;
          }

          // After successful initialize, discover available tools
          const tools = await this.discoverMcpTools(
            deps,
            server.url,
            headers,
            skipTls,
          );

          return {
            id: server.id,
            name: server.name,
            url: server.url,
            connected: true,
            tools,
            toolCount: tools.length,
            source,
          };
        } catch (error) {
          return {
            id: server.id,
            name: server.name,
            url: server.url,
            connected: false,
            error: toErrorMessage(error, 'Failed to connect'),
            source,
          };
        }
      }),
    );
  }

  /**
   * Call MCP tools/list to discover available tools on a server.
   * Returns empty array on failure (non-blocking).
   */
  private async discoverMcpTools(
    deps: StatusDeps,
    url: string,
    headers: Record<string, string>,
    skipTls: boolean,
  ): Promise<MCPToolInfo[]> {
    try {
      // Send initialized notification first (MCP protocol requirement)
      await this.fetchWithTlsControlLocal(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
          }),
        },
        skipTls,
      );

      const response = await this.fetchJsonRpc<{
        tools?: Array<{ name: string; description?: string }>;
      }>(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/list',
            params: {},
            id: 2,
          }),
        },
        skipTls,
      );

      if (!response || !Array.isArray(response.tools)) {
        return [];
      }

      return response.tools.map(t => ({
        name: t.name,
        description: t.description,
      }));
    } catch {
      deps.logger.debug('Failed to fetch tools for MCP server status');
      return [];
    }
  }

  /**
   * JSON-RPC call that returns parsed response body.
   * Used for tools/list where we need the result payload.
   */
  private async fetchJsonRpc<T>(
    url: string,
    options: { method: string; headers: Record<string, string>; body: string },
    skipTls: boolean,
  ): Promise<T | null> {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === 'http:' || !skipTls) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        MCP_TOOLS_TIMEOUT_MS,
      );
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        if (!response.ok) return null;
        const raw = await response.text();
        const json = parseJsonRpcFromResponse(raw) as { result?: T } | null;
        return json?.result ?? null;
      } finally {
        clearTimeout(timeout);
      }
    }

    return new Promise((resolve, reject) => {
      const reqOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method,
        headers: options.headers,
        rejectUnauthorized: false,
      };

      const req = https.request(reqOptions, res => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          if (res.statusCode! < 200 || res.statusCode! >= 300) {
            resolve(null);
            return;
          }
          const raw = Buffer.concat(chunks).toString();
          const json = parseJsonRpcFromResponse(raw) as {
            result?: T;
          } | null;
          resolve(json?.result ?? null);
        });
      });

      req.on('error', e => reject(e));
      req.setTimeout(MCP_TOOLS_TIMEOUT_MS, () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      req.write(options.body);
      req.end();
    });
  }

  private async fetchWithTlsControlLocal(
    url: string,
    options: { method: string; headers: Record<string, string>; body: string },
    skipTls: boolean,
  ): Promise<{ ok: boolean; status: number; sessionId?: string }> {
    const r = await fetchWithTlsControl(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      skipTlsVerify: skipTls,
      timeoutMs: HEALTH_CHECK_TIMEOUT_MS,
    });
    return {
      ok: r.ok,
      status: r.status,
      sessionId: r.headers?.['mcp-session-id'],
    };
  }
}

function getMcpToolsReason(
  mcpAvailable: boolean,
  mcpConfigured: boolean,
  mcpServerStatuses: { id: string; connected: boolean }[],
): string | undefined {
  if (mcpAvailable) return undefined;
  if (mcpConfigured) {
    const unreachable = mcpServerStatuses
      .filter(s => !s.connected)
      .map(s => s.id)
      .join(', ');
    return `MCP servers configured but not reachable: ${unreachable}`;
  }
  return 'No MCP servers configured';
}
