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
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import * as path from 'path';
import {
  ProviderFactory,
  getProviderConfig as getConfig,
  getProviderInfo,
} from '../providers/provider-factory';
import { executeToolCall, findNpxPath, loadServerConfigs } from '../utils';
import { LLMProvider } from '../providers/base-provider';
import { MCPClientService } from './MCPClientService';
import {
  ChatMessage,
  Tool,
  MCPServer,
  MCPServerStatusData,
  ProviderStatusData,
  QueryResponse,
  ServerTool,
  MCPServerType,
} from '../types';

export type Options = {
  logger: LoggerService;
  config: RootConfigService;
};

export class MCPClientServiceImpl implements MCPClientService {
  private readonly logger: LoggerService;
  private readonly config: RootConfigService;
  private llmProvider: LLMProvider;
  private readonly mcpClients: Map<string, Client> = new Map();
  private tools: ServerTool[] = [];
  private connected = false;
  private mcpServers: Promise<MCPServer[]> | null = null;
  private readonly systemPrompt: string;

  constructor(options: Options) {
    this.logger = options.logger;
    this.config = options.config;
    this.llmProvider = this.initializeLLMProvider();
    this.mcpServers = this.initializeMCPServers();
    this.systemPrompt =
      this.config.getOptionalString('mcpChat.systemPrompt') ||
      "You are a helpful assistant. When using tools, provide a clear, readable summary of the results rather than showing raw data. Focus on answering the user's question with the information gathered.";
  }

  private initializeLLMProvider(): LLMProvider {
    try {
      const providerConfig = getConfig(this.config);
      const llmProvider = ProviderFactory.createProvider(providerConfig);
      this.logger.info(
        `Using LLM Provider: ${providerConfig.type}, Model: ${providerConfig.model}`,
      );
      return llmProvider;
    } catch (error) {
      this.logger.error('Failed to initialize LLM provider:', error);
      throw error;
    }
  }

  async initializeMCPServers(): Promise<MCPServer[]> {
    // If initialization is already in progress or completed, return the same promise
    if (this.mcpServers) {
      return this.mcpServers;
    }

    this.mcpServers = this.mcpServerInit();
    return this.mcpServers;
  }

