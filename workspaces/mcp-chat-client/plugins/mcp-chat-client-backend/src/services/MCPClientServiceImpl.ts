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
import { ServerConfig } from '../types';
import { executeToolCall, findNpxPath } from '../utils';
import {
  ChatMessage,
  LLMProvider,
  Tool,
  ToolCall,
} from '../providers/base-provider';
import { MCPClientService } from './MCPClientService';

export type Options = {
  logger: LoggerService;
  config: RootConfigService;
};

export class MCPClientServiceImpl implements MCPClientService {
  private readonly logger: LoggerService;
  private readonly config: RootConfigService;
  private llmProvider!: LLMProvider;
  private readonly mcpClients: Map<string, Client> = new Map();
  private tools: any[] = [];
  private connected = false;

  constructor(options: Options) {
    this.logger = options.logger;
    this.config = options.config;
    this.initializeLLMProvider();
  }

  private initializeLLMProvider(): void {
    this.logger.info('Initializing MCPClientService');

    try {
      const providerConfig = getConfig(this.config);
      this.llmProvider = ProviderFactory.createProvider(providerConfig);
      console.log(
        `Using LLM Provider: ${providerConfig.type}, Model: ${providerConfig.model}`,
      );
    } catch (error) {
      console.error('Failed to initialize LLM provider:', error);
      throw error;
    }
  }

  async initMCP(serverConfigs: ServerConfig[]): Promise<void> {
    if (this.connected) return;

    const allTools = [];

    for (const serverConfig of serverConfigs) {
      const client = new Client({
        name: `${serverConfig.name}-client`,
        version: '1.0.0',
      });

      let transport;

      // Determine connection type - default to stdio if no url, streamable-http if url without explicit type
      const connectionType =
        serverConfig.type || (serverConfig.url ? 'streamable-http' : 'stdio');

      if (connectionType === 'streamable-http') {
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
        console.log(
          `Connecting to MCP server '${
            serverConfig.name
          }' via Streamable HTTP at ${serverConfig.url}${
            serverConfig.headers ? ' with auth headers' : ''
          }`,
        );
      } else if (connectionType === 'sse') {
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
        console.log(
          `Connecting to MCP server '${serverConfig.name}' via SSE at ${
            serverConfig.url
          }${serverConfig.headers ? ' with auth headers' : ''}`,
        );
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

        console.log(
          `Connecting to MCP server '${serverConfig.name}' via STDIO`,
        );
      }

      // Connect the client with the appropriate transport
      await client.connect(transport);

      const toolsResult = await client.listTools();

      const serverTools = toolsResult.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
        serverId: serverConfig.name, // Track which server this tool belongs to
      }));

      allTools.push(...serverTools);
      this.mcpClients.set(serverConfig.name, client);

      console.log(
        `MCP Server '${serverConfig.name}' connected with tools:`,
        serverTools.map(t => t.function.name),
      );
    }

    this.tools = allTools;
    this.connected = true;
    console.log(
      'All MCP servers connected. Total tools:',
      this.tools.map(t => t.function.name),
    );
  }

  async processQuery(
    messagesInput: any[],
    enabledTools: string[] = [],
  ): Promise<{
    reply: string;
    toolCalls: ToolCall[];
    toolResponses: any[];
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          "You are a helpful assistant. When using tools, provide a clear, readable summary of the results rather than showing raw data. Focus on answering the user's question with the information gathered.",
      },
      ...messagesInput,
    ];

    // Filter tools based on enabled servers
    const filteredTools =
      enabledTools.length > 0
        ? this.tools.filter(tool => enabledTools.includes(tool.serverId))
        : this.tools;

    // Remove serverId from tools when sending to LLM
    const llmTools: Tool[] = filteredTools.map(({ serverId, ...tool }) => tool);

    try {
      const response = await this.llmProvider.sendMessage(messages, llmTools);
      const replyMessage = response.choices[0].message;
      console.log('LLM reply message:', replyMessage);
      const toolCalls = replyMessage.tool_calls || [];

      if (toolCalls.length > 0) {
        const toolResponses = [];

        for (const toolCall of toolCalls) {
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
    } catch (error) {
      throw error;
    }
  }

  getAvailableTools() {
    return this.tools;
  }

  async getProviderConfig() {
    return getProviderInfo(this.config);
  }

  getProviderStatus() {
    try {
      const info = getProviderInfo(this.config);
      return {
        ...info,
        connected: true,
      };
    } catch (error) {
      return {
        provider: 'unknown',
        model: 'unknown',
        baseURL: 'unknown',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testProviderConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      if (!this.llmProvider) {
        this.initializeLLMProvider();
      }

      return await this.llmProvider.testConnection();
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