  private async mcpServerInit(): Promise<MCPServer[]> {
    if (this.connected) {
      // Return current status if already connected
      return this.mcpServers ? await this.mcpServers : [];
    }

    const allTools: ServerTool[] = [];
    const serverResults: MCPServer[] = [];
    const serverConfigs = loadServerConfigs(this.config);

    for (const serverConfig of serverConfigs) {
      const isValid = !!(
        serverConfig?.url ||
        serverConfig?.npxCommand ||
        serverConfig?.scriptPath
      );

      const baseServerConfig = {
        id: serverConfig.id,
        name: serverConfig.name,
        type: serverConfig.type,
        url: serverConfig?.url,
        npxCommand: serverConfig?.npxCommand,
        scriptPath: serverConfig?.scriptPath,
        args: serverConfig?.args,
      };

      try {
        const client = new Client({
          name: `${serverConfig.name}-client`,
          version: '1.0.0',
        });

        let transport;

        if (serverConfig.type === MCPServerType.STREAMABLE_HTTP) {
          // Streamable HTTP connection
          if (!serverConfig.url) {
            throw new Error(
              `Server config for '${serverConfig.name}' with streamable-http type must have a url`,
            );
          }

          const transportOptions: any = {};

          // Add headers if provided
          if (serverConfig.headers) {
            transportOptions.requestInit = {
              headers: serverConfig.headers,
            };
          }

          transport = new StreamableHTTPClientTransport(
            new URL(serverConfig.url),
            transportOptions,
          );
        } else if (serverConfig.type === MCPServerType.SSE) {
          // SSE connection
          if (!serverConfig.url) {
            throw new Error(
              `Server config for '${serverConfig.name}' with SSE type must have a url`,
            );
          }

          const transportOptions: any = { url: new URL(serverConfig.url) };

          // Add headers if provided
          if (serverConfig.headers) {
            transportOptions.headers = serverConfig.headers;
          }

          transport = new SSEClientTransport(transportOptions);
        } else {
          // STDIO connection (default)
          let command: string;
          let args: string[];

          if (serverConfig.npxCommand) {
            // Use npm command - find npx executable
            try {
              command = await findNpxPath();
              args = [
                '-y',
                serverConfig.npxCommand,
                ...(serverConfig.args || []),
              ];
            } catch (error) {
              throw new Error(
                `Failed to find npx for server '${serverConfig.name}': ${
                  error instanceof Error ? error.message : error
                }. Please ensure Node.js is properly installed with npx available.`,
              );
            }
          } else if (serverConfig.scriptPath) {
            // Use script path
            const isPythonScript = serverConfig.scriptPath.endsWith('.py');
            const isWindows = process.platform === 'win32';

            if (isPythonScript) {
              command = isWindows ? 'python' : 'python3';
            } else {
              command = process.execPath;
            }
            args = [serverConfig.scriptPath, ...(serverConfig.args || [])];
          } else {
            throw new Error(
              `Server config for '${serverConfig.name}' must have either scriptPath, npxCommand, or url`,
            );
          }

          transport = new StdioClientTransport({
            command,
            args,
            env: {
              ...process.env, // Inherit current environment
              ...serverConfig.env, // Add config-specific env vars
              // Ensure node is in PATH when using npx
              ...(serverConfig.npxCommand && {
                PATH: `${path.dirname(process.execPath)}:${
                  process.env.PATH || ''
                }`,
              }),
            },
          });
        }

        // Connect the client with the appropriate transport
        await client.connect(transport);

        const toolsResult = await client.listTools();

        const serverTools: ServerTool[] = toolsResult.tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description ?? '', // Ensure string
            parameters: tool.inputSchema,
          },
          serverId: serverConfig.id, // Track which server this tool belongs to
        }));

        allTools.push(...serverTools);
        this.mcpClients.set(serverConfig.id, client);

        // Record successful connection
        serverResults.push({
          ...baseServerConfig,
          status: {
            valid: isValid,
            connected: true,
          },
        });

        this.logger.info(
          `MCP Server '${serverConfig.name}' connected via ${
            serverConfig.type
          } with tools: ${serverTools.map(t => t.function.name).join(', ')}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Record failed connection
        serverResults.push({
          ...baseServerConfig,
          status: {
            valid: isValid,
            connected: false,
            error: errorMessage,
          },
        });

        this.logger.warn(
          `Failed to connect to MCP server '${serverConfig.name}': ${errorMessage}`,
        );
      }
    }

    this.tools = allTools;
    this.connected = true;

    const connectedServers = serverResults.filter(
      s => s.status.connected,
    ).length;
    const totalServers = serverConfigs.length;
    const failedServers = serverResults.filter(s => !s.status.connected);

    if (failedServers.length > 0) {
      this.logger.info(
        `MCP initialization completed: ${connectedServers}/${totalServers} servers connected successfully. Failed servers: ${failedServers
          .map(s => s.name)
          .join(', ')}`,
      );
    } else {
      this.logger.info(
        `All MCP servers connected successfully. Total tools: ${this.tools.length}`,
      );
    }

    return serverResults;
  }

  async processQuery(
    messagesInput: any[],
    enabledTools: string[] = [],
  ): Promise<QueryResponse> {
    // Only add system message if one doesn't already exist
    const messages: ChatMessage[] = [...messagesInput];
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: this.systemPrompt,
      });
    }

    // Filter tools based on enabled servers
    const filteredTools =
      enabledTools.length > 0
        ? this.tools.filter(tool => enabledTools.includes(tool.serverId))
        : this.tools;

    // Remove serverId from tools when sending to LLM
    const llmTools: Tool[] = filteredTools.map(({ serverId, ...tool }) => tool);

    const response = await this.llmProvider.sendMessage(messages, llmTools);
    const replyMessage = response.choices[0].message;
    this.logger.info(
      `LLM response received with ${
        replyMessage.tool_calls?.length || 0
      } tool calls`,
    );
    const toolCalls = replyMessage.tool_calls || [];

    if (toolCalls.length > 0) {
      const toolResponses = [];

      for (const toolCall of toolCalls) {
        try {
          const toolResponse = await executeToolCall(
            toolCall,
            this.tools,
            this.mcpClients,
          );
          toolResponses.push(toolResponse);

          messages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          });

          messages.push({
            role: 'tool',
            content: toolResponse.result,
            tool_call_id: toolCall.id,
          });
        } catch (error) {
          const errorMessage = `Error executing tool '${
            toolCall.function.name
          }': ${error instanceof Error ? error.message : error}`;

          this.logger.warn(errorMessage);

          // Still add the tool call and error response to maintain conversation flow
          const errorResponse = {
            id: toolCall.id,
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments || '{}'),
            result: errorMessage,
            serverId: 'error',
          };

          toolResponses.push(errorResponse);

          messages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          });

          messages.push({
            role: 'tool',
            content: errorMessage,
            tool_call_id: toolCall.id,
          });
        }
      }

      const followUp = await this.llmProvider.sendMessage(messages);

      return {
        reply: followUp.choices[0].message.content || '',
        toolCalls,
        toolResponses,
      };
    }

    return {
      reply: replyMessage.content || '',
      toolCalls: [],
      toolResponses: [],
    };
  }

  getAvailableTools(): ServerTool[] {
    return this.tools;
  }

  async getProviderStatus(): Promise<ProviderStatusData> {
    try {
      const info = getProviderInfo(this.config);
      const status = await this.llmProvider.testConnection();

      // Structure for future multi-provider support
      const providers = [
        {
          id: info.provider,
          model: info.model,
          baseUrl: info.baseURL,
          connection: {
            connected: status.connected,
            models: status.models || [],
            error: status.error,
          },
        },
      ];

      const summary = {
        totalProviders: providers.length,
        healthyProviders: providers.filter(
          p => p.connection?.connected === true,
        ).length,
      };

      return {
        providers,
        summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(
        `Failed to test provider connection: ${
          error instanceof Error ? error.message : error
        }`,
      );
      return {
        providers: [],
        summary: {
          totalProviders: 0,
          healthyProviders: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMCPServerStatus(): Promise<MCPServerStatusData> {
    if (!this.mcpServers) {
      return {
        total: 0,
        valid: 0,
        active: 0,
        servers: [],
        timestamp: new Date().toISOString(),
      };
    }
    const servers = await this.mcpServers;
    return {
      total: servers.length,
      valid: servers.filter(s => s.status.valid).length,
      active: servers.filter(s => s.status.connected).length,
      servers,
      timestamp: new Date().toISOString(),
    };
  }
}
